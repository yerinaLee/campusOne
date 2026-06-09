import client from './client';
import type { ApiResponse, PageResponse, ProfessorListItem, ProfessorDetail } from '@/types';

interface ProfessorListParams {
  page?: number;
  size?: number;
  keyword?: string;
  departmentId?: number;
  status?: string;
}

interface ProfessorCreateRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  departmentId: number;
  position?: string;
  researchField?: string;
  officeLocation?: string;
  officePhone?: string;
  hireDate?: string;
}

export const professorsApi = {
  list: async (params: ProfessorListParams = {}) => {
    const res = await client.get<ApiResponse<PageResponse<ProfessorListItem>>>('/professors', { params });
    return res.data.data;
  },
  get: async (id: number) => {
    const res = await client.get<ApiResponse<ProfessorDetail>>(`/professors/${id}`);
    return res.data.data;
  },
  me: async () => {
    const res = await client.get<ApiResponse<ProfessorDetail>>('/professors/me');
    return res.data.data;
  },
  create: async (data: ProfessorCreateRequest) => {
    const res = await client.post<ApiResponse<{ id: number; professorNumber: string; name: string }>>('/professors', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<ProfessorCreateRequest>) => {
    const res = await client.put<ApiResponse<{ id: number }>>(`/professors/${id}`, data);
    return res.data.data;
  },
  changeStatus: async (id: number, data: { status: string; reason?: string }) => {
    await client.patch(`/professors/${id}/status`, data);
  },
};
