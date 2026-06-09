import client from './client';
import type { ApiResponse, GradeItem } from '@/types';

export const gradesApi = {
  myGrades: async () => {
    const res = await client.get<ApiResponse<GradeItem[]>>('/grades/my');
    return res.data.data;
  },
  courseGrades: async (courseId: number) => {
    const res = await client.get<ApiResponse<GradeItem[]>>(`/grades/course/${courseId}`);
    return res.data.data;
  },
  submit: async (data: {
    enrollmentId: number;
    letterGrade?: string;
    score?: number;
    gradePoints?: number;
    isPassFail?: boolean;
    remark?: string;
  }) => {
    const res = await client.post<ApiResponse<GradeItem>>('/grades', data);
    return res.data.data;
  },
  update: async (
    id: number,
    data: { letterGrade?: string; score?: number; gradePoints?: number; remark?: string }
  ) => {
    const res = await client.put<ApiResponse<GradeItem>>(`/grades/${id}`, data);
    return res.data.data;
  },
};
