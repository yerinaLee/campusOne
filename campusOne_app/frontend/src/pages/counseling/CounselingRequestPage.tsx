import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, ChevronDown } from 'lucide-react';
import { counselingApi } from '@/api/counseling';
import type { CounselingType, CounselingRequestStatus } from '@/types';

const TYPE_LABELS: Record<CounselingType, string> = {
  ACADEMIC: '학업',
  MENTAL: '심리',
  CAREER: '진로',
  FINANCIAL: '장학/재정',
  PERSONAL: '개인',
  ETC: '기타',
};

const STATUS_LABEL: Record<CounselingRequestStatus, string> = {
  PENDING: '접수',
  ACCEPTED: '수락',
  REJECTED: '거절',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

const STATUS_COLOR: Record<CounselingRequestStatus, string> = {
  PENDING: 'text-yellow-700 bg-yellow-50',
  ACCEPTED: 'text-blue-700 bg-blue-50',
  REJECTED: 'text-red-700 bg-red-50',
  COMPLETED: 'text-green-700 bg-green-50',
  CANCELLED: 'text-gray-600 bg-gray-100',
};

export default function CounselingRequestPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [counselingType, setCounselingType] = useState<CounselingType>('ACADEMIC');
  const [preferredDate, setPreferredDate] = useState('');
  const [reason, setReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['counseling', 'requests', 'my'],
    queryFn: () => counselingApi.listRequests(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      counselingApi.createRequest({
        counselingType,
        preferredDate: preferredDate || undefined,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling', 'requests', 'my'] });
      setShowForm(false);
      setCounselingType('ACADEMIC');
      setPreferredDate('');
      setReason('');
    },
  });

  const errorMsg = (createMutation.error as { response?: { data?: { message?: string } } } | null)
    ?.response?.data?.message;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상담 신청</h1>
          <p className="text-gray-500 text-sm mt-1">교수 또는 교직원에게 상담을 신청합니다.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          상담 신청
        </button>
      </div>

      {/* 신청 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">새 상담 신청</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 유형</label>
            <div className="relative">
              <select
                value={counselingType}
                onChange={(e) => setCounselingType(e.target.value as CounselingType)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                {(Object.keys(TYPE_LABELS) as CounselingType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">희망 상담일 (선택)</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">상담 신청 사유 <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="상담이 필요한 이유를 구체적으로 작성해주세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!reason.trim() || createMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {createMutation.isPending ? '신청 중...' : '신청하기'}
            </button>
          </div>
        </div>
      )}

      {/* 내 신청 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">내 상담 신청 내역</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : !requests?.content?.length ? (
          <div className="text-center py-14 text-gray-400">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">신청 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.content.map((req) => (
              <li key={req.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{TYPE_LABELS[req.counselingType]}</span>
                    {req.preferredDate && (
                      <span className="text-xs text-gray-400">희망일 {req.preferredDate}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">신청일 {req.createdAt.slice(0, 10)}</p>
                  {req.rejectReason && (
                    <p className="text-xs text-red-500 mt-1">거절 사유: {req.rejectReason}</p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[req.status as CounselingRequestStatus]}`}
                >
                  {STATUS_LABEL[req.status as CounselingRequestStatus] ?? req.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
