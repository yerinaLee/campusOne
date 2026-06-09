import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesApi } from '@/api/notices';
import { useAuthStore } from '@/store/authStore';
import { FileEdit, ArrowLeft, Pin } from 'lucide-react';

const CATEGORIES = [
  { value: 'GENERAL', label: '일반' },
  { value: 'ACADEMIC', label: '학사' },
  { value: 'DEPARTMENT', label: '학과' },
  { value: 'COURSE', label: '강의' },
];

export default function NoticeCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: noticesApi.create,
    onSuccess: (notice) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      navigate(`/notices/${notice.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '공지사항 작성에 실패했습니다.';
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }
    createMutation.mutate({ title: title.trim(), content: content.trim(), category, isPinned });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        id="btn-back"
        onClick={() => navigate('/notices')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
      >
        <ArrowLeft size={16} />
        목록으로
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileEdit size={20} className="text-blue-600" />
            공지사항 작성
          </h1>
          <p className="text-sm text-gray-500 mt-1">작성자: {user?.name} ({user?.role})</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  id={`cat-${cat.value}`}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    category === cat.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="notice-title" className="block text-sm font-medium text-gray-700 mb-1.5">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="notice-content" className="block text-sm font-medium text-gray-700 mb-1.5">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="notice-content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 입력하세요"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Pin option (admin only) */}
          {user?.role === 'ADMIN' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="chk-pinned"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Pin size={14} className="text-red-500" />
              <span className="text-sm text-gray-700 font-medium">상단 고정</span>
            </label>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/notices')}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              id="btn-submit"
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {createMutation.isPending ? '저장 중...' : '공지 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
