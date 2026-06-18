import api from './api';

export async function markWord(wordId: string, isCorrect: boolean) {
  const { data } = await api.post('/records/mark', { wordId, isCorrect });
  return data;
}

export async function getDueWords(): Promise<string[]> {
  const { data } = await api.get('/records/due');
  return data;
}

export async function getRecordStats() {
  const { data } = await api.get('/records/stats');
  return data as { total: number; new: number; learning: number; reviewing: number; mastered: number };
}

export async function getAllRecords() {
  const { data } = await api.get('/records');
  return data;
}