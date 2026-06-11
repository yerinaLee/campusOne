import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CourseList from '@/pages/courses/CourseList';
import MyEnrollments from '@/pages/enrollments/MyEnrollments';
import MyGrades from '@/pages/grades/MyGrades';
import GradeManagement from '@/pages/grades/GradeManagement';
import NoticeList from '@/pages/notices/NoticeList';
import NoticeDetail from '@/pages/notices/NoticeDetail';
import NoticeCreate from '@/pages/notices/NoticeCreate';
import StudentList from '@/pages/students/StudentList';
import StudentDetail from '@/pages/students/StudentDetail';
import StudentCreate from '@/pages/students/StudentCreate';
import ProfessorList from '@/pages/professors/ProfessorList';
import ProfessorDetail from '@/pages/professors/ProfessorDetail';
import ProfessorCreate from '@/pages/professors/ProfessorCreate';
import DepartmentList from '@/pages/departments/DepartmentList';
import StaffList from '@/pages/staff/StaffList';
import StaffDetail from '@/pages/staff/StaffDetail';
import StaffCreate from '@/pages/staff/StaffCreate';
import ApprovalList from '@/pages/approvals/ApprovalList';
import ApprovalDetail from '@/pages/approvals/ApprovalDetail';
import ApprovalCreate from '@/pages/approvals/ApprovalCreate';
import AttendanceManage from '@/pages/attendance/AttendanceManage';
import AttendanceCheckIn from '@/pages/attendance/AttendanceCheckIn';
import MyAttendance from '@/pages/attendance/MyAttendance';
import CounselingRequestPage from '@/pages/counseling/CounselingRequestPage';
import CounselingManage from '@/pages/counseling/CounselingManage';
import CounselingHistory from '@/pages/counseling/CounselingHistory';
import AssignmentList from '@/pages/assignments/AssignmentList';
import AssignmentDetail from '@/pages/assignments/AssignmentDetail';
import AssignmentCreate from '@/pages/assignments/AssignmentCreate';
import ExamList from '@/pages/exams/ExamList';
import ExamDetail from '@/pages/exams/ExamDetail';
import ExamCreate from '@/pages/exams/ExamCreate';
import MyExamSchedule from '@/pages/exams/MyExamSchedule';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    // PUBLIC: 학생 QR 체크인 (로그인 없이 세션 정보 조회 가능, 체크인은 로그인 필요)
    path: '/attend/:qrToken',
    element: <AttendanceCheckIn />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // ─── 공통 ────────────────────────────────────────────
      { index: true, element: <Dashboard /> },
      { path: 'courses', element: <CourseList /> },
      { path: 'notices', element: <NoticeList /> },
      { path: 'notices/:id', element: <NoticeDetail /> },
      {
        path: 'notices/create',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF', 'PROFESSOR']}>
            <NoticeCreate />
          </ProtectedRoute>
        ),
      },

      // ─── 전자결재 (전체) ──────────────────────────────────
      { path: 'approvals', element: <ApprovalList /> },
      { path: 'approvals/:id', element: <ApprovalDetail /> },
      { path: 'approvals/create', element: <ApprovalCreate /> },

      // ─── 학생 ────────────────────────────────────────────
      {
        path: 'enrollments',
        element: (
          <ProtectedRoute roles={['STUDENT']}>
            <MyEnrollments />
          </ProtectedRoute>
        ),
      },
      {
        path: 'grades',
        element: (
          <ProtectedRoute roles={['STUDENT']}>
            <MyGrades />
          </ProtectedRoute>
        ),
      },

      // ─── 교수 ─────────────────────────────────────────────
      {
        path: 'grades/manage',
        element: (
          <ProtectedRoute roles={['PROFESSOR']}>
            <GradeManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance/manage',
        element: (
          <ProtectedRoute roles={['PROFESSOR']}>
            <AttendanceManage />
          </ProtectedRoute>
        ),
      },

      // ─── 학생 출결 ─────────────────────────────────────────
      {
        path: 'attendance/my',
        element: (
          <ProtectedRoute roles={['STUDENT']}>
            <MyAttendance />
          </ProtectedRoute>
        ),
      },

      // ─── 학생 관리 (ADMIN, STAFF, PROFESSOR) ──────────────
      {
        path: 'students',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF', 'PROFESSOR']}>
            <StudentList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/create',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <StudentCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/:id',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF', 'PROFESSOR']}>
            <StudentDetail />
          </ProtectedRoute>
        ),
      },

      // ─── 교수 관리 (ADMIN, STAFF) ──────────────────────────
      {
        path: 'professors',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <ProfessorList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'professors/create',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <ProfessorCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'professors/:id',
        element: (
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <ProfessorDetail />
          </ProtectedRoute>
        ),
      },

      // ─── 상담 ──────────────────────────────────────────────
      {
        path: 'counseling/request',
        element: (
          <ProtectedRoute roles={['STUDENT']}>
            <CounselingRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'counseling/manage',
        element: (
          <ProtectedRoute roles={['PROFESSOR', 'STAFF', 'ADMIN']}>
            <CounselingManage />
          </ProtectedRoute>
        ),
      },
      { path: 'counseling/history', element: <CounselingHistory /> },

      // ─── 과제 ──────────────────────────────────────────────
      { path: 'assignments', element: <AssignmentList /> },
      { path: 'assignments/:id', element: <AssignmentDetail /> },
      {
        path: 'assignments/create',
        element: (
          <ProtectedRoute roles={['PROFESSOR', 'STAFF', 'ADMIN']}>
            <AssignmentCreate />
          </ProtectedRoute>
        ),
      },

      // ─── 시험 ──────────────────────────────────────────────
      { path: 'exams', element: <ExamList /> },
      { path: 'exams/:id', element: <ExamDetail /> },
      {
        path: 'exams/create',
        element: (
          <ProtectedRoute roles={['PROFESSOR', 'STAFF', 'ADMIN']}>
            <ExamCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/my-schedule',
        element: (
          <ProtectedRoute roles={['STUDENT']}>
            <MyExamSchedule />
          </ProtectedRoute>
        ),
      },

      // ─── 학과 관리 ─────────────────────────────────────────
      { path: 'departments', element: <DepartmentList /> },

      // ─── 교직원 관리 (ADMIN) ────────────────────────────────
      {
        path: 'staff',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <StaffList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff/create',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <StaffCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff/:id',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <StaffDetail />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
