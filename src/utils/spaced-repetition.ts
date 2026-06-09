import type { LearningRecord } from '../types';

/**
 * 艾宾浩斯记忆曲线复习间隔（天）
 * 1 → 2 → 4 → 7 → 15 → 30
 */
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

/**
 * 计算下次复习日期
 */
export function getNextReviewDate(correctCount: number): string {
  const intervalIndex = Math.min(correctCount, REVIEW_INTERVALS.length - 1);
  const intervalDays = REVIEW_INTERVALS[intervalIndex];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate.toISOString();
}

/**
 * 判断单词是否需要今天复习
 */
export function isDueForReview(record: LearningRecord): boolean {
  if (record.status === 'mastered') return false;
  const now = new Date();
  const nextReview = new Date(record.nextReviewDate);
  return nextReview <= now;
}

/**
 * 判断是否是新单词（从未学过）
 */
export function isNewWord(record: LearningRecord | undefined): boolean {
  return !record || record.status === 'new';
}

/**
 * 创建新的学习记录
 */
export function createLearningRecord(wordId: string): LearningRecord {
  const now = new Date().toISOString();
  return {
    wordId,
    status: 'new',
    correctCount: 0,
    incorrectCount: 0,
    lastReviewDate: now,
    nextReviewDate: now,
    easeFactor: 2.5,
    interval: 0,
    createdAt: now,
  };
}

/**
 * 根据回答更新学习记录（SM-2 算法简化版）
 */
export function updateLearningRecord(
  record: LearningRecord,
  isCorrect: boolean
): LearningRecord {
  const now = new Date().toISOString();
  const newRecord = { ...record, lastReviewDate: now };

  if (isCorrect) {
    newRecord.correctCount += 1;
    const intervalIndex = Math.min(
      newRecord.correctCount - 1,
      REVIEW_INTERVALS.length - 1
    );
    newRecord.interval = REVIEW_INTERVALS[intervalIndex];

    // 更新状态
    if (newRecord.correctCount >= REVIEW_INTERVALS.length) {
      newRecord.status = 'mastered';
    } else if (newRecord.correctCount >= 2) {
      newRecord.status = 'reviewing';
    } else {
      newRecord.status = 'learning';
    }
  } else {
    newRecord.incorrectCount += 1;
    // 答错则重置间隔
    newRecord.correctCount = 0;
    newRecord.interval = 0;
    newRecord.status = 'learning';
  }

  // 计算下次复习日期
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newRecord.interval);
  newRecord.nextReviewDate = nextDate.toISOString();

  return newRecord;
}

/**
 * 获取今日需复习的单词数量
 */
export function getDueCount(records: LearningRecord[]): number {
  return records.filter(isDueForReview).length;
}

/**
 * 获取记忆曲线阶段描述
 */
export function getStageLabel(correctCount: number): string {
  if (correctCount === 0) return '新学习';
  if (correctCount >= REVIEW_INTERVALS.length) return '已掌握';
  const intervals = [1, 2, 4, 7, 15, 30];
  return `${intervals[correctCount - 1]}天后复习`;
}
