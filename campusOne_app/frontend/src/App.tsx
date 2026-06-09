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

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
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
