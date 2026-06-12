import { useState, useMemo } from 'react';
import type { Word, LearningRecord } from '../types';
import { getStageLabel } from '../utils/spaced-repetition';
import { UpOutlined, DownOutlined, ExperimentOutlined, BulbOutlined, FileTextOutlined, ArrowLeftOutlined, SearchOutlined, CloseCircleFilled } from '@ant-design/icons';

const PAGE_SIZE = 50;

type Category = 'mastered' | 'reviewing' | 'learning' | 'new';

const CATEGORY_CONFIG: Record<Category, { title: string; color: string; bgColor: string; description: string }> = {
  mastered: { title: '了如指掌', color: 'text-green-500', bgColor: 'bg-green-50', description: '答对 ≥ 6 次，无需再复习' },
  reviewing: { title: '温故知新', color: 'text-blue-500', bgColor: 'bg-blue-50', description: '答对 2~5 次，按记忆曲线复习中' },
  learning: { title: '初识面目', color: 'text-yellow-500', bgColor: 'bg-yellow-50', description: '答对 1 次，刚接触还需巩固' },
  new: { title: '素未谋面', color: 'text-red-400', bgColor: 'bg-red-50', description: '从未学过的词' },
};

interface CategoryWordListProps {
  category: Category;
  words: Word[];
  records: Record<string, LearningRecord>;
  onBack: () => void;
}

export default function CategoryWordList({ category, words, records, onBack }: CategoryWordListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const config = CATEGORY_CONFIG[category];

  // 搜索过滤
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words;
    const q = searchQuery.trim().toLowerCase();
    return words.filter((w) =>
      w.word.toLowerCase().includes(q) || w.meaning.includes(q)
    );
  }, [words, searchQuery]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedWords = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safeCurrentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setExpandedId(null);
  };

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

  // 获取学习状态标签
  const getStatusTag = (wordId: string) => {
    const record = records[wordId];
    if (!record) return null;
    if (record.status === 'mastered') return { text: '已掌握', cls: 'bg-green-100 text-green-700' };
    if (record.status === 'reviewing') return { text: '复习中', cls: 'bg-blue-100 text-blue-700' };
    if (record.status === 'learning') return { text: '学习中', cls: 'bg-yellow-100 text-yellow-700' };
    return { text: '新词', cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <ArrowLeftOutlined />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-xs text-gray-500">{config.description} · 共 {words.length} 词</p>
        </div>
      </div>

      {words.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg">暂无词汇</p>
          <p className="text-sm mt-1">继续学习，这里会越来越丰富</p>
        </div>
      ) : (
        <>
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

          {/* 结果统计 */}
          {searchQuery && (
            <div className="text-xs text-gray-400">
              搜索"{searchQuery}" · 找到 {filteredWords.length} 个词
            </div>
          )}

          {/* 单词列表 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {pagedWords.map((word) => {
              const isExpanded = expandedId === word.id;
              const freqLabel = getFreqLabel(word.frequency);
              const statusTag = getStatusTag(word.id);

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
                        {statusTag && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusTag.cls}`}>
                            {statusTag.text}
                          </span>
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
                        {records[word.id] && (
                          <span>{getStageLabel(records[word.id].correctCount)}</span>
                        )}
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
                className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                上一页
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
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
                className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
