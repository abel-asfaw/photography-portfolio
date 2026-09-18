import axios from 'axios';

import { authToken } from './authToken';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(async request => {
  if (request.method === 'get') return request;

  try {
    const token: string | undefined = await authToken.getToken?.();
    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to acquire Auth0 access token', error);
    throw error;
  }

  return request;
});
