import api, { setAccessToken } from './api';

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
}

export async function register(email: string, password: string, nickname?: string) {
  const { data } = await api.post('/auth/register', { email, password, nickname });
  setAccessToken(data.accessToken);
  localStorage.setItem('gre-vocab-refresh-token', data.refreshToken);
  return data as { user: AuthUser; accessToken: string; refreshToken: string };
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  setAccessToken(data.accessToken);
  localStorage.setItem('gre-vocab-refresh-token', data.refreshToken);
  return data as { user: AuthUser; accessToken: string; refreshToken: string };
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data as { user: AuthUser };
}

export function logout() {
  setAccessToken(null);
  localStorage.removeItem('gre-vocab-refresh-token');
}