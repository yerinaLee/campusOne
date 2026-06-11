import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { RefreshCw, X, Users, Clock, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { attendanceApi } from '@/api/attendance';
import { coursesApi } from '@/api/courses';
import { professorsApi } from '@/api/professors';
import type { AttendanceSession, AttendanceRecord } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  PRESENT: '출석',
  LATE: '지각',
  ABSENT: '결석',
};

const STATUS_COLOR: Record<string, string> = {
  PRESENT: 'text-green-700 bg-green-50',
  LATE: 'text-yellow-700 bg-yellow-50',
  ABSENT: 'text-red-700 bg-red-50',
};

function toLocalISOString(dt: string): string {
  // datetime-local value (YYYY-MM-DDTHH:mm) → ISO with +09:00
  return `${dt}:00+09:00`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AttendanceManage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [adjustModal, setAdjustModal] = useState<{ record: AttendanceRecord } | null>(null);
  const [adjustStatus, setAdjustStatus] = useState('PRESENT');
  const [adjustReason, setAdjustReason] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form state
  const [form, setForm] = useState({
    lectureDate: today(),
    startTime: `${today()}T${nowTime()}`,
    endTime: `${today()}T${String(parseInt(nowTime().slice(0, 2)) + 1).padStart(2, '0')}${nowTime().slice(2)}`,
    lateThreshold: '',
  });

  // Professor's ID
  const { data: myProfile } = useQuery({
    queryKey: ['professors', 'me'],
    queryFn: () => professorsApi.me(),
  });

  // Professor's courses
  const { data: coursePage } = useQuery({
    queryKey: ['courses', 'professor', myProfile?.id],
    queryFn: () =>
      coursesApi.list({ size: 100 }),
    enabled: !!myProfile,
  });

  const courses = coursePage?.content ?? [];

  // Poll session records
  const pollRecords = useCallback(async (sessionId: number) => {
    try {
      const data = await attendanceApi.getRecords(sessionId);
      setRecords(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (activeSession && activeSession.status === 'ACTIVE') {
      pollRecords(activeSession.id);
      pollRef.current = setInterval(() => pollRecords(activeSession.id), 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeSession, pollRecords]);

  const createMutation = useMutation({
    mutationFn: attendanceApi.createSession,
    onSuccess: (session) => {
      setActiveSession(session);
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: number) => attendanceApi.closeSession(id),
    onSuccess: () => {
      if (activeSession) setActiveSession({ ...activeSession, status: 'CLOSED' });
      if (pollRef.current) clearInterval(pollRef.current);
    },
  });

  const regenMutation = useMutation({
    mutationFn: (id: number) => attendanceApi.regenerateCode(id),
    onSuccess: (data) => {
      if (activeSession) setActiveSession({ ...activeSession, accessCode: data.accessCode });
    },
  });

  const adjustMutation = useMutation({
    mutationFn: ({ recordId, status, reason }: { recordId: number; status: string; reason: string }) =>
      attendanceApi.updateRecord(recordId, { status, reason }),
    onSuccess: () => {
      setAdjustModal(null);
      setAdjustReason('');
      if (activeSession) pollRecords(activeSession.id);
    },
  });

  const handleCreate = () => {
    if (!selectedCourseId) return;
    createMutation.mutate({
      courseId: selectedCourseId,
      lectureDate: form.lectureDate,
      startTime: toLocalISOString(form.startTime),
      endTime: toLocalISOString(form.endTime),
      lateThreshold: form.lateThreshold ? toLocalISOString(form.lateThreshold) : undefined,
    });
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">출결 관리</h1>
        <p className="text-gray-500 text-sm mt-1">강의 출결 세션을 생성하고 학생 출석을 관리합니다.</p>
      </div>

      {/* Course selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">강의 선택</label>
        <div className="flex gap-3">
          <select
            value={selectedCourseId ?? ''}
            onChange={(e) => {
              setSelectedCourseId(Number(e.target.value) || null);
              setActiveSession(null);
              setRecords([]);
              setShowCreateForm(false);
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          >
            <option value="">강의를 선택하세요</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.courseCode}] {c.name} ({c.year}-{c.semester}학기)
              </option>
            ))}
          </select>
          {selectedCourseId && !activeSession && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              세션 생성
            </button>
          )}
        </div>
      </div>

      {/* Create session form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">출결 세션 설정</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">강의 날짜</label>
              <input
                type="date"
                value={form.lectureDate}
                onChange={(e) => setForm((f) => ({ ...f, lectureDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 시각</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 시각</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지각 기준 시각 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="datetime-local"
                value={form.lateThreshold}
                onChange={(e) => setForm((f) => ({ ...f, lateThreshold: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {createMutation.isPending ? '생성 중...' : '세션 시작'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
          {createMutation.isError && (
            <p className="text-sm text-red-600">세션 생성에 실패했습니다.</p>
          )}
        </div>
      )}

      {/* Active session panel */}
      {activeSession && (
        <div className="space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                activeSession.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeSession.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              {activeSession.status === 'ACTIVE' ? '진행 중' : '종료됨'}
            </span>
            <span className="text-sm text-gray-500">
              {activeSession.lectureDate} &nbsp;|&nbsp; {activeSession.startTime.slice(11, 16)} ~{' '}
              {activeSession.endTime.slice(11, 16)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* QR + Code */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4">
              <h2 className="text-base font-semibold text-gray-800 self-start">QR 코드 / 출석 코드</h2>
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <QRCode value={activeSession.qrUrl} size={180} />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">학생이 QR 스캔 후 아래 코드를 입력합니다</p>
                <div className="text-5xl font-mono font-bold tracking-[0.2em] text-blue-600 bg-blue-50 px-6 py-3 rounded-xl">
                  {activeSession.accessCode}
                </div>
              </div>
              {activeSession.status === 'ACTIVE' && (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => regenMutation.mutate(activeSession.id)}
                    disabled={regenMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <RefreshCw size={14} className={regenMutation.isPending ? 'animate-spin' : ''} />
                    코드 재생성
                  </button>
                  <button
                    onClick={() => closeMutation.mutate(activeSession.id)}
                    disabled={closeMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <X size={14} />
                    세션 종료
                  </button>
                </div>
              )}
            </div>

            {/* Summary cards */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-800">실시간 출결 현황</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '출석', count: presentCount, color: 'text-green-700 bg-green-50', icon: <CheckCircle2 size={18} /> },
                  { label: '지각', count: lateCount, color: 'text-yellow-700 bg-yellow-50', icon: <Clock size={18} /> },
                  { label: '결석', count: absentCount, color: 'text-red-700 bg-red-50', icon: <MinusCircle size={18} /> },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-4 ${s.color} flex flex-col items-center gap-1`}>
                    {s.icon}
                    <span className="text-2xl font-bold">{s.count}</span>
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-gray-500">
                <Users size={14} />
                총 {records.length}명 &nbsp;·&nbsp; 5초마다 자동 갱신
              </div>
            </div>
          </div>

          {/* Records table */}
          {records.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">학생별 출결 목록</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">학번</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">이름</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">상태</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">체크인 시각</th>
                      {activeSession.status === 'ACTIVE' && (
                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500" />
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-gray-600">{r.studentNumber}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{r.studentName}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_COLOR[r.status]
                            }`}
                          >
                            {STATUS_LABEL[r.status]}
                            {r.isManual && ' (수동)'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {r.checkedInAt ? r.checkedInAt.slice(11, 19) : '-'}
                        </td>
                        {activeSession.status === 'ACTIVE' && (
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => {
                                setAdjustModal({ record: r });
                                setAdjustStatus(r.status);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              수동 조정
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual adjust modal */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">출결 수동 조정</h3>
            <p className="text-sm text-gray-500">
              <strong>{adjustModal.record.studentName}</strong> ({adjustModal.record.studentNumber})
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">출결 상태</label>
              <select
                value={adjustStatus}
                onChange={(e) => setAdjustStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="PRESENT">출석</option>
                <option value="LATE">지각</option>
                <option value="ABSENT">결석</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">사유 (필수)</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="수동 조정 사유를 입력하세요"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  adjustMutation.mutate({
                    recordId: adjustModal.record.id,
                    status: adjustStatus,
                    reason: adjustReason,
                  })
                }
                disabled={!adjustReason.trim() || adjustMutation.isPending}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                확인
              </button>
              <button
                onClick={() => { setAdjustModal(null); setAdjustReason(''); }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedCourseId && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">위에서 강의를 선택하면 출결 세션을 시작할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
