import { useState, useEffect, useCallback } from 'react';
import type { LearningRecord, DailyStats, UserSettings } from '../types';
import { createLearningRecord, updateLearningRecord } from '../utils/spaced-repetition';
import { getAllWords } from '../data/words';

const STORAGE_KEYS = {
  RECORDS: 'gre-vocab-records',
  DAILY_STATS: 'gre-vocab-daily-stats',
  SETTINGS: 'gre-vocab-settings',
};

const DEFAULT_SETTINGS: UserSettings = {
  dailyNewWords: 20,
  dailyReviewLimit: 100,
  enableSound: true,
  enableDarkMode: false,
  autoPlayPronunciation: false,
};

/**
 * 从 localStorage 加载数据
 */
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 保存数据到 localStorage
 */
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * 学习记录管理 Hook
 */
export function useLearningRecords() {
  const [records, setRecords] = useState<Record<string, LearningRecord>>(() =>
    loadFromStorage(STORAGE_KEYS.RECORDS, {})
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECORDS, records);
  }, [records]);

  const getRecord = useCallback(
    (wordId: string): LearningRecord | undefined => records[wordId],
    [records]
  );

  const markWord = useCallback((wordId: string, isCorrect: boolean) => {
    setRecords((prev) => {
      const existing = prev[wordId] || createLearningRecord(wordId);
      return {
        ...prev,
        [wordId]: updateLearningRecord(existing, isCorrect),
      };
    });
  }, []);

  const getDueWords = useCallback((): string[] => {
    const now = new Date();
    return Object.values(records)
      .filter((r) => {
        if (r.status === 'mastered') return false;
        return new Date(r.nextReviewDate) <= now;
      })
      .map((r) => r.wordId);
  }, [records]);

  const getNewWordIds = useCallback((): string[] => {
    return Object.values(records)
      .filter((r) => r.status === 'new')
      .map((r) => r.wordId);
  }, [records]);

  const getStats = useCallback(() => {
    const allRecords = Object.values(records);
    const recordedCount = allRecords.length;
    return {
      total: recordedCount,
      new: getAllWords().length - recordedCount,  // 从未学过的词 = 词库总数（内置+自定义） - 已有记录数
      learning: allRecords.filter((r) => r.status === 'learning').length,
      reviewing: allRecords.filter((r) => r.status === 'reviewing').length,
      mastered: allRecords.filter((r) => r.status === 'mastered').length,
    };
  }, [records]);

  return { records, getRecord, markWord, getDueWords, getNewWordIds, getStats };
}

/**
 * 每日统计 Hook
 */
export function useDailyStats() {
  const [stats, setStats] = useState<DailyStats[]>(() =>
    loadFromStorage(STORAGE_KEYS.DAILY_STATS, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DAILY_STATS, stats);
  }, [stats]);

  const updateTodayStats = useCallback(
    (update: Partial<DailyStats>) => {
      const today = new Date().toISOString().split('T')[0];
      setStats((prev) => {
        const existing = prev.find((s) => s.date === today);
        if (existing) {
          return prev.map((s) =>
            s.date === today ? { ...s, ...update } : s
          );
        }
        return [
          ...prev,
          {
            date: today,
            newWords: 0,
            reviewWords: 0,
            correctRate: 0,
            studyTime: 0,
            ...update,
          },
        ];
      });
    },
    [stats]
  );

  const getTodayStats = useCallback((): DailyStats => {
    const today = new Date().toISOString().split('T')[0];
    const existing = stats.find((s) => s.date === today);
    return (
      existing || {
        date: today,
        newWords: 0,
        reviewWords: 0,
        correctRate: 0,
        studyTime: 0,
      }
    );
  }, [stats]);

  const getStreak = useCallback((): number => {
    if (stats.length === 0) return 0;
    const sorted = [...stats].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (sorted[i].date === expectedStr && (sorted[i].newWords > 0 || sorted[i].reviewWords > 0)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [stats]);

  return { stats, updateTodayStats, getTodayStats, getStreak };
}

/**
 * 用户设置 Hook
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  const updateSettings = useCallback((update: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...update }));
  }, []);

  return { settings, updateSettings };
}
