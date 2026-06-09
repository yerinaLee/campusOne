import client from './client';
import type { ApiResponse, PageResponse, StudentListItem, StudentDetail } from '@/types';

interface StudentListParams {
  page?: number;
  size?: number;
  keyword?: string;
  departmentId?: number;
  status?: string;
  grade?: number;
}

interface StudentCreateRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  departmentId: number;
  grade: number;
  semester: number;
  admissionYear: number;
  birthDate?: string;
  address?: string;
}

interface StudentUpdateRequest {
  phone?: string;
  address?: string;
  departmentId?: number;
  grade?: number;
  semester?: number;
}

export const studentsApi = {
  list: async (params: StudentListParams = {}) => {
    const res = await client.get<ApiResponse<PageResponse<StudentListItem>>>('/students', { params });
    return res.data.data;
  },
  get: async (id: number) => {
    const res = await client.get<ApiResponse<StudentDetail>>(`/students/${id}`);
    return res.data.data;
  },
  me: async () => {
    const res = await client.get<ApiResponse<StudentDetail>>('/students/me');
    return res.data.data;
  },
  create: async (data: StudentCreateRequest) => {
    const res = await client.post<ApiResponse<{ id: number; studentNumber: string; name: string }>>('/students', data);
    return res.data.data;
  },
  update: async (id: number, data: StudentUpdateRequest) => {
    const res = await client.put<ApiResponse<{ id: number }>>(`/students/${id}`, data);
    return res.data.data;
  },
  changeStatus: async (id: number, data: { status: string; reason?: string }) => {
    await client.patch(`/students/${id}/status`, data);
  },
};
