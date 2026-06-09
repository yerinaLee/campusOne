import client from './client';
import type { ApiResponse, CollegeItem, DepartmentItem } from '@/types';

export const departmentsApi = {
  colleges: async () => {
    const res = await client.get<ApiResponse<CollegeItem[]>>('/colleges');
    return res.data.data;
  },
  createCollege: async (data: { code: string; name: string }) => {
    const res = await client.post<ApiResponse<CollegeItem>>('/colleges', data);
    return res.data.data;
  },
  departments: async (params: { collegeId?: number } = {}) => {
    const res = await client.get<ApiResponse<DepartmentItem[]>>('/departments', { params });
    return res.data.data;
  },
  getDepartment: async (id: number) => {
    const res = await client.get<ApiResponse<DepartmentItem>>(`/departments/${id}`);
    return res.data.data;
  },
  createDepartment: async (data: { collegeId: number; code: string; name: string; headProfessorId?: number }) => {
    const res = await client.post<ApiResponse<DepartmentItem>>('/departments', data);
    return res.data.data;
  },
  updateDepartment: async (id: number, data: { name?: string; headProfessorId?: number }) => {
    const res = await client.put<ApiResponse<DepartmentItem>>(`/departments/${id}`, data);
    return res.data.data;
  },
  collegesWithDepartments: async () => {
    const res = await client.get<ApiResponse<Array<{ id: number; name: string; departments: Array<{ id: number; name: string }> }>>>('/common/colleges-departments');
    return res.data.data;
  },
};
