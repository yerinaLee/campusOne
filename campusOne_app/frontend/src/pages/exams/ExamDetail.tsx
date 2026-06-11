import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, Trash2, ChevronDown } from 'lucide-react';
import { examsApi } from '@/api/exams';
import { useAuthStore } from '@/store/authStore';
import type { ExamType, ExamStatus, SupervisorRole, ExamRegistrationStatus } from '@/types';

const TYPE_LABEL: Record<ExamType, string> = {
  MIDTERM: '중간고사', FINAL: '기말고사', QUIZ: '쪽지시험', MAKEUP: '재시험', EXTRA: '추가시험',
};

const REG_STATUS_LABEL: Record<ExamRegistrationStatus, string> = {
  REGISTERED: '등록', ATTENDED: '응시', ABSENT: '결시', EXEMPT: '면제',
};

const REG_COLOR: Record<ExamRegistrationStatus, string> = {
  REGISTERED: 'text-blue-700 bg-blue-50',
  ATTENDED: 'text-green-700 bg-green-50',
  ABSENT: 'text-red-700 bg-red-50',
  EXEMPT: 'text-gray-600 bg-gray-100',
};

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const examId = Number(id);

  const canManage = user?.role === 'PROFESSOR' || user?.role === 'STAFF' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  const [supervisorUserId, setSupervisorUserId] = useState('');
  const [supervisorRole, setSupervisorRole] = useState<SupervisorRole>('ASSISTANT');
  const [specialReason, setSpecialReason] = useState('');
  const [showSpecialForm, setShowSpecialForm] = useState(false);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['exams', examId],
    queryFn: () => examsApi.get(examId),
  });

  const { data: registrations } = useQuery({
    queryKey: ['exams', examId, 'registrations'],
    queryFn: () => examsApi.getRegistrations(examId),
    enabled: canManage,
  });

  const addSupervisorMutation = useMutation({
    mutationFn: () => examsApi.addSupervisor(examId, { supervisorId: Number(supervisorUserId), role: supervisorRole }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exams', examId] }); setSupervisorUserId(''); },
  });

  const removeSupervisorMutation = useMutation({
    mutationFn: (userId: number) => examsApi.removeSupervisor(examId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams', examId] }),
  });

  const registerSpecialMutation = useMutation({
    mutationFn: () => examsApi.registerSpecial(examId, specialReason),
    onSuccess: () => { setShowSpecialForm(false); setSpecialReason(''); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ studentId, status }: { studentId: number; status: string }) =>
      examsApi.updateRegistrationStatus(examId, studentId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams', examId, 'registrations'] }),
  });

  if (isLoading) {
    return <div className="p-6 animate-pulse space-y-4">{[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>;
  }
  if (!exam) return null;

  const isSpecialExam = exam.examType === 'MAKEUP' || exam.examType === 'EXTRA';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> 목록으로
      </button>

      {/* 시험 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-700 bg-blue-50">
                {TYPE_LABEL[exam.examType as ExamType] ?? exam.examType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                exam.status === 'SCHEDULED' ? 'text-blue-600 bg-blue-50'
                : exam.status === 'ONGOING' ? 'text-green-600 bg-green-50'
                : exam.status === 'COMPLETED' ? 'text-gray-500 bg-gray-100'
                : 'text-red-500 bg-red-50'
              }`}>
                {exam.status === 'SCHEDULED' ? '예정' : exam.status === 'ONGOING' ? '진행중' : exam.status === 'COMPLETED' ? '완료' : '취소'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{exam.courseName} · {exam.professorName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: '시험일', value: exam.examDate },
            { label: '시간', value: `${exam.startTime.slice(11, 16)} ~ ${exam.endTime.slice(11, 16)}` },
            { label: '장소', value: exam.room ?? '-' },
            { label: '정원', value: exam.maxStudents ? `${exam.maxStudents}명` : '-' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="font-medium text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {exam.description && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">{exam.description}</div>
        )}
      </div>

      {/* 감독관 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">감독관</h2>
          {canManage && (
            <div className="flex items-center gap-2">
              <input
                value={supervisorUserId}
                onChange={(e) => setSupervisorUserId(e.target.value)}
                placeholder="User ID"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              <div className="relative">
                <select
                  value={supervisorRole}
                  onChange={(e) => setSupervisorRole(e.target.value as SupervisorRole)}
                  className="pl-2.5 pr-6 py-1.5 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="MAIN">주감독</option>
                  <option value="ASSISTANT">보조감독</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={() => addSupervisorMutation.mutate()}
                disabled={!supervisorUserId || addSupervisorMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
              >
                <UserPlus size={13} /> 추가
              </button>
            </div>
          )}
        </div>
        {exam.supervisors?.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">배정된 감독관이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {exam.supervisors?.map((s) => (
              <li key={s.userId} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${s.role === 'MAIN' ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-100'}`}>
                    {s.role === 'MAIN' ? '주감독' : '보조감독'}
                  </span>
                </div>
                {canManage && (
                  <button
                    onClick={() => removeSupervisorMutation.mutate(s.userId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 학생 특별시험 신청 */}
      {isStudent && isSpecialExam && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-gray-800">특별 시험 신청</h2>
          {!showSpecialForm ? (
            <button
              onClick={() => setShowSpecialForm(true)}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              신청하기
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={specialReason}
                onChange={(e) => setSpecialReason(e.target.value)}
                rows={3}
                placeholder="신청 사유를 입력하세요."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowSpecialForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">취소</button>
                <button
                  onClick={() => registerSpecialMutation.mutate()}
                  disabled={!specialReason || registerSpecialMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg"
                >
                  {registerSpecialMutation.isPending ? '신청 중...' : '신청'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 응시자 현황 */}
      {canManage && registrations && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">응시자 현황 ({registrations.length}명)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">학생</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">구분</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">상태</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">변경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{r.studentName}</p>
                    <p className="text-xs text-gray-400">{r.studentNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.isSpecial ? <span className="text-orange-600 font-medium">특별</span> : '일반'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${REG_COLOR[r.status as ExamRegistrationStatus] ?? ''}`}>
                      {REG_STATUS_LABEL[r.status as ExamRegistrationStatus] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatusMutation.mutate({ studentId: r.studentId, status: e.target.value })}
                        className="pl-2.5 pr-6 py-1 rounded border border-gray-300 text-xs appearance-none outline-none"
                      >
                        <option value="REGISTERED">등록</option>
                        <option value="ATTENDED">응시</option>
                        <option value="ABSENT">결시</option>
                        <option value="EXEMPT">면제</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
