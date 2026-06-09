import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { enrollmentsApi } from '@/api/enrollments';
import { BookOpen, ClipboardList, GraduationCap, PenSquare, Bell, Users } from 'lucide-react';

function StatCard({
  title,
  value,
  description,
  to,
  icon,
  color,
}: {
  title: string;
  value?: string | number;
  description: string;
  to: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {value !== undefined && (
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </Link>
  );
}

function StudentDashboard() {
  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: enrollmentsApi.myEnrollments,
  });

  const activeCount = enrollments?.filter((e) => e.status !== 'CANCELLED').length ?? 0;
  const totalCredits = enrollments
    ?.filter((e) => e.status !== 'CANCELLED')
    .reduce((sum, e) => sum + e.credit, 0) ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <StatCard
        title="수강 중인 강의"
        value={activeCount}
        description="현재 수강신청된 강의 수"
        to="/enrollments"
        icon={<ClipboardList size={22} className="text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        title="수강 학점"
        value={totalCredits}
        description="이번 학기 등록 학점"
        to="/enrollments"
        icon={<BookOpen size={22} className="text-indigo-600" />}
        color="bg-indigo-50"
      />
      <StatCard
        title="내 성적"
        description="성적 조회 및 GPA 확인"
        to="/grades"
        icon={<GraduationCap size={22} className="text-green-600" />}
        color="bg-green-50"
      />
    </div>
  );
}

function ProfessorDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <StatCard
        title="강의 목록"
        description="담당 강의 확인 및 관리"
        to="/courses"
        icon={<BookOpen size={22} className="text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        title="성적 입력"
        description="수강생 성적 입력 및 수정"
        to="/grades/manage"
        icon={<PenSquare size={22} className="text-purple-600" />}
        color="bg-purple-50"
      />
      <StatCard
        title="공지사항"
        description="학사 공지 확인"
        to="/notices"
        icon={<Bell size={22} className="text-orange-600" />}
        color="bg-orange-50"
      />
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <StatCard
        title="강의 목록"
        description="전체 강의 조회 및 관리"
        to="/courses"
        icon={<BookOpen size={22} className="text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        title="공지사항"
        description="공지 작성 및 관리"
        to="/notices"
        icon={<Bell size={22} className="text-orange-600" />}
        color="bg-orange-50"
      />
      <StatCard
        title="사용자 관리"
        description="학생 및 교직원 현황"
        to="/courses"
        icon={<Users size={22} className="text-gray-600" />}
        color="bg-gray-50"
      />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? '좋은 아침입니다' : now.getHours() < 18 ? '안녕하세요' : '안녕하세요';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name}님
        </h1>
        <p className="text-gray-500 mt-1">
          CampusOne 학사 업무 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          바로가기
        </h2>
        {user?.role === 'STUDENT' && <StudentDashboard />}
        {user?.role === 'PROFESSOR' && <ProfessorDashboard />}
        {(user?.role === 'ADMIN' || user?.role === 'STAFF') && <AdminDashboard />}
      </div>

      {/* Notice shortcut */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">최신 공지사항을 확인하세요</p>
            <p className="text-xs text-blue-600 mt-0.5">학사 일정 및 중요 공지를 놓치지 마세요.</p>
          </div>
        </div>
        <Link
          to="/notices"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
        >
          공지 보기 &rarr;
        </Link>
      </div>
    </div>
  );
}
