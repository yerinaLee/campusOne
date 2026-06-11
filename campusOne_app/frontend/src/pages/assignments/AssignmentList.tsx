import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Plus, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { assignmentsApi } from '@/api/assignments';
import { coursesApi } from '@/api/courses';
import { useAuthStore } from '@/store/authStore';
import type { AssignmentListItem, AssignmentStatus } from '@/types';

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  OPEN: '진행중',
  CLOSED: '마감',
  GRADED: '채점완료',
};

const STATUS_COLOR: Record<AssignmentStatus, string> = {
  OPEN: 'text-green-700 bg-green-50',
  CLOSED: 'text-gray-600 bg-gray-100',
  GRADED: 'text-blue-700 bg-blue-50',
};

function getDDays(dueDate: string) {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return <span className="text-red-500">마감</span>;
  if (diff === 0) return <span className="text-orange-500">오늘 마감</span>;
  return <span className="text-gray-500">D-{diff}</span>;
}

export default function AssignmentList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isProfessor = user?.role === 'PROFESSOR';

  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');

  const { data: courses } = useQuery({
    queryKey: ['courses', 'list'],
    queryFn: () => coursesApi.list({ size: 100 }),
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', selectedCourseId],
    queryFn: () => assignmentsApi.list({ courseId: selectedCourseId as number }),
    enabled: !!selectedCourseId,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">과제</h1>
          <p className="text-gray-500 text-sm mt-1">강의별 과제를 조회합니다.</p>
        </div>
        {isProfessor && selectedCourseId && (
          <button
            onClick={() => navigate(`/assignments/create?courseId=${selectedCourseId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            과제 개설
          </button>
        )}
      </div>

      {/* 강의 선택 */}
      <div className="relative w-72">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : '')}
          className="w-full pl-3.5 pr-8 py-2.5 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        >
          <option value="">강의를 선택하세요</option>
          {courses?.content?.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.year}-{c.semester})</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {!selectedCourseId ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">강의를 선택하면 과제 목록이 표시됩니다.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !assignments?.length ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">등록된 과제가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a: AssignmentListItem) => (
            <div
              key={a.id}
              onClick={() => navigate(`/assignments/${a.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-sm hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status as AssignmentStatus]}`}>
                      {STATUS_LABEL[a.status as AssignmentStatus] ?? a.status}
                    </span>
                    <span className="text-xs text-gray-400">{a.submissionType}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{a.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      마감 {a.dueDate.slice(0, 16).replace('T', ' ')}
                    </span>
                    <span>만점 {a.maxScore}점</span>
                    {a.allowLateSubmit && <span className="text-orange-500">지각 제출 허용</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium text-gray-600">{getDDays(a.dueDate)}</div>
                  {isProfessor && a.submittedCount !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 justify-end">
                      <CheckCircle2 size={12} className="text-green-500" />
                      {a.submittedCount}/{a.totalEnrolled}명 제출
                    </div>
                  )}
                  {!isProfessor && a.mySubmission && (
                    <span className="text-xs text-green-600 font-medium">제출 완료</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
