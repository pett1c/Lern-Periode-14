import { apiClient } from './client';

export async function getAdminEvents() {
  const { data } = await apiClient.get('/admin/events');
  return data.data.events || [];
}

export async function getAdminTickets() {
  const { data } = await apiClient.get('/admin/tickets');
  return data.data.tickets || [];
}
