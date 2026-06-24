import { useState, useMemo } from 'react';
import { BarChartOutlined } from '@ant-design/icons';
import type { DailyStats } from '../types';

interface StatsPanelProps {
  stats: DailyStats[];
  streak: number;
  totalMastered: number;
  totalWords: number;
}

type ChartMode = 'week' | 'month';

// 生成 YYYY-MM-DD 格式
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// 获取某日期在 stats 中的记录，没有则返回零值
function getDayData(statsMap: Record<string, DailyStats>, date: string): DailyStats {
  return statsMap[date] || { date, newWords: 0, reviewWords: 0, correctRate: 0, studyTime: 0 };
}

export default function StatsPanel({
  stats,
  streak,
  totalMastered,
  totalWords,
}: StatsPanelProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('week');

  // 构建 stats 的日期映射
  const statsMap = useMemo(() => {
    const map: Record<string, DailyStats> = {};
    stats.forEach((s) => { map[s.date] = s; });
    return map;
  }, [stats]);

  // 近7天：今天 + 前3天 + 后3天
  const weekData = useMemo(() => {
    const today = new Date();
    const days: DailyStats[] = [];
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      days.push(getDayData(statsMap, formatDate(d)));
    }
    return days;
  }, [statsMap]);

  // 近1月：本月从1号到月末，按周分组
  const monthData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: { label: string; newWords: number; reviewWords: number }[] = [];

    // 按7天一周切分本月
    for (let start = 1; start <= daysInMonth; start += 7) {
      const end = Math.min(start + 6, daysInMonth);

      let weekNew = 0;
      let weekReview = 0;

      for (let d = start; d <= end; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayData = getDayData(statsMap, dateStr);
        weekNew += dayData.newWords;
        weekReview += dayData.reviewWords;
      }

      weeks.push({
        label: `${start}-${end}日`,
        newWords: weekNew,
        reviewWords: weekReview,
      });
    }
    return weeks;
  }, [statsMap]);

  // 当前图表数据
  const chartItems = chartMode === 'week'
    ? weekData.map((d) => ({
        label: d.date.slice(5), // MM-DD
        newWords: d.newWords,
        reviewWords: d.reviewWords,
        isToday: d.date === formatDate(new Date()),
      }))
    : monthData.map((w) => ({
        label: w.label,
        newWords: w.newWords,
        reviewWords: w.reviewWords,
        isToday: false,
      }));

  const maxWords = Math.max(...chartItems.map((c) => c.newWords + c.reviewWords), 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100"><BarChartOutlined className="mr-2" />学习统计</h2>

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-colors">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{streak}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">连续天数</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-colors">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalMastered}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">已掌握</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-colors">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {totalWords > 0 ? ((totalMastered / totalWords) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">完成率</p>
        </div>
      </div>

      {/* 学习量图表 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        {/* 标题 + 切换 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">学习量</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setChartMode('week')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                chartMode === 'week'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              近7天
            </button>
            <button
              onClick={() => setChartMode('month')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                chartMode === 'month'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              近1月
            </button>
          </div>
        </div>

        {/* 柱状图 */}
        <div className="flex items-end gap-2 h-44">
          {chartItems.map((item, i) => {
            const total = item.newWords + item.reviewWords;
            const totalHeight = maxWords > 0 ? (total / maxWords) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                {/* 数值标注 */}
                <span className={`text-xs mb-1 ${item.isToday ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {total}
                </span>
                {/* 柱子 */}
                <div
                  className="w-full flex flex-col rounded-t-sm overflow-hidden"
                  style={{ height: `${Math.max(totalHeight, total > 0 ? 4 : 0)}%`, minHeight: total > 0 ? '4px' : '0' }}
                >
                  {/* 新学 - 上方蓝色 */}
                  <div
                    className="w-full bg-indigo-400 dark:bg-indigo-500"
                    style={{ height: item.newWords > 0 ? `${(item.newWords / Math.max(total, 1)) * 100}%` : '0%' }}
                  />
                  {/* 复习 - 下方绿色 */}
                  <div
                    className="w-full bg-green-400 dark:bg-green-500"
                    style={{ height: item.reviewWords > 0 ? `${(item.reviewWords / Math.max(total, 1)) * 100}%` : '0%' }}
                  />
                </div>
                {/* 日期标签 */}
                <span className={`text-xs mt-1 ${item.isToday ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-400 dark:bg-indigo-500 rounded-sm" /> 新学
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-sm" /> 复习
          </span>
        </div>
      </div>

      {/* 历史记录 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">学习记录</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {[...stats].reverse().map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
            >
              <span className="text-sm text-gray-600 dark:text-gray-300">{day.date}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-indigo-600 dark:text-indigo-400">新学 {day.newWords}</span>
                <span className="text-green-600 dark:text-green-400">复习 {day.reviewWords}</span>

              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 py-4">暂无学习记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
