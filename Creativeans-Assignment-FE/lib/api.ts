import axios from 'axios';
import { authCookies } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * SWR Fetcher with JWT authentication
 * Automatically includes the token in Authorization header
 */
export const swrFetcher = async (url: string) => {
  const token = authCookies.getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.get(url, {
    baseURL: API_BASE_URL,
    headers,
  });

  return response.data;
};

/**
 * Axios instance with interceptors for JWT handling
 */
apiClient.interceptors.request.use((config) => {
  const token = authCookies.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    const isUnauthorized = error.response?.status === 401;
    const isLoginRequest = error.config?.url?.includes('/users/login');
    const isAlreadyAtLogin = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (isUnauthorized && !isLoginRequest && !isAlreadyAtLogin) {
      authCookies.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
