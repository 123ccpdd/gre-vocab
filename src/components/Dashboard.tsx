import { FireOutlined, RocketOutlined, TrophyOutlined, StarOutlined, BookOutlined, SyncOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import type { DailyStats } from '../types';

type Category = 'mastered' | 'reviewing' | 'learning' | 'new';

interface DashboardProps {
  masteredCount: number;
  learningCount: number;
  newCount: number;
  reviewingCount: number;
  totalCount: number;
  dueCount: number;
  streak: number;
  todayStats: DailyStats;
  onStartLearn: () => void;
  onStartReview: () => void;
  onViewCategory: (category: Category) => void;
}

export default function Dashboard({
  masteredCount,
  learningCount,
  newCount,
  reviewingCount,
  totalCount,
  dueCount,
  streak,
  todayStats,
  onStartLearn,
  onStartReview,
  onViewCategory,
}: DashboardProps) {
  const progress = totalCount > 0 ? ((masteredCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 打卡横幅 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {streak > 0 ? <><FireOutlined className="mr-2" />连续打卡 {streak} 天</> : <><RocketOutlined className="mr-2" />开始你的学习之旅</>}
            </h2>
            <p className="text-indigo-100 mt-1">
              今日已学 {todayStats.newWords} 词 · 复习 {todayStats.reviewWords} 词
            </p>
          </div>
          <div className="text-5xl">
            {streak >= 7 ? <TrophyOutlined /> : streak >= 3 ? <StarOutlined /> : <BookOutlined />}
          </div>
        </div>
      </div>

      {/* 学习进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">学习进度</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>了如指掌 {masteredCount} / {totalCount} 词</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => masteredCount > 0 && onViewCategory('mastered')}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors ${masteredCount > 0 ? 'cursor-pointer hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-3xl mb-2 text-green-500"><BookOutlined /></div>
            {masteredCount > 0 && <RightOutlined className="text-gray-300 dark:text-gray-600 text-xs" />}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{masteredCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">了如指掌</p>
        </div>
        <div
          onClick={() => reviewingCount > 0 && onViewCategory('reviewing')}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors ${reviewingCount > 0 ? 'cursor-pointer hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-3xl mb-2 text-blue-500"><SyncOutlined /></div>
            {reviewingCount > 0 && <RightOutlined className="text-gray-300 dark:text-gray-600 text-xs" />}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reviewingCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">温故知新</p>
        </div>
        <div
          onClick={() => learningCount > 0 && onViewCategory('learning')}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors ${learningCount > 0 ? 'cursor-pointer hover:border-yellow-200 dark:hover:border-yellow-700 hover:shadow-md transition-all' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-3xl mb-2 text-yellow-500"><StarOutlined /></div>
            {learningCount > 0 && <RightOutlined className="text-gray-300 dark:text-gray-600 text-xs" />}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{learningCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">初识面目</p>
        </div>
        <div
          onClick={() => newCount > 0 && onViewCategory('new')}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors ${newCount > 0 ? 'cursor-pointer hover:border-red-200 dark:hover:border-red-700 hover:shadow-md transition-all' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-3xl mb-2 text-red-400"><PlusOutlined /></div>
            {newCount > 0 && <RightOutlined className="text-gray-300 dark:text-gray-600 text-xs" />}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{newCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">素未谋面</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        {dueCount > 0 && (
          <button
            onClick={onStartReview}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-200 dark:shadow-orange-900/30 flex items-center justify-center gap-2"
          >
            <SyncOutlined /> 待复习 {dueCount} 词
          </button>
        )}
        <button
          onClick={onStartLearn}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2"
        >
          <PlusOutlined /> 学习新词
        </button>
      </div>
    </div>
  );
}
