import { DailyStats, IDailyStats } from '../models/DailyStats.js';

/**
 * 获取今日统计
 */
export async function getTodayStats(userId: string): Promise<IDailyStats> {
  const today = new Date().toISOString().split('T')[0];
  let stats = await DailyStats.findOne({ userId, date: today });
  if (!stats) {
    stats = await DailyStats.create({
      userId,
      date: today,
      newWords: 0,
      reviewWords: 0,
      correctRate: 0,
      studyTime: 0,
    });
  }
  return stats;
}

/**
 * 更新今日统计（使用 findOneAndUpdate + upsert 确保同天只有一条记录）
 */
export async function updateTodayStats(
  userId: string,
  update: Partial<Pick<IDailyStats, 'newWords' | 'reviewWords' | 'correctRate' | 'studyTime'>>
): Promise<IDailyStats> {
  const today = new Date().toISOString().split('T')[0];
  return DailyStats.findOneAndUpdate(
    { userId, date: today },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

/**
 * 获取所有每日统计
 */
export async function getAllStats(userId: string): Promise<IDailyStats[]> {
  return DailyStats.find({ userId }).sort({ date: 1 });
}

/**
 * 计算连续打卡天数
 */
export async function getStreak(userId: string): Promise<number> {
  const stats = await DailyStats.find({ userId }).sort({ date: -1 });
  if (stats.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < stats.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];

    if (stats[i].date === expectedStr && (stats[i].newWords > 0 || stats[i].reviewWords > 0)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}