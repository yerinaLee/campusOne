import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { noticesApi } from '@/api/notices';
import { ArrowLeft, Eye, Calendar, User, Tag, Pin } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: '일반',
  ACADEMIC: '학사',
  DEPARTMENT: '학과',
  COURSE: '강의',
};

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-100 text-gray-600',
  ACADEMIC: 'bg-blue-100 text-blue-700',
  DEPARTMENT: 'bg-purple-100 text-purple-700',
  COURSE: 'bg-orange-100 text-orange-700',
};

function formatDatetime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: notice, isLoading, isError } = useQuery({
    queryKey: ['notice', id],
    queryFn: () => noticesApi.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !notice) {
    return (
      <div className="p-6 text-center text-gray-400">
        공지사항을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        id="btn-back"
        onClick={() => navigate('/notices')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
      >
        <ArrowLeft size={16} />
        목록으로
      </button>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Title section */}
        <div className="px-6 py-5 border-b border-gray-100">
          {notice.isPinned && (
            <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium mb-2">
              <Pin size={13} />
              고정된 공지사항
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{notice.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {notice.authorName}
            </span>
            {notice.departmentName && (
              <span className="flex items-center gap-1.5">
                <Tag size={14} />
                {notice.departmentName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDatetime(notice.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} />
              조회 {notice.viewCount}
            </span>
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                CATEGORY_COLORS[notice.category] ?? 'bg-gray-100 text-gray-500'
              }`}
            >
              {CATEGORY_LABELS[notice.category] ?? notice.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-48">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
            {notice.content}
          </div>
        </div>
      </div>
    </div>
  );
}
