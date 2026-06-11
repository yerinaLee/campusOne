import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpenCheck, Plus, ChevronDown } from 'lucide-react';
import { examsApi } from '@/api/exams';
import { coursesApi } from '@/api/courses';
import { useAuthStore } from '@/store/authStore';
import type { ExamListItem, ExamType, ExamStatus } from '@/types';

const TYPE_LABEL: Record<ExamType, string> = {
  MIDTERM: '중간고사', FINAL: '기말고사', QUIZ: '쪽지시험', MAKEUP: '재시험', EXTRA: '추가시험',
};

const TYPE_COLOR: Record<ExamType, string> = {
  MIDTERM: 'text-red-700 bg-red-50',
  FINAL: 'text-purple-700 bg-purple-50',
  QUIZ: 'text-blue-700 bg-blue-50',
  MAKEUP: 'text-orange-700 bg-orange-50',
  EXTRA: 'text-teal-700 bg-teal-50',
};

const STATUS_LABEL: Record<ExamStatus, string> = {
  SCHEDULED: '예정', ONGOING: '진행중', COMPLETED: '완료', CANCELLED: '취소',
};

export default function ExamList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCreate = user?.role === 'PROFESSOR' || user?.role === 'STAFF' || user?.role === 'ADMIN';

  const [courseId, setCourseId] = useState<number | ''>('');
  const [examType, setExamType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: courses } = useQuery({
    queryKey: ['courses', 'list'],
    queryFn: () => coursesApi.list({ size: 100 }),
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams', courseId, examType, from, to],
    queryFn: () => examsApi.list({
      courseId: courseId || undefined,
      examType: examType || undefined,
      from: from || undefined,
      to: to || undefined,
      size: 50,
    }),
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시험 일정</h1>
          <p className="text-gray-500 text-sm mt-1">강의별 시험 일정을 조회합니다.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/exams/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            시험 등록
          </button>
        )}
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
            className="pl-3.5 pr-8 py-2 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          >
            <option value="">전체 강의</option>
            {courses?.content?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="pl-3.5 pr-8 py-2 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          >
            <option value="">전체 유형</option>
            {(Object.keys(TYPE_LABEL) as ExamType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          <span className="text-gray-400 text-sm">~</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !exams?.content?.length ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpenCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">시험 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.content.map((e: ExamListItem) => (
            <div
              key={e.id}
              onClick={() => navigate(`/exams/${e.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-sm hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[e.examType as ExamType]}`}>
                      {TYPE_LABEL[e.examType as ExamType] ?? e.examType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      e.status === 'SCHEDULED' ? 'text-blue-600 bg-blue-50'
                      : e.status === 'ONGOING' ? 'text-green-600 bg-green-50'
                      : e.status === 'COMPLETED' ? 'text-gray-500 bg-gray-100'
                      : 'text-red-500 bg-red-50'
                    }`}>
                      {STATUS_LABEL[e.status as ExamStatus] ?? e.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.courseName}</p>
                </div>
                <div className="flex-shrink-0 text-right text-sm">
                  <p className="font-medium text-gray-700">{e.examDate}</p>
                  <p className="text-xs text-gray-400">{e.startTime.slice(11, 16)} ~ {e.endTime.slice(11, 16)}</p>
                  {e.room && <p className="text-xs text-gray-400">{e.room}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
