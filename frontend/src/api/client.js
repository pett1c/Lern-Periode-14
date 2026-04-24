import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TOKEN_STORAGE_KEY = 'eventify_token';
export const USER_STORAGE_KEY = 'eventify_user';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function parseApiError(payload, fallback = 'Request failed.') {
  if (!payload) return fallback;
  if (payload.error?.details?.length) {
    const detailText = payload.error.details
      .map((item) => `${item.path || 'field'}: ${item.message}`)
      .join(' | ');
    return `${payload.message || fallback} (${detailText})`;
  }
  return payload.message || fallback;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message;

    if (error.code === 'ERR_NETWORK') {
      message = 'Network error: Backend is unreachable. Check API URL and backend server status.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout: The server took too long to respond.';
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      message = parseApiError(error.response?.data, 'Authentication failed.');
    } else if (error.response?.status >= 500) {
      message = parseApiError(error.response?.data, 'Server error. Please try again.');
    } else {
      message = parseApiError(error.response?.data, error.message || 'Request failed.');
    }

    const wrapped = new Error(message);
    wrapped.status = error.response?.status || null;
    wrapped.code = error.response?.data?.error?.code || error.code || null;
    return Promise.reject(wrapped);
  }
);

