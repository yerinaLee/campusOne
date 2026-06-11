import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Mail, Lock, ChevronDown } from 'lucide-react';
import { counselingApi } from '@/api/counseling';
import { useAuthStore } from '@/store/authStore';
import type { CounselingRecordListItem } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  ACADEMIC: '학업', MENTAL: '심리', CAREER: '진로',
  FINANCIAL: '장학/재정', PERSONAL: '개인', ETC: '기타',
};

export default function CounselingHistory() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isStaff = user?.role === 'PROFESSOR' || user?.role === 'STAFF' || user?.role === 'ADMIN';

  const [typeFilter, setTypeFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['counseling', 'records', typeFilter, from, to],
    queryFn: () =>
      counselingApi.listRecords({
        counselingType: typeFilter || undefined,
        from: from || undefined,
        to: to || undefined,
        size: 50,
      }),
  });

  const { data: detail } = useQuery({
    queryKey: ['counseling', 'records', selectedId],
    queryFn: () => counselingApi.getRecord(selectedId!),
    enabled: selectedId != null,
  });

  const notifyMutation = useMutation({
    mutationFn: (id: number) => counselingApi.notifyRecord(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['counseling', 'records'] }),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">상담 기록</h1>
        <p className="text-gray-500 text-sm mt-1">상담 기록을 조회합니다.</p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-3.5 pr-8 py-2 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          >
            <option value="">전체 유형</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          <span>~</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        {(typeFilter || from || to) && (
          <button onClick={() => { setTypeFilter(''); setFrom(''); setTo(''); }}
            className="text-xs text-blue-600 hover:underline">초기화</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 목록 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : !records?.content?.length ? (
            <div className="text-center py-14 text-gray-400">
              <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">기록이 없습니다.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {records.content.map((r: CounselingRecordListItem) => (
                <li
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === r.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {r.isConfidential && <Lock size={12} className="text-gray-400 flex-shrink-0" />}
                        <p className="text-sm font-medium text-gray-800 truncate">{r.subject}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.studentName} · {TYPE_LABELS[r.counselingType] ?? r.counselingType} · {r.counselorName}
                      </p>
                      <p className="text-xs text-gray-400">{r.counseledAt.slice(0, 10)}</p>
                    </div>
                    {r.isNotified && (
                      <Mail size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 상세 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {!selectedId ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">목록에서 기록을 선택하세요.</p>
            </div>
          ) : !detail ? (
            <div className="text-center py-12 text-gray-300 animate-pulse">로딩 중...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {detail.isConfidential && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <Lock size={10} /> 비밀 상담
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mt-1">{detail.subject}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {detail.studentName} · {TYPE_LABELS[detail.counselingType] ?? detail.counselingType} · 상담사 {detail.counselorName}
                  </p>
                  <p className="text-xs text-gray-400">{detail.counseledAt.slice(0, 16).replace('T', ' ')}</p>
                </div>
                {isStaff && !detail.isNotified && (
                  <button
                    onClick={() => notifyMutation.mutate(detail.id)}
                    disabled={notifyMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Mail size={13} />
                    {notifyMutation.isPending ? '발송 중...' : '이메일 발송'}
                  </button>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">상담 내용</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{detail.content}</p>
                </div>
                {detail.outcome && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">결과 / 조치</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{detail.outcome}</p>
                  </div>
                )}
                {detail.followUp && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">후속 조치</p>
                    <p className="text-gray-700">{detail.followUp}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
