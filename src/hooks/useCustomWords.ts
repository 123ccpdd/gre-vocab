import { useState, useCallback } from 'react';
import type { Word } from '../types';

const STORAGE_KEY = 'gre-vocab-custom-words';

function loadCustomWords(): Word[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomWords(words: Word[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save custom words:', e);
  }
}

/**
 * 自定义词库 Hook
 * 管理用户导入的单词，存入 localStorage
 */
export function useCustomWords() {
  const [customWords, setCustomWords] = useState<Word[]>(() => loadCustomWords());

  const addCustomWords = useCallback((words: Word[]) => {
    setCustomWords((prev) => {
      const updated = [...prev, ...words];
      saveCustomWords(updated);
      return updated;
    });
  }, []);

  const removeCustomWord = useCallback((id: string) => {
    setCustomWords((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      saveCustomWords(updated);
      return updated;
    });
  }, []);

  const clearCustomWords = useCallback(() => {
    setCustomWords([]);
    saveCustomWords([]);
  }, []);

  const getCustomWords = useCallback(() => customWords, [customWords]);

  return { customWords, addCustomWords, removeCustomWord, clearCustomWords, getCustomWords };
}