import client from './client';
import type {
  ApiResponse,
  AttendanceSession,
  AttendanceSessionDetail,
  AttendanceRecord,
  AttendanceSummary,
  MyAttendanceCourse,
  QrSessionInfo,
} from '@/types';

interface CreateSessionRequest {
  courseId: number;
  lectureDate: string;
  startTime: string;
  endTime: string;
  lateThreshold?: string;
}

export const attendanceApi = {
  createSession: async (data: CreateSessionRequest) => {
    const res = await client.post<ApiResponse<AttendanceSession>>('/attendance/sessions', data);
    return res.data.data;
  },

  getSession: async (id: number) => {
    const res = await client.get<ApiResponse<AttendanceSessionDetail>>(`/attendance/sessions/${id}`);
    return res.data.data;
  },

  closeSession: async (id: number) => {
    await client.patch(`/attendance/sessions/${id}/close`);
  },

  regenerateCode: async (id: number) => {
    const res = await client.post<ApiResponse<{ accessCode: string }>>(`/attendance/sessions/${id}/regenerate-code`);
    return res.data.data;
  },

  getRecords: async (sessionId: number) => {
    const res = await client.get<ApiResponse<AttendanceRecord[]>>(`/attendance/sessions/${sessionId}/records`);
    return res.data.data;
  },

  updateRecord: async (recordId: number, data: { status: string; reason: string }) => {
    const res = await client.put<ApiResponse<{ id: number; status: string; isManual: boolean }>>(
      `/attendance/records/${recordId}`,
      data
    );
    return res.data.data;
  },

  getCourseSummary: async (courseId: number, params?: { year?: number; semester?: number }) => {
    const res = await client.get<ApiResponse<AttendanceSummary>>(
      `/courses/${courseId}/attendance/summary`,
      { params }
    );
    return res.data.data;
  },

  getQrSession: async (qrToken: string) => {
    const res = await client.get<ApiResponse<QrSessionInfo>>(`/attendance/qr/${qrToken}`);
    return res.data.data;
  },

  checkIn: async (data: { qrToken: string; accessCode: string; latitude?: number; longitude?: number }) => {
    const res = await client.post<ApiResponse<{
      id: number;
      status: string;
      checkedInAt: string;
      courseName: string;
    }>>('/attendance/check-in', data);
    return res.data.data;
  },

  myAttendance: async (params?: { courseId?: number; year?: number; semester?: number }) => {
    const res = await client.get<ApiResponse<MyAttendanceCourse[]>>('/attendance/my', { params });
    return res.data.data;
  },
};
