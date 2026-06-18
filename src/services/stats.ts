import api from './api';

export async function getTodayStats() {
  const { data } = await api.get('/stats/today');
  return data;
}

export async function updateTodayStats(update: Record<string, any>) {
  const { data } = await api.post('/stats/today', update);
  return data;
}

export async function getStreak(): Promise<number> {
  const { data } = await api.get('/stats/streak');
  return data.streak;
}

export async function getAllStats() {
  const { data } = await api.get('/stats');
  return data;
}