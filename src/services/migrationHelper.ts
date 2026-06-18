import { importData } from '../services/migration';

const STORAGE_KEYS = {
  RECORDS: 'gre-vocab-records',
  DAILY_STATS: 'gre-vocab-daily-stats',
  SETTINGS: 'gre-vocab-settings',
  CUSTOM_WORDS: 'gre-vocab-custom-words',
  MIGRATED: 'gre-vocab-migrated',
};

/**
 * 检查是否有需要迁移的本地数据
 */
export function hasLocalData(): boolean {
  if (localStorage.getItem(STORAGE_KEYS.MIGRATED) === 'true') return false;

  const records = localStorage.getItem(STORAGE_KEYS.RECORDS);
  const stats = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const customWords = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS);

  // 至少有一个非空数据
  if (records && Object.keys(JSON.parse(records)).length > 0) return true;
  if (stats && JSON.parse(stats).length > 0) return true;
  if (settings) return true;
  if (customWords && JSON.parse(customWords).length > 0) return true;

  return false;
}

/**
 * 将 localStorage 数据迁移到后端
 */
export async function migrateLocalData(): Promise<{ success: boolean; message: string }> {
  try {
    const records = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const dailyStats = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const customWords = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS);

    const payload: Record<string, any> = {};

    if (records) {
      payload.records = JSON.parse(records);
    }
    if (dailyStats) {
      payload.dailyStats = JSON.parse(dailyStats);
    }
    if (settings) {
      payload.settings = JSON.parse(settings);
    }
    if (customWords) {
      payload.customWords = JSON.parse(customWords);
    }

    const result = await importData(payload);

    if (result.success) {
      // 迁移成功，标记已迁移
      localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
      // 不删除本地数据，作为降级备份
    }

    return result;
  } catch (err: any) {
    return { success: false, message: err.message || '迁移失败' };
  }
}

/**
 * 标记已迁移（跳过迁移时使用）
 */
export function markMigrated() {
  localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
}