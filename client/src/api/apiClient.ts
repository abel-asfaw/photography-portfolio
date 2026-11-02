import axios from 'axios';

import { supabase } from './supabase';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(async request => {
  if (request.method === 'get') return request;

  // getSession refreshes an expired access token before returning it.
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Failed to get Supabase session', error);
  }

  const token = data.session?.access_token;
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }

  return request;
});
