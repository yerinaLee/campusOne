import client from './client';
import type { ApiResponse, TokenResponse } from '@/types';

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await client.post<ApiResponse<TokenResponse>>('/auth/login', { username, password });
    return res.data.data;
  },
  logout: async () => {
    await client.post('/auth/logout');
  },
};
