import api from './api';

export async function importData(payload: {
  records?: Record<string, any>;
  dailyStats?: any[];
  settings?: any;
  customWords?: any[];
}) {
  const { data } = await api.post('/migration/import', payload);
  return data as { success: boolean; message: string };
}