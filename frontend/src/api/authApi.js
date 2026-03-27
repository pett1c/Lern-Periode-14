import { apiClient } from './client';

export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data.data;
}

export async function login(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data.data;
}

export async function me() {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
}
