import { GenericError } from '@auth0/auth0-react';
import axios from 'axios';

import { authToken } from './authToken';

const SESSION_EXPIRED_ERRORS = new Set([
  'missing_refresh_token',
  'invalid_grant',
  'login_required',
]);

let redirectingToLogin = false;

const isSessionExpired = (error: unknown) =>
  error instanceof GenericError && SESSION_EXPIRED_ERRORS.has(error.error);

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
    if (isSessionExpired(error) && !redirectingToLogin) {
      redirectingToLogin = true;
      await authToken.redirectToLogin?.();
    }
    throw error;
  }

  return request;
});
