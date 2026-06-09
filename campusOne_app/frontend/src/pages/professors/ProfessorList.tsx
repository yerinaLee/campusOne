import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { professorsApi } from '@/api/professors';
import { useAuthStore } from '@/store/authStore';
import { Search, ChevronLeft, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import type { ProfessorStatus } from '@/types';

const STATUS_CONFIG: Record<ProfessorStatus, { label: string; className: string }> = {
  ACTIVE:  { label: '재직', className: 'bg-green-100 text-green-700' },
  LEAVE:   { label: '휴직', className: 'bg-yellow-100 text-yellow-700' },
  RETIRED: { label: '퇴직', className: 'bg-gray-100 text-gray-600' },
};

export default function ProfessorList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const [keyword, setKeyword] = useState('');
  const [inputKw, setInputKw] = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(0);

  const params = {
    ...(keyword ? { keyword } : {}),
    ...(status  ? { status }  : {}),
    page, size: 20,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['professors', params],
    queryFn: () => professorsApi.list(params),
  });

  const handleSearch = () => { setKeyword(inputKw); setPage(0); };
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">교수 관리</h1>
          <p className="text-sm text-gray-500 mt-1">등록된 교수 목록을 조회합니다.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/professors/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={16} />
            교수 등록
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">검색 (교번·이름)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKw}
                onChange={(e) => setInputKw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="교번 또는 이름으로 검색"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              <button onClick={handleSearch} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
              <option value="ACTIVE">재직</option>
              <option value="LEAVE">휴직</option>
              <option value="RETIRED">퇴직</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">교수 목록을 불러오는 중...</span>
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
                  <th className="px-4 py-3 text-left font-medium text-gray-600">교번</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">학과</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">직위</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">이메일</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.content.map((p) => {
                  const sc = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.professorNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.departmentName}</td>
                      <td className="px-4 py-3 text-gray-600">{p.position ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/professors/${p.id}`)}
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
