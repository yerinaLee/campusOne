import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '@/api/students';
import { Search, ChevronLeft, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { StudentStatus } from '@/types';

const STATUS_CONFIG: Record<StudentStatus, { label: string; className: string }> = {
  ENROLLED:  { label: '재학',   className: 'bg-green-100 text-green-700' },
  LEAVE:     { label: '휴학',   className: 'bg-yellow-100 text-yellow-700' },
  GRADUATED: { label: '졸업',   className: 'bg-blue-100 text-blue-700' },
  EXPELLED:  { label: '제적',   className: 'bg-red-100 text-red-600' },
};

export default function StudentList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const [keyword, setKeyword]     = useState('');
  const [inputKw, setInputKw]     = useState('');
  const [status, setStatus]       = useState('');
  const [grade, setGrade]         = useState('');
  const [page, setPage]           = useState(0);

  const params = {
    ...(keyword    ? { keyword }              : {}),
    ...(status     ? { status }               : {}),
    ...(grade      ? { grade: Number(grade) } : {}),
    page, size: 20,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.list(params),
  });

  const handleSearch = () => { setKeyword(inputKw); setPage(0); };

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-sm text-gray-500 mt-1">등록된 학생 목록을 조회합니다.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/students/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={16} />
            학생 등록
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">검색 (학번·이름)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKw}
                onChange={(e) => setInputKw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="학번 또는 이름으로 검색"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="ENROLLED">재학</option>
              <option value="LEAVE">휴학</option>
              <option value="GRADUATED">졸업</option>
              <option value="EXPELLED">제적</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">학년</label>
            <select
              value={grade}
              onChange={(e) => { setGrade(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
              <option value="4">4학년</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">학생 목록을 불러오는 중...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500 text-sm">데이터를 불러오는 데 실패했습니다.</div>
        ) : !data?.content.length ? (
          <div className="text-center py-16 text-gray-400 text-sm">검색 결과가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">학번</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">학과</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">학년/학기</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">입학연도</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">이메일</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.content.map((s) => {
                  const sc = STATUS_CONFIG[s.status];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.studentNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.departmentName}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{s.grade}학년 {s.semester}학기</td>
                      <td className="px-4 py-3 text-center text-gray-600">{s.admissionYear}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          상세 보기
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">전체 {data?.totalElements ?? 0}명</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
