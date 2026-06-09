import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/api/students';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { StudentStatus } from '@/types';

const STATUS_CONFIG: Record<StudentStatus, { label: string; className: string }> = {
  ENROLLED:  { label: '재학',   className: 'bg-green-100 text-green-700' },
  LEAVE:     { label: '휴학',   className: 'bg-yellow-100 text-yellow-700' },
  GRADUATED: { label: '졸업',   className: 'bg-blue-100 text-blue-700' },
  EXPELLED:  { label: '제적',   className: 'bg-red-100 text-red-600' },
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const canManage = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.get(Number(id)),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: () => studentsApi.changeStatus(Number(id), { status: newStatus, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setShowStatusModal(false);
      setReason('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-500">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-500 text-sm">학생 정보를 불러오는 데 실패했습니다.</p>
      </div>
    );
  }

  const sc = STATUS_CONFIG[data.status];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        학생 목록
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{data.studentNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sc.className}`}>
              {sc.label}
            </span>
            {canManage && (
              <button
                onClick={() => { setNewStatus(data.status); setShowStatusModal(true); }}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                상태 변경
              </button>
            )}
          </div>
        </div>

        {/* Info grid */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5">
          <Field label="학과"        value={data.departmentName} />
          <Field label="단과대학"    value={data.collegeName} />
          <Field label="학년/학기"   value={`${data.grade}학년 ${data.semester}학기`} />
          <Field label="입학연도"    value={data.admissionYear} />
          <Field label="이메일"      value={data.email} />
          <Field label="전화번호"    value={data.phone} />
          <Field label="생년월일"    value={data.birthDate} />
          <Field label="주소"        value={data.address} />
          <Field label="등록일"      value={data.createdAt ? new Date(data.createdAt).toLocaleDateString('ko-KR') : null} />
        </dl>
      </div>

      {/* Status change modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">학생 상태 변경</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">새 상태</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="ENROLLED">재학</option>
                  <option value="LEAVE">휴학</option>
                  <option value="GRADUATED">졸업</option>
                  <option value="EXPELLED">제적</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">사유 (선택)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="상태 변경 사유"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>
            {statusMutation.isError && (
              <p className="mt-2 text-xs text-red-500">변경에 실패했습니다.</p>
            )}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => statusMutation.mutate()}
                disabled={!newStatus || statusMutation.isPending}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {statusMutation.isPending ? '처리 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
