import { useState, useMemo, useCallback } from 'react';
import type { Word } from '../types';
import { getAllWords, searchWords } from '../data/words';
import { useCustomWords } from '../hooks/useCustomWords';
import { exportToJSON, exportToCSV } from '../utils/export';
import { getStageLabel } from '../utils/spaced-repetition';
import { SearchOutlined, CloseCircleFilled, UpOutlined, DownOutlined, ExperimentOutlined, BulbOutlined, FileTextOutlined, LeftOutlined, RightOutlined, BookOutlined, ImportOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import ImportPanel from './ImportPanel';

const PAGE_SIZE = 50;

type FreqFilter = 'high' | 'mid' | 'low' | null;

export default function WordList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [frequencyFilter, setFrequencyFilter] = useState<FreqFilter>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { customWords, addCustomWords, clearCustomWords } = useCustomWords();

  // 获取完整词库（内置 + 自定义），refreshKey 变化时刷新
  const allWordsList = useMemo(() => {
    void refreshKey; // 依赖 refreshKey 触发刷新
    return getAllWords();
  }, [refreshKey]);

  // 筛选逻辑
  const filteredWords = useMemo(() => {
    let result: Word[];

    // 搜索
    if (searchQuery.trim()) {
      result = searchWords(searchQuery.trim());
    } else {
      result = allWordsList;
    }

    // 难度筛选
    if (difficultyFilter !== null) {
      result = result.filter((w) => w.difficulty === difficultyFilter);
    }

    // 考频筛选
    if (frequencyFilter !== null) {
      result = result.filter((w) => {
        if (frequencyFilter === 'high') return w.frequency >= 7;
        if (frequencyFilter === 'mid') return w.frequency >= 4 && w.frequency <= 6;
        return w.frequency <= 3; // low
      });
    }

    return result;
  }, [searchQuery, difficultyFilter, frequencyFilter, allWordsList]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedWords = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safeCurrentPage]);

  // 重置页码（筛选变化时）
  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setExpandedId(null);
  };

  // 导入回调
  const handleImport = useCallback((words: Word[]) => {
    addCustomWords(words);
    setRefreshKey((k) => k + 1);
  }, [addCustomWords]);

  // 导出
  const handleExportJSON = useCallback(() => {
    Modal.confirm({
      title: '导出词库',
      content: `确认导出 ${allWordsList.length} 个词汇为 JSON 文件？`,
      okText: '确认导出',
      cancelText: '取消',
      centered: true,
      onOk: () => exportToJSON(allWordsList),
    });
  }, [allWordsList]);

  const handleExportCSV = useCallback(() => {
    Modal.confirm({
      title: '导出词库',
      content: `确认导出 ${allWordsList.length} 个词汇为 CSV 文件？`,
      okText: '确认导出',
      cancelText: '取消',
      centered: true,
      onOk: () => exportToCSV(allWordsList),
    });
  }, [allWordsList]);

  // 清空自定义词库
  const handleClearCustom = useCallback(() => {
    if (customWords.length === 0) return;
    Modal.confirm({
      title: '清空自定义词库',
      content: `确认清空已导入的 ${customWords.length} 个自定义词？此操作不可撤销。`,
      okText: '确认清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      centered: true,
      onOk: () => {
        clearCustomWords();
        setRefreshKey((k) => k + 1);
      },
    });
  }, [customWords.length, clearCustomWords]);

  // 难度颜色
  const getDifficultyColor = (d: number) => {
    if (d <= 2) return 'text-green-600 bg-green-50';
    if (d <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // 考频标签
  const getFreqLabel = (f: number) => {
    if (f >= 7) return { text: '高频', cls: 'bg-orange-50 text-orange-600' };
    if (f >= 4) return { text: '中频', cls: 'bg-blue-50 text-blue-600' };
    return { text: '低频', cls: 'bg-gray-50 text-gray-500' };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 标题 + 操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900"><BookOutlined className="mr-2" />词库浏览</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1"
          >
            <ImportOutlined /> 导入
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-white text-gray-600 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1"
          >
            <ExportOutlined /> JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white text-gray-600 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1"
          >
            <ExportOutlined /> CSV
          </button>
          {customWords.length > 0 && (
            <button
              onClick={handleClearCustom}
              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm border border-red-200 hover:bg-red-100 transition flex items-center gap-1"
            >
              <DeleteOutlined /> 清空导入
            </button>
          )}
        </div>
      </div>

      {/* 自定义词数量提示 */}
      {customWords.length > 0 && (
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-600 flex items-center justify-between">
          <span>已导入 {customWords.length} 个自定义词 · 词库总计 {allWordsList.length} 词</span>
        </div>
      )}

      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="搜索单词或释义..."
          className="w-full px-4 py-3 pl-10 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm transition"
        />
        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            <CloseCircleFilled />
          </button>
        )}
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
        {/* 难度筛选 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 w-10">难度</span>
          {[null, 1, 2, 3, 4, 5].map((d) => (
            <button
              key={d ?? 'all'}
              onClick={() => handleFilterChange(setDifficultyFilter, d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                difficultyFilter === d
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {d === null ? '全部' : `${'★'.repeat(d)}`}
            </button>
          ))}
        </div>

        {/* 考频筛选 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 w-10">考频</span>
          {([
            [null, '全部'],
            ['high', '高频'],
            ['mid', '中频'],
            ['low', '低频'],
          ] as const).map(([val, label]) => (
            <button
              key={label}
              onClick={() => handleFilterChange(setFrequencyFilter, val)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                frequencyFilter === val
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 结果统计 */}
        <div className="text-xs text-gray-400">
          共 {filteredWords.length} 个词
          {searchQuery && ` · 搜索"${searchQuery}"`}
          {difficultyFilter && ` · 难度${'★'.repeat(difficultyFilter)}`}
          {frequencyFilter && ` · ${frequencyFilter === 'high' ? '高频' : frequencyFilter === 'mid' ? '中频' : '低频'}`}
        </div>
      </div>

      {/* 单词列表 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {pagedWords.length === 0 && (
          <div className="py-12 text-center text-gray-400">没有找到匹配的单词</div>
        )}
        {pagedWords.map((word) => {
          const isExpanded = expandedId === word.id;
          const freqLabel = getFreqLabel(word.frequency);
          const isCustom = word.id.startsWith('custom-');

          return (
            <div key={word.id}>
              {/* 列表行 */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : word.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3"
              >
                {/* 单词 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{word.word}</span>
                    <span className="text-xs text-gray-400">{word.phonetic}</span>
                    {isCustom && (
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs font-medium">导入</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{word.meaning}</p>
                </div>

                {/* 标签 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                    ★{word.difficulty}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${freqLabel.cls}`}>
                    {freqLabel.text}
                  </span>
                </div>

                {/* 展开箭头 */}
                <span className="text-gray-300 text-xs shrink-0">
                  {isExpanded ? <UpOutlined /> : <DownOutlined />}
                </span>
              </button>

              {/* 展开详情 */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* 词性 */}
                  <div className="flex gap-2">
                    {word.pos.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* 词根词缀 */}
                  {word.roots.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1.5">
                      <p className="text-xs font-medium text-gray-500"><ExperimentOutlined className="mr-1" />词根词缀</p>
                      {word.roots.map((root, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              root.type === 'prefix'
                                ? 'bg-blue-100 text-blue-700'
                                : root.type === 'root'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {root.type === 'prefix' ? '前缀' : root.type === 'root' ? '词根' : '后缀'}
                          </span>
                          <span className="font-mono font-medium text-gray-800">{root.part}</span>
                          <span className="text-gray-500">= {root.meaning}</span>
                          {root.origin && (
                            <span className="text-gray-400">({root.origin})</span>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                        <BulbOutlined className="mr-1 text-yellow-500" />记忆：{word.roots.map((r) => r.part).join(' + ')} → {word.meaning}
                      </p>
                    </div>
                  )}

                  {/* 真题例句 */}
                  {word.examples.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500"><FileTextOutlined className="mr-1" />真题语境</p>
                      {word.examples.map((ex, i) => (
                        <div key={i} className="text-xs">
                          <span className="inline-block px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs mb-1">
                            {ex.year}年{ex.type}
                          </span>
                          <p className="text-gray-700 leading-relaxed">{ex.sentence}</p>
                          <p className="text-gray-500 mt-0.5">{ex.translation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 额外信息 */}
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>考频 {word.frequency}</span>
                    <span>难度 {'★'.repeat(word.difficulty)}{'☆'.repeat(5 - word.difficulty)}</span>
                    <span>{getStageLabel(0)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            <LeftOutlined /> 上一页
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // 显示首页、末页、当前页附近
                return p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1;
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 rounded-lg text-sm transition ${
                      safeCurrentPage === item
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            下一页 <RightOutlined />
          </button>
        </div>
      )}

      {/* 导入面板 */}
      {showImport && (
        <ImportPanel
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}