import api from './api';
import type { Word } from '../types';

export async function getCustomWords(): Promise<Word[]> {
  const { data } = await api.get('/words/custom');
  return data;
}

export async function addCustomWords(words: Word[]) {
  const { data } = await api.post('/words/custom', { words });
  return data as { added: number; total: number };
}

export async function removeCustomWord(id: string) {
  const { data } = await api.delete(`/words/custom/${id}`);
  return data;
}

export async function clearCustomWords() {
  const { data } = await api.delete('/words/custom');
  return data;
}