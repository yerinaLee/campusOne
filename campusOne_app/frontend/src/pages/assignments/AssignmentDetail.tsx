import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, CheckCircle2, PenLine, Upload } from 'lucide-react';
import { assignmentsApi } from '@/api/assignments';
import { useAuthStore } from '@/store/authStore';
import type { SubmissionListItem } from '@/types';

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const assignmentId = Number(id);

  const isProfessor = user?.role === 'PROFESSOR';
  const isStudent = user?.role === 'STUDENT';

  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gradeModal, setGradeModal] = useState<{ submissionId: number; studentName: string } | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignments', assignmentId],
    queryFn: () => assignmentsApi.get(assignmentId),
  });

  const { data: mySubmission } = useQuery({
    queryKey: ['assignments', assignmentId, 'my'],
    queryFn: () => assignmentsApi.getMySubmission(assignmentId),
    enabled: isStudent,
  });

  const { data: submissions } = useQuery({
    queryKey: ['assignments', assignmentId, 'submissions'],
    queryFn: () => assignmentsApi.getSubmissions(assignmentId),
    enabled: isProfessor,
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      if (assignment?.submissionType === 'FILE' && selectedFile) {
        return assignmentsApi.submitFile(assignmentId, selectedFile, textContent || undefined);
      }
      return assignmentsApi.submit(assignmentId, { content: textContent });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId] }),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ submissionId }: { submissionId: number }) =>
      assignmentsApi.grade(assignmentId, submissionId, {
        score: parseFloat(score),
        feedback: feedback || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId, 'submissions'] });
      setGradeModal(null);
      setScore('');
      setFeedback('');
    },
  });

  if (isLoading) {
    return <div className="p-6 animate-pulse space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
    </div>;
  }

  if (!assignment) return null;

  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> 목록으로
      </button>

      {/* 과제 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">{assignment.courseName}</p>
            <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
          </div>
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
            assignment.status === 'OPEN' ? 'text-green-700 bg-green-50'
            : assignment.status === 'GRADED' ? 'text-blue-700 bg-blue-50'
            : 'text-gray-600 bg-gray-100'
          }`}>
            {assignment.status === 'OPEN' ? '진행중' : assignment.status === 'GRADED' ? '채점완료' : '마감'}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            마감 {assignment.dueDate.slice(0, 16).replace('T', ' ')}
            {isPastDue && <span className="text-red-500 ml-1">(마감됨)</span>}
          </span>
          <span>만점 {assignment.maxScore}점</span>
          <span>제출 형식: {assignment.submissionType === 'FILE' ? '파일' : assignment.submissionType === 'TEXT' ? '텍스트' : '파일 또는 텍스트'}</span>
          {assignment.allowLateSubmit && <span className="text-orange-500">지각 제출 허용</span>}
        </div>

        {assignment.description && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {assignment.description}
          </div>
        )}
      </div>

      {/* 학생 제출 폼 */}
      {isStudent && !mySubmission && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">과제 제출</h2>

          {(assignment.submissionType === 'FILE' || assignment.submissionType === 'BOTH') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">파일 첨부</label>
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-gray-500">{selectedFile ? selectedFile.name : '파일을 선택하세요'}</span>
                <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}

          {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'BOTH') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">텍스트 제출</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                placeholder="답안을 작성해주세요."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>
          )}

          {(() => {
            const err = (submitMutation.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
            return err ? <p className="text-sm text-red-600">{err}</p> : null;
          })()}

          <div className="flex justify-end">
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || (!textContent && !selectedFile)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircle2 size={16} />
              {submitMutation.isPending ? '제출 중...' : '제출하기'}
            </button>
          </div>
        </div>
      )}

      {/* 학생 제출 결과 */}
      {isStudent && mySubmission && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-800">제출 결과</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">상태</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {mySubmission.status === 'SUBMITTED' ? '제출 완료' : mySubmission.status === 'LATE' ? '지각 제출' : '채점 완료'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">제출 시각</p>
              <p className="font-medium text-gray-800 mt-0.5">{mySubmission.submittedAt.slice(0, 16).replace('T', ' ')}</p>
            </div>
            {mySubmission.score !== null && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-400">점수</p>
                <p className="font-bold text-blue-800 text-xl mt-0.5">{mySubmission.score} <span className="text-sm font-normal">/ {mySubmission.maxScore}</span></p>
              </div>
            )}
            {mySubmission.fileName && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">제출 파일</p>
                <p className="font-medium text-gray-800 mt-0.5 truncate">{mySubmission.fileName}</p>
              </div>
            )}
          </div>
          {mySubmission.feedback && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs font-medium text-yellow-700 mb-1">교수 피드백</p>
              <p className="text-sm text-yellow-800">{mySubmission.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* 교수 제출 현황 */}
      {isProfessor && submissions && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">제출 현황</h2>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="text-green-600 font-medium">제출 {submissions.submittedCount}</span>
              <span className="text-orange-500">지각 {submissions.lateCount}</span>
              <span className="text-red-500">미제출 {submissions.notSubmittedCount}</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">학생</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">상태</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">제출 시각</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">점수</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">채점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.submissions.map((s: SubmissionListItem) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{s.studentName}</p>
                    <p className="text-xs text-gray-400">{s.studentNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'SUBMITTED' ? 'text-green-700 bg-green-50'
                      : s.status === 'LATE' ? 'text-orange-700 bg-orange-50'
                      : 'text-blue-700 bg-blue-50'
                    }`}>
                      {s.status === 'SUBMITTED' ? '제출' : s.status === 'LATE' ? '지각' : '채점완료'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.submittedAt.slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-4 py-3 text-gray-700">{s.score !== null ? `${s.score}점` : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { setGradeModal({ submissionId: s.id, studentName: s.studentName }); setScore(s.score?.toString() ?? ''); }}
                      className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <PenLine size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.notSubmitted.map((s) => (
                <tr key={s.studentId} className="bg-red-50/30">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-700">{s.studentName}</p>
                    <p className="text-xs text-gray-400">{s.studentNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500 font-medium" colSpan={4}>미제출</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 채점 모달 */}
      {gradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-semibold text-gray-800">채점 — {gradeModal.studentName}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">점수 (만점 {assignment.maxScore})</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min={0}
                max={assignment.maxScore}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">피드백 (선택)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setGradeModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">취소</button>
              <button
                onClick={() => gradeMutation.mutate({ submissionId: gradeModal.submissionId })}
                disabled={!score || gradeMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg"
              >
                {gradeMutation.isPending ? '저장 중...' : '채점 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
