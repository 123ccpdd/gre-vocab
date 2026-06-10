import type { Word } from '../types';

/** 导入结果 */
export interface ImportResult {
  success: Word[];    // 成功导入的词
  skipped: string[];  // 跳过的重复词名
  errors: string[];   // 解析失败的行/条目
}

/** 判断是否为简化 Word 对象（至少有 word 字段） */
function isWordLike(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>).word === 'string';
}

/** 将简化对象填充为完整 Word */
function normalizeWord(raw: Record<string, unknown>, index: number): Word {
  return {
    id: `custom-${raw.id ?? `${Date.now()}-${index}`}`,
    word: String(raw.word).trim(),
    phonetic: typeof raw.phonetic === 'string' ? raw.phonetic : '',
    meaning: typeof raw.meaning === 'string' ? raw.meaning : '（待补全）',
    pos: Array.isArray(raw.pos) ? raw.pos.map(String) : [],
    roots: Array.isArray(raw.roots) ? raw.roots as Word['roots'] : [],
    examples: Array.isArray(raw.examples) ? raw.examples as Word['examples'] : [],
    difficulty: typeof raw.difficulty === 'number' ? (raw.difficulty as Word['difficulty']) : 3,
    frequency: typeof raw.frequency === 'number' ? raw.frequency : 1,
  };
}

/** 按单词名去重，返回导入结果 */
export function deduplicateImports(newWords: Word[], existingWords: Word[]): ImportResult {
  const existingSet = new Set(existingWords.map((w) => w.word.toLowerCase()));
  const success: Word[] = [];
  const skipped: string[] = [];

  for (const w of newWords) {
    if (existingSet.has(w.word.toLowerCase())) {
      skipped.push(w.word);
    } else {
      success.push(w);
      existingSet.add(w.word.toLowerCase());
    }
  }

  return { success, skipped, errors: [] };
}

// ─── JSON 解析 ───

export function parseJSON(content: string): ImportResult {
  try {
    const parsed = JSON.parse(content);
    const items: unknown[] = Array.isArray(parsed) ? parsed : parsed.words ?? parsed.data ?? [];

    if (!Array.isArray(items)) {
      return { success: [], skipped: [], errors: ['JSON 内容不是数组格式'] };
    }

    const errors: string[] = [];
    const candidates: Word[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!isWordLike(item)) {
        errors.push(`第 ${i + 1} 条：缺少 word 字段`);
        continue;
      }
      if (!String(item.word).trim()) {
        errors.push(`第 ${i + 1} 条：word 为空`);
        continue;
      }
      candidates.push(normalizeWord(item, i));
    }

    return { success: candidates, skipped: [], errors };
  } catch (e) {
    return { success: [], skipped: [], errors: [`JSON 解析失败：${(e as Error).message}`] };
  }
}

// ─── CSV/TSV 解析 ───

