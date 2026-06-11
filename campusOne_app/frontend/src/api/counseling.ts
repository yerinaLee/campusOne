import client from './client';
import type {
  ApiResponse,
  PageResponse,
  CounselingRequestItem,
  CounselingRecordListItem,
  CounselingRecordDetail,
  CounselingType,
} from '@/types';

export const counselingApi = {
  // ── 상담 신청 ──────────────────────────────────────────────────────

  createRequest: async (data: {
    counselingType: CounselingType;
    preferredDate?: string;
    reason: string;
  }) => {
    const res = await client.post<ApiResponse<{ id: number; counselingType: string; status: string; createdAt: string }>>(
      '/counseling/requests',
      data
    );
    return res.data.data;
  },

  listRequests: async (params?: {
    studentId?: number;
    status?: string;
    counselingType?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await client.get<ApiResponse<PageResponse<CounselingRequestItem>>>(
      '/counseling/requests',
      { params }
    );
    return res.data.data;
  },

  acceptRequest: async (id: number) => {
    const res = await client.patch<ApiResponse<{ id: number; status: string }>>(
      `/counseling/requests/${id}/accept`
    );
    return res.data.data;
  },

  rejectRequest: async (id: number, rejectReason: string) => {
    const res = await client.patch<ApiResponse<{ id: number; status: string }>>(
      `/counseling/requests/${id}/reject`,
      { rejectReason }
    );
    return res.data.data;
  },

  // ── 상담 기록 ──────────────────────────────────────────────────────

  createRecord: async (data: {
    requestId?: number;
    studentId: number;
    counselingType: CounselingType;
    subject: string;
    content: string;
    outcome?: string;
    followUp?: string;
    counseledAt: string;
    isConfidential: boolean;
  }) => {
    const res = await client.post<ApiResponse<{ id: number; subject: string; counseledAt: string }>>(
      '/counseling/records',
      data
    );
    return res.data.data;
  },

  listRecords: async (params?: {
    studentId?: number;
    counselingType?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await client.get<ApiResponse<PageResponse<CounselingRecordListItem>>>(
      '/counseling/records',
      { params }
    );
    return res.data.data;
  },

  getRecord: async (id: number) => {
    const res = await client.get<ApiResponse<CounselingRecordDetail>>(`/counseling/records/${id}`);
    return res.data.data;
  },

  updateRecord: async (
    id: number,
    data: { subject?: string; content?: string; outcome?: string; followUp?: string }
  ) => {
    const res = await client.put<ApiResponse<{ id: number }>>(`/counseling/records/${id}`, data);
    return res.data.data;
  },

  notifyRecord: async (id: number) => {
    await client.post(`/counseling/records/${id}/notify`);
  },
};
