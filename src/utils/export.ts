import type { Word } from '../types';

/** 触发文件下载 */
function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 导出为 JSON 文件 */
export function exportToJSON(words: Word[], filename?: string): void {
  const json = JSON.stringify(words, null, 2);
  downloadFile(filename ?? `考研词汇_${words.length}词.json`, json, 'application/json');
}

/** 导出为 CSV 文件 */
export function exportToCSV(words: Word[], filename?: string): void {
  const headers = ['word', 'phonetic', 'meaning', 'pos', 'difficulty', 'frequency'];
  const rows = words.map((w) => {
    const pos = w.pos.join(';');
    // 含逗号的字段用引号包裹
    const meaning = w.meaning.includes(',') ? `"${w.meaning}"` : w.meaning;
    return [w.word, w.phonetic, meaning, pos, w.difficulty, w.frequency].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(filename ?? `考研词汇_${words.length}词.csv`, csv, 'text/csv;charset=utf-8');
}