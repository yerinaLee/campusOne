import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, BookOpenCheck } from 'lucide-react';
import { examsApi } from '@/api/exams';
import type { MyExamScheduleItem, ExamType, ExamRegistrationStatus } from '@/types';

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

const MY_STATUS_LABEL: Record<ExamRegistrationStatus, string> = {
  REGISTERED: '등록',
  ATTENDED: '응시 완료',
  ABSENT: '결시',
  EXEMPT: '면제',
};

const MY_STATUS_COLOR: Record<ExamRegistrationStatus, string> = {
  REGISTERED: 'text-blue-700 bg-blue-50',
  ATTENDED: 'text-green-700 bg-green-50',
  ABSENT: 'text-red-700 bg-red-50',
  EXEMPT: 'text-gray-600 bg-gray-100',
};

function groupByDate(exams: MyExamScheduleItem[]) {
  const map = new Map<string, MyExamScheduleItem[]>();
  for (const e of exams) {
    if (!map.has(e.examDate)) map.set(e.examDate, []);
    map.get(e.examDate)!.push(e);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function MyExamSchedule() {
  const navigate = useNavigate();

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams', 'my-schedule'],
    queryFn: () => examsApi.mySchedule(),
  });

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
    );
  }

  const grouped = groupByDate(exams ?? []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 시험 일정</h1>
        <p className="text-gray-500 text-sm mt-1">수강 강의의 시험 일정이 자동 집계됩니다.</p>
      </div>

      {!exams?.length ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpenCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">등록된 시험 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, items]) => {
            const isToday = date === new Date().toISOString().slice(0, 10);
            const isPast = date < new Date().toISOString().slice(0, 10);
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarClock size={16} className={isPast ? 'text-gray-400' : 'text-blue-600'} />
                  <span className={`text-sm font-semibold ${isPast ? 'text-gray-400' : isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                    {date} {isToday && <span className="ml-1 text-xs text-blue-500">(오늘)</span>}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((e: MyExamScheduleItem) => (
                    <div
                      key={e.examId}
                      onClick={() => navigate(`/exams/${e.examId}`)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all ${isPast ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-blue-200'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[e.examType as ExamType]}`}>
                              {TYPE_LABEL[e.examType as ExamType] ?? e.examType}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MY_STATUS_COLOR[e.myStatus as ExamRegistrationStatus]}`}>
                              {MY_STATUS_LABEL[e.myStatus as ExamRegistrationStatus] ?? e.myStatus}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800">{e.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{e.courseName}</p>
                        </div>
                        <div className="text-right text-sm flex-shrink-0">
                          <p className="font-medium text-gray-700">{e.startTime.slice(11, 16)} ~ {e.endTime.slice(11, 16)}</p>
                          {e.room && <p className="text-xs text-gray-400 mt-0.5">{e.room}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
