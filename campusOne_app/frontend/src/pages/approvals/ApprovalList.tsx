import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { approvalsApi } from '@/api/approvals';
import { FilePlus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { ApprovalStatus } from '@/types';

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; className: string }> = {
  DRAFT:       { label: '임시저장', className: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: '결재 중',  className: 'bg-blue-100 text-blue-700' },
  APPROVED:    { label: '승인',     className: 'bg-green-100 text-green-700' },
  REJECTED:    { label: '반려',     className: 'bg-red-100 text-red-600' },
};

const BOX_TABS = [
  { value: undefined,  label: '전체' },
  { value: 'DRAFT',    label: '기안함' },
  { value: 'PENDING',  label: '결재함' },
  { value: 'DONE',     label: '완료함' },
] as const;

type BoxType = (typeof BOX_TABS)[number]['value'];

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function ApprovalList() {
  const navigate = useNavigate();
  const [box, setBox]   = useState<BoxType>(undefined);
  const [page, setPage] = useState(0);

  const params = { ...(box ? { box } : {}), page, size: 15 };

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', params],
    queryFn: () => approvalsApi.list(params),
  });

  const docs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">전자결재</h1>
          <p className="text-sm text-gray-500 mt-1">결재 문서를 기안하고 처리합니다.</p>
        </div>
        <button
          onClick={() => navigate('/approvals/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FilePlus size={16} />
          문서 기안
        </button>
      </div>

      {/* Box tabs */}
      <div className="flex gap-1.5 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        {BOX_TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => { setBox(tab.value); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              box === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">목록을 불러오는 중...</span>
          </div>
        ) : !docs.length ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            결재 문서가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">제목</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">양식</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">기안자</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">현재 단계</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">기안일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.map((doc) => {
                  const sc = STATUS_CONFIG[doc.status];
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/approvals/${doc.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 hover:text-blue-700">
                        {doc.title}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{doc.templateName}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.drafterName}</td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {doc.status === 'IN_PROGRESS' ? `${doc.currentStep}단계` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-400">
                        {formatDate(doc.submittedAt)}
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
            <p className="text-sm text-gray-500">전체 {data?.totalElements ?? 0}건</p>
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
