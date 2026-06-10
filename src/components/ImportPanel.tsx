import { useState, useRef, useCallback } from 'react';
import type { Word } from '../types';
import { parseImport, deduplicateImports, detectFormat, type ImportFormat, type ImportResult } from '../utils/import';
import { getAllWords } from '../data/words';
import { UploadOutlined, CopyOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Tabs, Modal } from 'antd';

interface ImportPanelProps {
  onImport: (words: Word[]) => void;
  onClose: () => void;
}

export default function ImportPanel({ onImport, onClose }: ImportPanelProps) {
  const [activeFormat, setActiveFormat] = useState<ImportFormat>('json');
  const [textContent, setTextContent] = useState('');
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 解析预览
  const handleParse = useCallback(() => {
    if (!textContent.trim()) return;
    const parsed = parseImport(textContent, activeFormat);
    const existing = getAllWords();
    const deduped = deduplicateImports(parsed.success, existing);
    // 合并解析错误和去重信息
    const result: ImportResult = {
      success: deduped.success,
      skipped: [...parsed.skipped, ...deduped.skipped],
      errors: [...parsed.errors, ...deduped.errors],
    };
    setPreviewResult(result);
  }, [textContent, activeFormat]);

  // 文件上传
  const handleFile = useCallback((file: File) => {
    const format = detectFormat(file.name);
    if (!format) {
      setPreviewResult({ success: [], skipped: [], errors: [`无法识别文件格式：${file.name}`] });
      return;
    }
    setActiveFormat(format);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextContent(content);
    };
    reader.readAsText(file);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // 拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // 确认导入
  const handleConfirmImport = useCallback(() => {
    if (!previewResult) return;
    if (previewResult.success.length > 0) {
      onImport(previewResult.success);
    }
    setImportResult({
      added: previewResult.success.length,
      skipped: previewResult.skipped.length,
    });
  }, [previewResult, onImport]);

  // 重置状态
  const handleReset = useCallback(() => {
    setTextContent('');
    setPreviewResult(null);
    setImportResult(null);
  }, []);

  // 格式说明
  const formatHints: Record<ImportFormat, string> = {
    json: `支持完整 Word 结构数组或简化格式：\n[{"word":"abandon","meaning":"v. 放弃","phonetic":"/əˈbændən/"}]`,
    csv: `CSV 表头：word, phonetic, meaning, pos, difficulty, frequency\npos 用分号分隔，如 v.;n.`,
    txt: `每行一个词，支持三种格式：\n• abandon（仅单词）\n• abandon - v. 放弃（单词 + 释义）\n• abandon | /əˈbændən/ | v. 放弃（单词 | 音标 | 释义）`,
  };

  return (
    <Modal
      title="导入词库"
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* 已导入结果 */}
        {importResult && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <CheckCircleOutlined /> 导入完成
            </div>
            <p className="text-sm text-green-600">
              成功导入 {importResult.added} 个词
              {importResult.skipped > 0 && `，跳过 {importResult.skipped} 个重复词`}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
              >
                继续导入
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
              >
                完成
              </button>
            </div>
          </div>
        )}

        {/* 导入界面 */}
        {!importResult && (
          <>
            {/* 格式选择 */}
            <Tabs
              activeKey={activeFormat}
              onChange={(key) => {
                setActiveFormat(key as ImportFormat);
                setPreviewResult(null);
              }}
              items={[
                { key: 'json', label: 'JSON' },
                { key: 'csv', label: 'CSV / TSV' },
                { key: 'txt', label: 'TXT' },
              ]}
            />

            {/* 格式说明 */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-600">
              <pre className="whitespace-pre-wrap font-sans">{formatHints[activeFormat]}</pre>
            </div>

            {/* 文件上传 + 拖拽 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                isDragOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <UploadOutlined className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {activeFormat === 'json' ? '拖拽 .json 文件到此处' :
                 activeFormat === 'csv' ? '拖拽 .csv / .tsv 文件到此处' :
                 '拖拽 .txt 文件到此处'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                选择文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  activeFormat === 'json' ? '.json' :
                  activeFormat === 'csv' ? '.csv,.tsv' :
                  '.txt'
                }
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* 文本粘贴区 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CopyOutlined className="text-gray-400" />
                <span className="text-sm text-gray-600">或直接粘贴内容</span>
              </div>
              <textarea
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  setPreviewResult(null);
                }}
                placeholder={formatHints[activeFormat]}
                className="w-full h-32 px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm font-mono resize-y"
              />
            </div>

            {/* 预览按钮 */}
            {textContent.trim() && !previewResult && (
              <button
                onClick={handleParse}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                预览导入
              </button>
            )}

            {/* 预览结果 */}
            {previewResult && (
              <div className="space-y-3">
                {/* 统计 */}
                <div className="flex gap-4 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircleOutlined className="text-green-500" />
                    <span className="text-gray-700 font-medium">{previewResult.success.length} 个词可导入</span>
                  </div>
                  {previewResult.skipped.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <WarningOutlined className="text-orange-500" />
                      <span className="text-gray-600">{previewResult.skipped.length} 个重复词将跳过</span>
                    </div>
                  )}
                  {previewResult.errors.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <CloseCircleOutlined className="text-red-500" />
                      <span className="text-gray-600">{previewResult.errors.length} 个解析错误</span>
                    </div>
                  )}
                </div>

                {/* 可导入词预览 */}
                {previewResult.success.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-100">
                    <p className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-50">
                      可导入词预览（前 20 个）
                    </p>
                    <div className="max-h-48 overflow-y-auto">
                      {previewResult.success.slice(0, 20).map((w) => (
                        <div key={w.id} className="px-3 py-1.5 flex items-center gap-2 text-sm border-b border-gray-50 last:border-0">
                          <span className="font-medium text-gray-800">{w.word}</span>
                          <span className="text-gray-400 text-xs">{w.phonetic}</span>
                          <span className="text-gray-600 truncate">{w.meaning}</span>
                        </div>
                      ))}
                      {previewResult.success.length > 20 && (
                        <div className="px-3 py-2 text-xs text-gray-400 text-center">
                          ... 还有 {previewResult.success.length - 20} 个词
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 跳过词列表 */}
                {previewResult.skipped.length > 0 && (
                  <div className="bg-orange-50 rounded-lg border border-orange-100">
                    <p className="px-3 py-2 text-xs font-medium text-orange-600 border-b border-orange-100">
                      跳过的重复词
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {previewResult.skipped.map((w, i) => (
                        <div key={i} className="px-3 py-1 text-sm text-orange-500 border-b border-orange-50 last:border-0">
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 解析错误 */}
                {previewResult.errors.length > 0 && (
                  <div className="bg-red-50 rounded-lg border border-red-100">
                    <p className="px-3 py-2 text-xs font-medium text-red-600 border-b border-red-100">
                      解析错误
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {previewResult.errors.map((err, i) => (
                        <div key={i} className="px-3 py-1 text-sm text-red-500 border-b border-red-50 last:border-0">
                          {err}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 确认导入 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmImport}
                    disabled={previewResult.success.length === 0}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认导入 {previewResult.success.length} 个词
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                  >
                    重新导入
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}