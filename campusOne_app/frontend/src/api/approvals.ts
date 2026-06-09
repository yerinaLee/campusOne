import client from './client';
import type { ApiResponse, PageResponse, ApprovalTemplate, ApprovalListItem, ApprovalDetailType } from '@/types';

interface ApprovalListParams {
  page?: number;
  size?: number;
  box?: 'DRAFT' | 'PENDING' | 'DONE';
  status?: string;
  templateId?: number;
}

interface ApprovalCreateRequest {
  templateId: number;
  title: string;
  content: string;
  formData?: Record<string, unknown>;
  approvalLines: Array<{ step: number; approverId: number; roleLabel?: string }>;
}

export const approvalsApi = {
  templates: async () => {
    const res = await client.get<ApiResponse<ApprovalTemplate[]>>('/approvals/templates');
    return res.data.data;
  },
  list: async (params: ApprovalListParams = {}) => {
    const res = await client.get<ApiResponse<PageResponse<ApprovalListItem>>>('/approvals', { params });
    return res.data.data;
  },
  get: async (id: number) => {
    const res = await client.get<ApiResponse<ApprovalDetailType>>(`/approvals/${id}`);
    return res.data.data;
  },
  create: async (data: ApprovalCreateRequest) => {
    const res = await client.post<ApiResponse<{ id: number; title: string; status: string }>>('/approvals', data);
    return res.data.data;
  },
  process: async (id: number, data: { action: 'APPROVED' | 'REJECTED'; comment?: string }) => {
    const res = await client.post<ApiResponse<{ id: number; status: string; currentStep: number }>>(`/approvals/${id}/process`, data);
    return res.data.data;
  },
  cancel: async (id: number) => {
    await client.delete(`/approvals/${id}`);
  },
  notifications: async () => {
    const res = await client.get<ApiResponse<Array<{
      id: number;
      documentId: number;
      documentTitle: string;
      message: string;
      isRead: boolean;
      createdAt: string;
    }>>>('/approvals/notifications');
    return res.data.data;
  },
  markRead: async (notifId: number) => {
    await client.patch(`/approvals/notifications/${notifId}/read`);
  },
};
