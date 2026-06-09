import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { noticesApi } from '@/api/notices';
import { useAuthStore } from '@/store/authStore';
import { Bell, Pin, ChevronLeft, ChevronRight, PlusCircle, Eye } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'GENERAL', label: '일반' },
  { value: 'ACADEMIC', label: '학사' },
  { value: 'DEPARTMENT', label: '학과' },
  { value: 'COURSE', label: '강의' },
];

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-100 text-gray-600',
  ACADEMIC: 'bg-blue-100 text-blue-700',
  DEPARTMENT: 'bg-purple-100 text-purple-700',
  COURSE: 'bg-orange-100 text-orange-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: '일반',
  ACADEMIC: '학사',
  DEPARTMENT: '학과',
  COURSE: '강의',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function NoticeList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);

  const canCreate = user && ['ADMIN', 'STAFF', 'PROFESSOR'].includes(user.role);

  const { data, isLoading } = useQuery({
    queryKey: ['notices', category, page],
    queryFn: () => noticesApi.list({ category: category || undefined, page, size: 10 }),
  });

  const notices = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-600" size={24} />
            공지사항
          </h1>
          <p className="text-gray-500 text-sm mt-1">학교 공지사항을 확인합니다.</p>
        </div>
        {canCreate && (
          <button
            id="btn-notice-create"
            onClick={() => navigate('/notices/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle size={16} />
            공지 작성
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            id={`tab-${cat.value || 'all'}`}
            onClick={() => {
              setCategory(cat.value);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notice list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Bell size={40} className="mx-auto mb-3 opacity-25" />
            공지사항이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notices.map((notice) => (
              <li key={notice.id}>
                <button
                  id={`notice-${notice.id}`}
                  onClick={() => navigate(`/notices/${notice.id}`)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {notice.isPinned && (
                        <Pin size={14} className="text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {notice.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              CATEGORY_COLORS[notice.category] ?? 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {CATEGORY_LABELS[notice.category] ?? notice.category}
                          </span>
                          <span className="text-xs text-gray-400">{notice.authorName}</span>
                          {notice.departmentName && (
                            <span className="text-xs text-gray-400">· {notice.departmentName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {notice.viewCount}
                      </span>
                      <span>{formatDate(notice.createdAt)}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                i === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
