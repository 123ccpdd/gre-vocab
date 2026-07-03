import { LearningRecord } from '../models/LearningRecord.js';
import mongoose from 'mongoose';

/**
 * 艾宾浩斯记忆曲线复习间隔（天）
 * 1 → 2 → 4 → 7 → 15 → 30
 */
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

/**
 * 创建新的学习记录
 */
export async function createRecord(userId: string, wordId: string) {
  const now = new Date();
  return LearningRecord.create({
    userId: new mongoose.Types.ObjectId(userId),
    wordId,
    status: 'new',
    correctCount: 0,
    incorrectCount: 0,
    lastReviewDate: now,
    nextReviewDate: now,
    easeFactor: 2.5,
    interval: 0,
  });
}

/**
 * 根据回答更新学习记录（SM-2 算法简化版）
 */
export async function markWord(userId: string, wordId: string, isCorrect: boolean) {
  // 查找或创建记录
  let record = await LearningRecord.findOne({ userId, wordId });
  if (!record) {
    record = await createRecord(userId, wordId);
  }

  const now = new Date();

  if (isCorrect) {
    record.correctCount += 1;
    const intervalIndex = Math.min(record.correctCount - 1, REVIEW_INTERVALS.length - 1);
    record.interval = REVIEW_INTERVALS[intervalIndex];

    // 更新状态
    if (record.correctCount >= REVIEW_INTERVALS.length) {
      record.status = 'mastered';
    } else if (record.correctCount >= 2) {
      record.status = 'reviewing';
    } else {
      record.status = 'learning';
    }
  } else {
    record.incorrectCount += 1;
    // 答错降级而非清零：扣2次进度（最低保留1），避免一次遗忘打回原点
    record.correctCount = Math.max(1, record.correctCount - 2);
    const intervalIndex = Math.min(record.correctCount - 1, REVIEW_INTERVALS.length - 1);
    record.interval = REVIEW_INTERVALS[intervalIndex];
    // 只有 correctCount 降到 1 才退回 learning，否则保持 reviewing
    record.status = record.correctCount <= 1 ? 'learning' : 'reviewing';
  }

  // 计算下次复习日期
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + record.interval);
  record.nextReviewDate = nextDate;
  record.lastReviewDate = now;

  return record.save();
}

/**
 * 获取待复习单词 ID 列表
 */
export async function getDueWords(userId: string): Promise<string[]> {
  const now = new Date();
  const records = await LearningRecord.find({
    userId,
    status: { $ne: 'mastered' },
    nextReviewDate: { $lte: now },
  });
  return records.map((r) => r.wordId);
}

/**
 * 获取学习统计
 */
export async function getStats(userId: string) {
  const allRecords = await LearningRecord.find({ userId });
  const recordedCount = allRecords.length;
  return {
    total: recordedCount,
    learning: allRecords.filter((r) => r.status === 'learning').length,
    reviewing: allRecords.filter((r) => r.status === 'reviewing').length,
    mastered: allRecords.filter((r) => r.status === 'mastered').length,
  };
}

/**
 * 获取用户所有学习记录
 */
export async function getAllRecords(userId: string) {
  return LearningRecord.find({ userId });
}

/**
 * 获取指定状态的学习记录
 */
export async function getRecordsByStatus(userId: string, status?: string) {
  const filter: any = { userId };
  if (status) filter.status = status;
  return LearningRecord.find(filter);
}