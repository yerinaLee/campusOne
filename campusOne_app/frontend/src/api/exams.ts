import client from './client';
import type {
  ApiResponse,
  PageResponse,
  ExamListItem,
  ExamDetail,
  ExamRegistrationItem,
  MyExamScheduleItem,
  MySupervisionItem,
  ExamType,
  SupervisorRole,
} from '@/types';

export const examsApi = {
  // ── 시험 CRUD ──────────────────────────────────────────────────────

  create: async (data: {
    courseId: number;
    examType: ExamType;
    title: string;
    examDate: string;
    startTime: string;
    endTime: string;
    room?: string;
    maxStudents?: number;
    description?: string;
  }) => {
    const res = await client.post<ApiResponse<{ id: number; title: string; examDate: string; status: string }>>(
      '/exams',
      data
    );
    return res.data.data;
  },

  list: async (params?: {
    courseId?: number;
    examType?: string;
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await client.get<ApiResponse<PageResponse<ExamListItem>>>('/exams', { params });
    return res.data.data;
  },

  get: async (id: number) => {
    const res = await client.get<ApiResponse<ExamDetail>>(`/exams/${id}`);
    return res.data.data;
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      examDate: string;
      startTime: string;
      endTime: string;
      room: string;
      maxStudents: number;
      description: string;
    }>
  ) => {
    const res = await client.put<ApiResponse<{ id: number }>>(`/exams/${id}`, data);
    return res.data.data;
  },

  cancel: async (id: number) => {
    await client.delete(`/exams/${id}`);
  },

  // ── 감독관 ────────────────────────────────────────────────────────

  addSupervisor: async (id: number, data: { supervisorId: number; role: SupervisorRole }) => {
    const res = await client.post<ApiResponse<{ examId: number; supervisorId: number; role: string }>>(
      `/exams/${id}/supervisors`,
      data
    );
    return res.data.data;
  },

  removeSupervisor: async (id: number, userId: number) => {
    await client.delete(`/exams/${id}/supervisors/${userId}`);
  },

  // ── 응시자 ────────────────────────────────────────────────────────

  getRegistrations: async (id: number) => {
    const res = await client.get<ApiResponse<ExamRegistrationItem[]>>(`/exams/${id}/registrations`);
    return res.data.data;
  },

  registerSpecial: async (id: number, reason: string) => {
    const res = await client.post<ApiResponse<{ id: number; examId: number; status: string }>>(
      `/exams/${id}/registrations`,
      { reason }
    );
    return res.data.data;
  },

  updateRegistrationStatus: async (id: number, studentId: number, status: string) => {
    const res = await client.patch<ApiResponse<{ studentId: number; status: string }>>(
      `/exams/${id}/registrations/${studentId}/status`,
      { status }
    );
    return res.data.data;
  },

  // ── 내 일정 ──────────────────────────────────────────────────────

  mySchedule: async (params?: { year?: number; semester?: number }) => {
    const res = await client.get<ApiResponse<MyExamScheduleItem[]>>('/exams/my-schedule', { params });
    return res.data.data;
  },

  mySupervision: async () => {
    const res = await client.get<ApiResponse<MySupervisionItem[]>>('/exams/my-supervision');
    return res.data.data;
  },
};
