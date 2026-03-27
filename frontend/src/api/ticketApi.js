import { apiClient } from './client';

export async function bookTicket(payload) {
  const { data } = await apiClient.post('/tickets/book', payload);
  return data.data.ticket;
}

export async function getMyTickets() {
  const { data } = await apiClient.get('/tickets/me');
  return data.data.tickets || [];
}

export async function cancelTicket(id) {
  const { data } = await apiClient.patch(`/tickets/${id}/cancel`);
  return data.data.ticket;
}
