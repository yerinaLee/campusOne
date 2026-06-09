import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  PenSquare,
  Bell,
  LogOut,
  University,
  Users,
  UserCog,
  Building2,
  Briefcase,
  FileText,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  STAFF: '교직원',
  PROFESSOR: '교수',
  STUDENT: '학생',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  STAFF: 'bg-orange-100 text-orange-700',
  PROFESSOR: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-green-100 text-green-700',
};

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role: string): NavItem[] {
  const common: NavItem[] = [
    { to: '/', label: '대시보드', icon: <LayoutDashboard size={18} /> },
    { to: '/courses', label: '강의 목록', icon: <BookOpen size={18} /> },
    { to: '/notices', label: '공지사항', icon: <Bell size={18} /> },
    { to: '/approvals', label: '전자결재', icon: <FileText size={18} /> },
  ];

  if (role === 'STUDENT') {
    return [
      ...common,
      { to: '/enrollments', label: '수강신청 현황', icon: <ClipboardList size={18} /> },
      { to: '/grades', label: '내 성적', icon: <GraduationCap size={18} /> },
      { to: '/departments', label: '학과 안내', icon: <Building2 size={18} /> },
    ];
  }

  if (role === 'PROFESSOR') {
    return [
      ...common,
      { to: '/grades/manage', label: '성적 입력', icon: <PenSquare size={18} /> },
      { to: '/students', label: '학생 조회', icon: <Users size={18} /> },
      { to: '/departments', label: '학과 안내', icon: <Building2 size={18} /> },
    ];
  }

  if (role === 'STAFF') {
    return [
      ...common,
      { to: '/students', label: '학생 관리', icon: <Users size={18} /> },
      { to: '/professors', label: '교수 관리', icon: <UserCog size={18} /> },
      { to: '/departments', label: '학과 관리', icon: <Building2 size={18} /> },
    ];
  }

  // ADMIN
  return [
    ...common,
    { to: '/students', label: '학생 관리', icon: <Users size={18} /> },
    { to: '/professors', label: '교수 관리', icon: <UserCog size={18} /> },
    { to: '/staff', label: '교직원 관리', icon: <Briefcase size={18} /> },
    { to: '/departments', label: '학과 관리', icon: <Building2 size={18} /> },
  ];
}

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const navItems = getNavItems(user?.role ?? '');

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-200">
          <University size={22} className="text-blue-600" />
          <span className="font-bold text-gray-800 text-sm leading-tight">
            CampusOne<br />
            <span className="font-normal text-gray-500 text-xs">학사 업무 시스템</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                ROLE_COLORS[user?.role ?? ''] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
            </span>
            <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              <LogOut size={15} />
              로그아웃
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
