import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/api/courses';
import { enrollmentsApi } from '@/api/enrollments';
import { useAuthStore } from '@/store/authStore';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DAY_LABELS: Record<number, string> = {
  1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토', 7: '일',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  OPEN: { label: '수강 가능', className: 'bg-green-100 text-green-700' },
  CLOSED: { label: '마감', className: 'bg-gray-100 text-gray-600' },
  ENDED: { label: '종료', className: 'bg-gray-100 text-gray-500' },
};

const COURSE_TYPE_LABELS: Record<string, string> = {
  MAJOR_REQUIRED: '전공필수',
  MAJOR_ELECTIVE: '전공선택',
  GENERAL_REQUIRED: '교양필수',
  GENERAL_ELECTIVE: '교양선택',
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function CourseList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [semester, setSemester] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');
  const [page, setPage] = useState(0);

  const [enrollFeedback, setEnrollFeedback] = useState<Record<number, { ok: boolean; msg: string }>>({});

  const filters = {
    ...(year ? { year: Number(year) } : {}),
    ...(semester ? { semester: Number(semester) } : {}),
    ...(keyword ? { keyword } : {}),
    page,
    size: 15,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.list(filters),
  });

  const enrollMutation = useMutation({
    mutationFn: enrollmentsApi.enroll,
    onSuccess: (_, courseId) => {
      setEnrollFeedback((prev) => ({ ...prev, [courseId]: { ok: true, msg: '수강신청 완료!' } }));
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setTimeout(() => setEnrollFeedback((prev) => { const n = { ...prev }; delete n[courseId]; return n; }), 3000);
    },
    onError: (err: unknown, courseId) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '수강신청에 실패했습니다.';
      setEnrollFeedback((prev) => ({ ...prev, [courseId]: { ok: false, msg } }));
      setTimeout(() => setEnrollFeedback((prev) => { const n = { ...prev }; delete n[courseId]; return n; }), 4000);
    },
  });

  const handleSearch = () => {
    setKeyword(inputKeyword);
    setPage(0);
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">강의 목록</h1>
        <p className="text-gray-500 mt-1 text-sm">개설된 강의를 검색하고 조회할 수 있습니다.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">연도</label>
            <input
              type="number"
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(0); }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="연도"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">학기</label>
            <select
              value={semester}
              onChange={(e) => { setSemester(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
            >
              <option value="">전체</option>
              <option value="1">1학기</option>
              <option value="2">2학기</option>
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">검색</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="과목명 또는 교수명 검색"
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">강의 목록을 불러오는 중...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500 text-sm">
            강의 목록을 불러오는 데 실패했습니다.
          </div>
        ) : !data?.content.length ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">과목코드</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">과목명</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">학과</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">교수</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">학점</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">강의 유형</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">수강인원</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상태</th>
                  {user?.role === 'STUDENT' && (
                    <th className="px-4 py-3 text-center font-medium text-gray-600">수강신청</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.content.map((course) => {
                  const feedback = enrollFeedback[course.id];
                  return (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                        {course.courseCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div>{course.name}</div>
                        {course.classroom && (
                          <div className="text-xs text-gray-400">{course.classroom}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{course.departmentName}</td>
                      <td className="px-4 py-3 text-gray-600">{course.professorName}</td>
                      <td className="px-4 py-3 text-center text-gray-700 font-medium">{course.credit}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                        {COURSE_TYPE_LABELS[course.courseType] ?? course.courseType}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        <span className={course.currentEnrollment >= course.maxEnrollment ? 'text-red-500 font-medium' : ''}>
                          {course.currentEnrollment}
                        </span>
                        <span className="text-gray-400">/{course.maxEnrollment}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={course.status} />
                      </td>
                      {user?.role === 'STUDENT' && (
                        <td className="px-4 py-3 text-center">
                          {feedback ? (
                            <span className={`text-xs font-medium ${feedback.ok ? 'text-green-600' : 'text-red-500'}`}>
                              {feedback.msg}
                            </span>
                          ) : (
                            <button
                              onClick={() => enrollMutation.mutate(course.id)}
                              disabled={
                                course.status !== 'OPEN' ||
                                course.currentEnrollment >= course.maxEnrollment ||
                                enrollMutation.isPending
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                            >
                              수강신청
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              전체 {data?.totalElements ?? 0}개 강의
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
