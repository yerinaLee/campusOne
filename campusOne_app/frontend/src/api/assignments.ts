import client from './client';
import type {
  ApiResponse,
  AssignmentListItem,
  AssignmentDetail,
  MySubmission,
  SubmissionSummary,
  SubmissionType,
} from '@/types';

export const assignmentsApi = {
  // ── 과제 CRUD ──────────────────────────────────────────────────────

  create: async (data: {
    courseId: number;
    title: string;
    description?: string;
    dueDate: string;
    maxScore: number;
    submissionType: SubmissionType;
    allowLateSubmit: boolean;
    isVisible: boolean;
  }) => {
    const res = await client.post<ApiResponse<{ id: number; title: string; dueDate: string; status: string }>>(
      '/assignments',
      data
    );
    return res.data.data;
  },

  list: async (params: { courseId: number; status?: string }) => {
    const res = await client.get<ApiResponse<AssignmentListItem[]>>('/assignments', { params });
    return res.data.data;
  },

  get: async (id: number) => {
    const res = await client.get<ApiResponse<AssignmentDetail>>(`/assignments/${id}`);
    return res.data.data;
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      description: string;
      dueDate: string;
      maxScore: number;
      allowLateSubmit: boolean;
      isVisible: boolean;
    }>
  ) => {
    const res = await client.put<ApiResponse<{ id: number }>>(`/assignments/${id}`, data);
    return res.data.data;
  },

  remove: async (id: number) => {
    await client.delete(`/assignments/${id}`);
  },

  // ── 제출 ──────────────────────────────────────────────────────────

  submit: async (id: number, data: { content?: string }) => {
    const res = await client.post<ApiResponse<{ id: number; assignmentId: number; status: string; submittedAt: string }>>(
      `/assignments/${id}/submissions`,
      data
    );
    return res.data.data;
  },

  submitFile: async (id: number, file: File, content?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (content) form.append('content', content);
    const res = await client.post<ApiResponse<{ id: number; assignmentId: number; status: string; submittedAt: string }>>(
      `/assignments/${id}/submissions`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },

  getSubmissions: async (id: number) => {
    const res = await client.get<ApiResponse<SubmissionSummary>>(`/assignments/${id}/submissions`);
    return res.data.data;
  },

  getMySubmission: async (id: number) => {
    const res = await client.get<ApiResponse<MySubmission>>(`/assignments/${id}/submissions/my`);
    return res.data.data;
  },

  grade: async (
    id: number,
    submissionId: number,
    data: { score: number; feedback?: string }
  ) => {
    const res = await client.put<ApiResponse<{ id: number; score: number; status: string }>>(
      `/assignments/${id}/submissions/${submissionId}/grade`,
      data
    );
    return res.data.data;
  },
};