/** 简易 CSV 行解析，支持引号包裹 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const CSV_HEADERS = ['word', 'phonetic', 'meaning', 'pos', 'difficulty', 'frequency'];

export function parseCSV(content: string): ImportResult {
  const lines = content.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) {
    return { success: [], skipped: [], errors: ['CSV 文件为空'] };
  }

  // 检测分隔符
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  // 解析表头
  const headers = parseCSVLine(firstLine, delimiter).map((h) => h.toLowerCase());
  const headerIndex: Record<string, number> = {};
  for (let i = 0; i < headers.length; i++) {
    // 模糊匹配表头名
    for (const expected of CSV_HEADERS) {
      if (headers[i].includes(expected)) {
        headerIndex[expected] = i;
        break;
      }
    }
  }

  // word 和 meaning 列必须有
  if (headerIndex.word === undefined) {
    return { success: [], skipped: [], errors: ['CSV 表头缺少 word 列'] };
  }

  const errors: string[] = [];
  const candidates: Word[] = [];

  // 如果没有表头（纯数据行），假设顺序为 word, phonetic, meaning, pos, difficulty, frequency
  const isHeaderRow = headers.some((h) => CSV_HEADERS.some((e) => h.includes(e)));
  const dataLines = isHeaderRow ? lines.slice(1) : lines;

  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCSVLine(dataLines[i], delimiter);
    const word = isHeaderRow ? fields[headerIndex.word ?? 0] : fields[0];

    if (!word?.trim()) {
      errors.push(`第 ${i + 1} 行：单词为空`);
      continue;
    }

    const raw: Record<string, unknown> = { word: word.trim() };

    if (isHeaderRow) {
      if (headerIndex.phonetic !== undefined) raw.phonetic = fields[headerIndex.phonetic] ?? '';
      if (headerIndex.meaning !== undefined) raw.meaning = fields[headerIndex.meaning] ?? '';
      if (headerIndex.pos !== undefined) {
        const posStr = fields[headerIndex.pos] ?? '';
        raw.pos = posStr ? posStr.split(/[;|,]/).map((p: string) => p.trim()).filter(Boolean) : [];
      }
      if (headerIndex.difficulty !== undefined) {
        const d = Number(fields[headerIndex.difficulty]);
        raw.difficulty = d >= 1 && d <= 5 ? d : 3;
      }
      if (headerIndex.frequency !== undefined) {
        const f = Number(fields[headerIndex.frequency]);
        raw.frequency = f > 0 ? f : 1;
      }
    } else {
      // 无表头时按固定顺序
      raw.phonetic = fields[1] ?? '';
      raw.meaning = fields[2] ?? '';
      const posStr = fields[3] ?? '';
      raw.pos = posStr ? posStr.split(/[;|,]/).map((p: string) => p.trim()).filter(Boolean) : [];
      const d = Number(fields[4]);
      raw.difficulty = d >= 1 && d <= 5 ? d : 3;
      const f = Number(fields[5]);
      raw.frequency = f > 0 ? f : 1;
    }

    if (!raw.meaning) raw.meaning = '（待补全）';
    candidates.push(normalizeWord(raw, i));
  }

  return { success: candidates, skipped: [], errors };
}

// ─── TXT 解析 ───

export function parseTXT(content: string): ImportResult {
  const lines = content.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) {
    return { success: [], skipped: [], errors: ['TXT 内容为空'] };
  }

  const errors: string[] = [];
  const candidates: Word[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let word = '';
    let phonetic = '';
    let meaning = '';

    // 格式1: word | 音标 | 释义
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      word = parts[0];
      phonetic = parts[1] ?? '';
      meaning = parts[2] ?? '（待补全）';
    }
    // 格式2: word - 释义
    else if (line.includes(' - ') || line.includes('—')) {
      const sep = line.includes(' - ') ? ' - ' : '—';
      const parts = line.split(sep).map((p) => p.trim());
      word = parts[0];
      meaning = parts.slice(1).join(sep) || '（待补全）';
    }
    // 格式3: 仅单词
    else {
      word = line;
      meaning = '（待补全）';
    }

    if (!word) {
      errors.push(`第 ${i + 1} 行：无法解析`);
      continue;
    }

    candidates.push(normalizeWord({ word, phonetic, meaning }, i));
  }

  return { success: candidates, skipped: [], errors };
}

// ─── 统一入口 ───

export type ImportFormat = 'json' | 'csv' | 'txt';

export function parseImport(content: string, format: ImportFormat): ImportResult {
  switch (format) {
    case 'json':
      return parseJSON(content);
    case 'csv':
      return parseCSV(content);
    case 'txt':
      return parseTXT(content);
    default:
      return { success: [], skipped: [], errors: [`不支持的格式: ${format}`] };
  }
}

/** 根据文件名推断格式 */
export function detectFormat(filename: string): ImportFormat | null {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'json') return 'json';
  if (ext === 'csv') return 'csv';
  if (ext === 'tsv') return 'csv';
  if (ext === 'txt') return 'txt';
  return null;
}