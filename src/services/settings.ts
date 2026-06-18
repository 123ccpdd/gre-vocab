import api from './api';
import type { UserSettings } from '../types';

export async function getSettings(): Promise<UserSettings> {
  const { data } = await api.get('/settings');
  return data;
}

export async function updateSettings(update: Partial<UserSettings>): Promise<UserSettings> {
  const { data } = await api.put('/settings', update);
  return data;
}