import axios from 'axios';
import { API_BASE_URL } from '../config/gameConfig';
import { mockBackend } from './mockBackend';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('odyssey_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle auth failures and gracefully fallback to mockBackend on network error / 404
api.interceptors.response.use(
  (response) => {
    // If Vercel rewrites /api/* to index.html, it returns 200 with text/html doctype
    const contentType = response.headers?.['content-type'] || '';
    if (typeof response.data === 'string' && (response.data.includes('<!doctype html>') || contentType.includes('text/html'))) {
      console.info('📡 Remote API endpoint not found (returned HTML). Switching to local Arcade Engine...');
      return mockBackend.handleRequest(response.config);
    }
    return response;
  },
  async (error) => {
    const isNetworkError = !error.response || error.message === 'Network Error' || error.code === 'ECONNABORTED';
    const isNotFoundOrServerErr = error.response && (error.response.status === 404 || error.response.status >= 500);

    // If live API is down or unavailable (e.g. standalone Vercel SPA deployment), route through mockBackend
    if ((isNetworkError || isNotFoundOrServerErr) && error.config) {
      console.info(`📡 API unavailable (${error.message || error.response?.status}). Serving via Local Arcade Engine for ${error.config.url}...`);
      try {
        const mockRes = await mockBackend.handleRequest(error.config);
        return mockRes;
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('odyssey_token');
        localStorage.removeItem('odyssey_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
