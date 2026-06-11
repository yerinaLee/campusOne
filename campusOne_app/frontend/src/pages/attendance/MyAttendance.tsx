import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, MinusCircle } from 'lucide-react';
import { attendanceApi } from '@/api/attendance';
import type { MyAttendanceRecord } from '@/types';

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

const STATUS_ICON: Record<string, React.ReactNode> = {
  PRESENT: <CheckCircle2 size={14} />,
  LATE: <Clock size={14} />,
  ABSENT: <MinusCircle size={14} />,
};

function AttendanceBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[status] ?? 'text-gray-600 bg-gray-100'}`}
    >
      {STATUS_ICON[status]}
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span
        className={`text-sm font-semibold tabular-nums ${
          rate >= 80 ? 'text-green-700' : rate >= 60 ? 'text-yellow-700' : 'text-red-700'
        }`}
      >
        {rate.toFixed(1)}%
      </span>
    </div>
  );
}

export default function MyAttendance() {
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: () => attendanceApi.myAttendance(),
  });

  const totalSessions = courses.reduce((s, c) => s + c.totalSessions, 0);
  const totalPresent = courses.reduce((s, c) => s + c.presentCount, 0);
  const totalLate = courses.reduce((s, c) => s + c.lateCount, 0);
  const totalAbsent = courses.reduce((s, c) => s + c.absentCount, 0);
  const overallRate = totalSessions > 0 ? ((totalPresent + totalLate) / totalSessions) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 출결 현황</h1>
        <p className="text-gray-500 text-sm mt-1">강의별 출석률과 세부 출결 기록을 확인합니다.</p>
      </div>

      {/* 전체 요약 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">전체 요약</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: '전체 세션', value: totalSessions, color: 'text-gray-800' },
            { label: '출석', value: totalPresent, color: 'text-green-700' },
            { label: '지각', value: totalLate, color: 'text-yellow-700' },
            { label: '결석', value: totalAbsent, color: 'text-red-700' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>전체 출석률</span>
          </div>
          <RateBar rate={overallRate} />
        </div>
      </div>

      {/* 강의별 목록 */}
      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">출결 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const isOpen = expandedCourseId === course.courseId;
            return (
              <div key={course.courseId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Course header row */}
                <button
                  onClick={() => setExpandedCourseId(isOpen ? null : course.courseId)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{course.courseName}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-green-500" /> 출석 {course.presentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-yellow-500" /> 지각 {course.lateCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MinusCircle size={12} className="text-red-400" /> 결석 {course.absentCount}
                        </span>
                        <span className="text-gray-400">/ 총 {course.totalSessions}회</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-28">
                        <RateBar rate={course.attendanceRate} />
                      </div>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded records */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {course.records.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-gray-400">세부 기록이 없습니다.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">날짜</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">상태</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">체크인 시각</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {course.records.map((r: MyAttendanceRecord) => (
                            <tr key={r.sessionId} className="hover:bg-gray-50">
                              <td className="px-5 py-2.5 text-gray-600">{r.lectureDate}</td>
                              <td className="px-5 py-2.5">
                                <AttendanceBadge status={r.status} />
                              </td>
                              <td className="px-5 py-2.5 text-gray-500">
                                {r.checkedInAt ? r.checkedInAt.slice(11, 19) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
