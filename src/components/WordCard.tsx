import { useState } from 'react';
import type { Word } from '../types';
import { getStageLabel } from '../utils/spaced-repetition';
import { CheckOutlined, CloseOutlined, UpOutlined, DownOutlined, ExperimentOutlined, FileTextOutlined, BulbOutlined, FrownOutlined, SmileOutlined } from '@ant-design/icons';

interface WordCardProps {
  word: Word;
  isFlipped: boolean;
  noTransition?: boolean;
  onFlip: () => void;
  onKnow: () => void;
  onDontKnow: () => void;
  correctCount?: number;
  incorrectCount?: number;
}

export default function WordCard({
  word,
  isFlipped,
  noTransition = false,
  onFlip,
  onKnow,
  onDontKnow,
  correctCount = 0,
  incorrectCount = 0,
}: WordCardProps) {
  const [showRoots, setShowRoots] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 卡片主体 — 3D 翻转容器 */}
      <div
        className="perspective cursor-pointer"
        onClick={onFlip}
      >
        <div className={`card-inner ${isFlipped ? 'flipped' : ''} ${noTransition ? 'no-transition' : ''}`}>
          {/* 正面 - 单词 */}
          <div className="card-front bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 pt-14 transition-colors">
            {/* 难度标签 */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  word.difficulty <= 2
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : word.difficulty <= 3
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}
              >
                难度 {word.difficulty}
              </span>
            </div>

            {/* 考频标签 */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                考频 {word.frequency}
              </span>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {word.word}
            </h2>
            <p className="text-lg text-gray-400 dark:text-gray-500 mb-4">{word.phonetic}</p>
            <div className="flex gap-2 mb-4">
              {word.pos.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">点击翻转查看释义</p>
          </div>

          {/* 背面 - 释义 */}
          <div className="card-back bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 pt-14 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {word.word}
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{word.phonetic}</p>
            <p className="text-xl text-gray-800 dark:text-gray-200 font-medium mb-4">
              {word.meaning}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400"><CheckOutlined className="mr-1" />{correctCount}</span>
              <span className="text-red-500 dark:text-red-400"><CloseOutlined className="mr-1" />{incorrectCount}</span>
              <span className="text-indigo-600 dark:text-indigo-400">{getStageLabel(correctCount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 词根词缀（翻转后显示） */}
      {isFlipped && word.roots.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRoots(!showRoots)}
            className="w-full text-left px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between"
          >
            <span><ExperimentOutlined className="mr-2" />词根词缀分析</span>
            <span>{showRoots ? <UpOutlined /> : <DownOutlined />}</span>
          </button>
          {showRoots && (
            <div className="mt-1 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 transition-colors">
              {word.roots.map((root, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      root.type === 'prefix'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : root.type === 'root'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {root.type === 'prefix'
                      ? '前缀'
                      : root.type === 'root'
                      ? '词根'
                      : '后缀'}
                  </span>
                  <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                    {root.part}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">= {root.meaning}</span>
                  {root.origin && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({root.origin})
                    </span>
                  )}
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <BulbOutlined className="mr-1 text-yellow-500" />记忆：{word.roots.map((r) => r.part).join(' + ')} → {word.meaning}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 真题例句（翻转后显示） */}
      {isFlipped && word.examples.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="w-full text-left px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between"
          >
            <span><FileTextOutlined className="mr-2" />真题语境</span>
            <span>{showExamples ? <UpOutlined /> : <DownOutlined />}</span>
          </button>
          {showExamples && (
            <div className="mt-1 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3 transition-colors">
              {word.examples.map((ex, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                      {ex.year}年{ex.type}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{ex.sentence}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{ex.translation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮（翻转后显示） */}
      {isFlipped && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDontKnow();
            }}
            className="flex-1 py-3 px-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-200 dark:border-red-800 flex items-center justify-center gap-2"
          >
            <FrownOutlined /> 不认识
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onKnow();
            }}
            className="flex-1 py-3 px-6 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition border border-green-200 dark:border-green-800 flex items-center justify-center gap-2"
          >
            <SmileOutlined /> 认识
          </button>
        </div>
      )}
    </div>
  );
}
