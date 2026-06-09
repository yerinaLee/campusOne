import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '@/api/enrollments';
import { Loader2, Trash2 } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  ENROLLED: '수강 중',
  CANCELLED: '취소됨',
  COMPLETED: '수강 완료',
  PENDING: '대기 중',
};

const SEMESTER_LABELS: Record<number, string> = {
  1: '1학기',
  2: '2학기',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function MyEnrollments() {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: enrollmentsApi.myEnrollments,
  });

  const withdrawMutation = useMutation({
    mutationFn: enrollmentsApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setConfirmId(null);
    },
  });

  const handleWithdraw = (id: number) => {
    setConfirmId(id);
  };

  const confirmWithdraw = () => {
    if (confirmId !== null) {
      withdrawMutation.mutate(confirmId);
    }
  };

  const totalCredits = data
    ?.filter((e) => e.status !== 'CANCELLED')
    .reduce((sum, e) => sum + e.credit, 0) ?? 0;

  const activeCount = data?.filter((e) => e.status !== 'CANCELLED').length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Confirm modal */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">수강 취소 확인</h3>
            <p className="text-sm text-gray-600 mb-5">
              해당 강의 수강신청을 취소하시겠습니까?<br />
              취소 후에는 재신청이 필요합니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-colors"
              >
                {withdrawMutation.isPending ? '처리 중...' : '수강 취소'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">수강신청 현황</h1>
        <p className="text-gray-500 mt-1 text-sm">현재 수강신청한 강의 목록입니다.</p>
      </div>

      {/* Summary */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">수강 중인 강의</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}개</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">등록 학점</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCredits}학점</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">수강 목록을 불러오는 중...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500 text-sm">
            수강 목록을 불러오는 데 실패했습니다.
          </div>
        ) : !data?.length ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">수강신청한 강의가 없습니다.</p>
            <p className="text-gray-400 text-xs mt-1">강의 목록에서 수강신청을 진행하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">과목명</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">교수</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">학점</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">학기</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">수강신청일</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">수강취소</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((enrollment) => {
                  const isCancelled = enrollment.status === 'CANCELLED';
                  return (
                    <tr
                      key={enrollment.id}
                      className={`transition-colors ${isCancelled ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className={`font-medium text-gray-900 ${isCancelled ? 'line-through' : ''}`}>
                          {enrollment.courseName}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{enrollment.courseCode}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{enrollment.professorName}</td>
                      <td className="px-4 py-3 text-center text-gray-700 font-medium">{enrollment.credit}</td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {enrollment.year}년 {SEMESTER_LABELS[enrollment.semester] ?? `${enrollment.semester}학기`}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.status === 'ENROLLED'
                              ? 'bg-green-100 text-green-700'
                              : enrollment.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {STATUS_LABELS[enrollment.status] ?? enrollment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {formatDate(enrollment.enrolledAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!isCancelled && (
                          <button
                            onClick={() => handleWithdraw(enrollment.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                            취소
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
