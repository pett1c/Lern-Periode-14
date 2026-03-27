import { apiClient } from './client';

export async function askChat(query) {
  const { data } = await apiClient.post('/chat', { query });
  return data.data;
}
