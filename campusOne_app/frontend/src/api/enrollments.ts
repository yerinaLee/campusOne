import client from './client';
import type { ApiResponse, EnrollmentItem } from '@/types';

export const enrollmentsApi = {
  myEnrollments: async () => {
    const res = await client.get<ApiResponse<EnrollmentItem[]>>('/enrollments/my');
    return res.data.data;
  },
  enroll: async (courseId: number) => {
    const res = await client.post<ApiResponse<EnrollmentItem>>('/enrollments', { courseId });
    return res.data.data;
  },
  withdraw: async (enrollmentId: number) => {
    await client.delete(`/enrollments/${enrollmentId}`);
  },
};
