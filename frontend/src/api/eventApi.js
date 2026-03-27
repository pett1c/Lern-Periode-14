import { apiClient } from './client';

export async function getEvents(params = {}) {
  const { data } = await apiClient.get('/events', { params });
  return data.data.events || [];
}

export async function getEventById(id) {
  const { data } = await apiClient.get(`/events/${id}`);
  return data.data.event;
}

export async function createEvent(payload) {
  const { data } = await apiClient.post('/events', payload);
  return data.data.event;
}
