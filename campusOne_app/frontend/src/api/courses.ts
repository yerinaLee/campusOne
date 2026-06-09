import client from './client';
import type { ApiResponse, CourseDetail, CourseListItem, PageResponse } from '@/types';

interface CourseFilters {
  year?: number;
  semester?: number;
  departmentId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export const coursesApi = {
  list: async (filters: CourseFilters = {}) => {
    const res = await client.get<ApiResponse<PageResponse<CourseListItem>>>('/courses', { params: filters });
    return res.data.data;
  },
  get: async (id: number) => {
    const res = await client.get<ApiResponse<CourseDetail>>(`/courses/${id}`);
    return res.data.data;
  },
};
