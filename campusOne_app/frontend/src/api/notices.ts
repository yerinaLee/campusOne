import client from './client';
import type { ApiResponse, NoticeDetail, NoticeListItem, PageResponse } from '@/types';

export const noticesApi = {
  list: async (
    params: { category?: string; departmentId?: number; page?: number; size?: number } = {}
  ) => {
    const res = await client.get<ApiResponse<PageResponse<NoticeListItem>>>('/notices', { params });
    return res.data.data;
  },
  get: async (id: number) => {
    const res = await client.get<ApiResponse<NoticeDetail>>(`/notices/${id}`);
    return res.data.data;
  },
  create: async (data: {
    title: string;
    content: string;
    category: string;
    departmentId?: number;
    isPinned?: boolean;
  }) => {
    const res = await client.post<ApiResponse<NoticeDetail>>('/notices', data);
    return res.data.data;
  },
};
