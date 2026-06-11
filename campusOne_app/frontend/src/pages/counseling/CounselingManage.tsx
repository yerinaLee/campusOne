import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, PenLine, ChevronDown } from 'lucide-react';
import { counselingApi } from '@/api/counseling';
import type { CounselingRequestItem, CounselingType } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  ACADEMIC: '학업',
  MENTAL: '심리',
  CAREER: '진로',
  FINANCIAL: '장학/재정',
  PERSONAL: '개인',
  ETC: '기타',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-700 bg-yellow-50',
  ACCEPTED: 'text-blue-700 bg-blue-50',
  REJECTED: 'text-red-700 bg-red-50',
  COMPLETED: 'text-green-700 bg-green-50',
  CANCELLED: 'text-gray-600 bg-gray-100',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: '접수', ACCEPTED: '수락', REJECTED: '거절', COMPLETED: '완료', CANCELLED: '취소',
};

interface RecordForm {
  requestId?: number;
  studentId: number;
  counselingType: CounselingType;
  subject: string;
  content: string;
  outcome: string;
  followUp: string;
  counseledAt: string;
  isConfidential: boolean;
}

export default function CounselingManage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [recordModal, setRecordModal] = useState<{ requestItem: CounselingRequestItem } | null>(null);
  const [form, setForm] = useState<RecordForm | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['counseling', 'requests', 'manage', statusFilter],
    queryFn: () => counselingApi.listRequests({ status: statusFilter || undefined, size: 50 }),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => counselingApi.acceptRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['counseling', 'requests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      counselingApi.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling', 'requests'] });
      setRejectModal(null);
      setRejectReason('');
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: (f: RecordForm) => counselingApi.createRecord(f),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling'] });
      setRecordModal(null);
      setForm(null);
    },
  });

  const openRecordModal = (req: CounselingRequestItem) => {
    setRecordModal({ requestItem: req });
    setForm({
      requestId: req.id,
      studentId: 0,
      counselingType: req.counselingType,
      subject: '',
      content: '',
      outcome: '',
      followUp: '',
      counseledAt: new Date().toISOString().slice(0, 16),
      isConfidential: false,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">상담 신청 관리</h1>
        <p className="text-gray-500 text-sm mt-1">학생의 상담 신청을 처리하고 기록을 작성합니다.</p>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3">
        {['', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s ? (STATUS_LABEL[s] ?? s) : '전체'}
          </button>
        ))}
      </div>

      {/* 신청 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : !requests?.content?.length ? (
          <div className="text-center py-14 text-gray-400 text-sm">신청 내역이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">학생</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">유형</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">희망일</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">신청일</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">상태</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.content.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{req.studentName}</p>
                    <p className="text-xs text-gray-400">{req.studentNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[req.counselingType] ?? req.counselingType}</td>
                  <td className="px-4 py-3 text-gray-500">{req.preferredDate ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{req.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[req.status] ?? ''}`}>
                      {STATUS_LABEL[req.status] ?? req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => acceptMutation.mutate(req.id)}
                            className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="수락"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setRejectModal({ id: req.id })}
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="거절"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {(req.status === 'ACCEPTED' || req.status === 'COMPLETED') && (
                        <button
                          onClick={() => openRecordModal(req)}
                          className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="기록 작성"
                        >
                          <PenLine size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 거절 모달 */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-semibold text-gray-800">상담 거절</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">거절 사유</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                placeholder="거절 사유를 입력하세요."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg"
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기록 작성 모달 */}
      {recordModal && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg space-y-4 my-4">
            <h3 className="text-base font-semibold text-gray-800">상담 기록 작성</h3>
            <p className="text-sm text-gray-500">학생: {recordModal.requestItem.studentName} ({recordModal.requestItem.studentNumber})</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 유형</label>
              <div className="relative">
                <select
                  value={form.counselingType}
                  onChange={(e) => setForm({ ...form, counselingType: e.target.value as CounselingType })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 제목 *</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="상담 주제를 입력하세요."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 내용 *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 결과 / 조치</label>
              <textarea
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">후속 조치 메모</label>
              <input
                value={form.followUp}
                onChange={(e) => setForm({ ...form, followUp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 일시 *</label>
              <input
                type="datetime-local"
                value={form.counseledAt}
                onChange={(e) => setForm({ ...form, counseledAt: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isConfidential}
                onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">비밀 상담 (학생 조회 차단)</span>
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => { setRecordModal(null); setForm(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!form.subject || !form.content || !form.counseledAt) return;
                  createRecordMutation.mutate({
                    ...form,
                    counseledAt: form.counseledAt + ':00+09:00',
                    outcome: form.outcome || undefined,
                    followUp: form.followUp || undefined,
                  } as Parameters<typeof counselingApi.createRecord>[0]);
                }}
                disabled={!form.subject || !form.content || createRecordMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg"
              >
                {createRecordMutation.isPending ? '저장 중...' : '기록 저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
