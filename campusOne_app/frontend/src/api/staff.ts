import client from './client';
import type { ApiResponse, PageResponse, StaffListItem, StaffDetail, AssignmentHistory, AdministrativeOffice } from '@/types';

interface StaffListParams {
  page?: number;
  size?: number;
  keyword?: string;
  officeId?: number;
  status?: string;
  employmentType?: string;
}

interface StaffCreateRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  officeId: number;
  employmentType: string;
  hireDate: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
}

interface StaffJobRequest {
  officeId: number;
  positionId: number;
  departmentId?: number;
  jobTitle: string;
  jobCategory: string;
  isPrimary?: boolean;
  startDate: string;
  description?: string;
}

interface AssignmentRequest {
  toOfficeId: number;
  toPositionId: number;
  assignmentType: string;
  effectiveDate: string;
  reason?: string;
}

export const staffApi = {
  list: async (params: StaffListParams = {}) => {
    const res = await client.get<ApiResponse<PageResponse<StaffListItem>>>('/staff', { params });
    return res.data.data;
  },
  get: async (id: number) => {
    const res = await client.get<ApiResponse<StaffDetail>>(`/staff/${id}`);
    return res.data.data;
  },
  create: async (data: StaffCreateRequest) => {
    const res = await client.post<ApiResponse<{ id: number; staffNumber: string; name: string }>>('/staff', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<StaffCreateRequest>) => {
    const res = await client.put<ApiResponse<{ id: number }>>(`/staff/${id}`, data);
    return res.data.data;
  },
  changeStatus: async (id: number, data: { status: string; reason?: string; effectiveDate?: string }) => {
    await client.patch(`/staff/${id}/status`, data);
  },
  addJob: async (id: number, data: StaffJobRequest) => {
    const res = await client.post<ApiResponse<{ jobId: number }>>(`/staff/${id}/jobs`, data);
    return res.data.data;
  },
  endJob: async (staffId: number, jobId: number, endDate: string) => {
    await client.delete(`/staff/${staffId}/jobs/${jobId}`, { data: { endDate } });
  },
  createAssignment: async (id: number, data: AssignmentRequest) => {
    const res = await client.post<ApiResponse<{ historyId: number }>>(`/staff/${id}/assignments`, data);
    return res.data.data;
  },
  getAssignments: async (id: number) => {
    const res = await client.get<ApiResponse<AssignmentHistory[]>>(`/staff/${id}/assignments`);
    return res.data.data;
  },
  offices: async () => {
    const res = await client.get<ApiResponse<AdministrativeOffice[]>>('/offices');
    return res.data.data;
  },
};
