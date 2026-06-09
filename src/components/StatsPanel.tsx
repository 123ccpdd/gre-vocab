import type { DailyStats } from '../types';

interface StatsPanelProps {
  stats: DailyStats[];
  streak: number;
  totalMastered: number;
  totalWords: number;
}

export default function StatsPanel({
  stats,
  streak,
  totalMastered,
  totalWords,
}: StatsPanelProps) {
  // 最近 7 天数据
  const recent7 = stats.slice(-7);
  const maxWords = Math.max(...recent7.map((s) => s.newWords + s.reviewWords), 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900">📊 学习统计</h2>

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-indigo-600">{streak}</p>
          <p className="text-sm text-gray-500 mt-1">连续天数</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{totalMastered}</p>
          <p className="text-sm text-gray-500 mt-1">已掌握</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-purple-600">
            {totalWords > 0 ? ((totalMastered / totalWords) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">完成率</p>
        </div>
      </div>

      {/* 近 7 天柱状图 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-4">近 7 天学习量</h3>
        <div className="flex items-end gap-2 h-40">
          {recent7.map((day, i) => {
            const total = day.newWords + day.reviewWords;
            const newHeight = maxWords > 0 ? (day.newWords / maxWords) * 100 : 0;
            const reviewHeight = maxWords > 0 ? (day.reviewWords / maxWords) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                {total > 0 && (
                  <span className="text-xs text-gray-500 mb-1">{total}</span>
                )}
                <div className="w-full flex flex-col" style={{ height: `${Math.max(newHeight + reviewHeight, total > 0 ? 4 : 0)}%` }}>
                  {/* 新学 - 上方蓝色 */}
                  <div
                    className="w-full bg-indigo-400 rounded-t-sm"
                    style={{ height: day.newWords > 0 ? `${(day.newWords / Math.max(total, 1)) * 100}%` : '0%' }}
                  />
                  {/* 复习 - 下方绿色 */}
                  <div
                    className="w-full bg-green-400 rounded-b-sm"
                    style={{ height: day.reviewWords > 0 ? `${(day.reviewWords / Math.max(total, 1)) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {day.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-400 rounded-sm" /> 新学
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-400 rounded-sm" /> 复习
          </span>
        </div>
      </div>

      {/* 历史记录 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-3">学习记录</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {[...stats].reverse().map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <span className="text-sm text-gray-600">{day.date}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-indigo-600">新学 {day.newWords}</span>
                <span className="text-green-600">复习 {day.reviewWords}</span>
                <span className="text-gray-500">
                  正确率 {(day.correctRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <p className="text-center text-gray-400 py-4">暂无学习记录</p>
          )}
        </div>
      </div>
    </div>
  );
}