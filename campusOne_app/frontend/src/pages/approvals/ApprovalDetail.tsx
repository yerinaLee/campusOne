import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '@/api/approvals';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { ApprovalStatus } from '@/types';

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; className: string }> = {
  DRAFT:       { label: '임시저장', className: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: '결재 중',  className: 'bg-blue-100 text-blue-700' },
  APPROVED:    { label: '승인',     className: 'bg-green-100 text-green-700' },
  REJECTED:    { label: '반려',     className: 'bg-red-100 text-red-600' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comment, setComment] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['approvals', id],
    queryFn: () => approvalsApi.get(Number(id)),
    enabled: !!id,
  });

  const processMutation = useMutation({
    mutationFn: () => approvalsApi.process(Number(id), { action, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      setShowActionModal(false);
      setComment('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-500">
        <Loader2 size={20} className="animate-spin" /><span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  if (isError || !data) {
    return <div className="p-6 max-w-3xl mx-auto"><p className="text-red-500 text-sm">문서를 불러오는 데 실패했습니다.</p></div>;
  }

  const sc = STATUS_CONFIG[data.status];

  const pendingLine = data.approvalLines.find(
    (l) => l.step === data.currentStep && l.action === null
  );
  const canProcess = data.status === 'IN_PROGRESS' && pendingLine?.approverId === user?.id;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/approvals')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        전자결재 목록
      </button>

      {/* Document info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">{data.templateName}</p>
            <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
            <p className="text-sm text-gray-500 mt-1">기안자: {data.drafterName} · {formatDate(data.submittedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sc.className}`}>
              {sc.label}
            </span>
            {canProcess && (
              <button
                onClick={() => setShowActionModal(true)}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                결재 처리
              </button>
            )}
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.content}</p>
        </div>
      </div>

      {/* Approval lines */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="font-semibold text-gray-900 text-sm px-5 py-4 border-b border-gray-100">결재선</h2>
        <div className="divide-y divide-gray-100">
          {data.approvalLines
            .sort((a, b) => a.step - b.step)
            .map((line) => {
              const isDone = line.action !== null;
              const isCurrent = line.step === data.currentStep && data.status === 'IN_PROGRESS';
              return (
                <div key={line.id} className="px-5 py-4 flex items-start gap-4">
                  <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    line.action === 'APPROVED' ? 'bg-green-100' :
                    line.action === 'REJECTED' ? 'bg-red-100' :
                    isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {line.action === 'APPROVED' ? <CheckCircle size={16} className="text-green-600" /> :
                     line.action === 'REJECTED' ? <XCircle size={16} className="text-red-500" /> :
                     isCurrent ? <Clock size={16} className="text-blue-600 animate-pulse" /> :
                     <span className="text-xs font-bold text-gray-500">{line.step}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{line.approverName}</p>
                      {line.roleLabel && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{line.roleLabel}</span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">결재 대기</span>
                      )}
                    </div>
                    {line.comment && (
                      <p className="text-xs text-gray-500 mt-1">"{line.comment}"</p>
                    )}
                    {line.actionAt && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(line.actionAt)}</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Process modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">결재 처리</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setAction('APPROVED')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    action === 'APPROVED'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  승인
                </button>
                <button
                  onClick={() => setAction('REJECTED')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    action === 'REJECTED'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  반려
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">의견 (선택)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="결재 의견을 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            {processMutation.isError && (
              <p className="mt-2 text-xs text-red-500">처리에 실패했습니다.</p>
            )}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => processMutation.mutate()}
                disabled={processMutation.isPending}
                className={`flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 transition-colors ${
                  action === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processMutation.isPending ? '처리 중...' : action === 'APPROVED' ? '승인' : '반려'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
