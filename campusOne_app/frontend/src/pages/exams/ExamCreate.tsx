import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { examsApi } from '@/api/exams';
import { coursesApi } from '@/api/courses';

const schema = z.object({
  courseId: z.number({ required_error: '강의를 선택하세요.' }).int(),
  examType: z.enum(['MIDTERM', 'FINAL', 'QUIZ', 'MAKEUP', 'EXTRA']),
  title: z.string().min(1, '시험명을 입력하세요.'),
  examDate: z.string().min(1, '시험 날짜를 선택하세요.'),
  startTime: z.string().min(1, '시작 시각을 입력하세요.'),
  endTime: z.string().min(1, '종료 시각을 입력하세요.'),
  room: z.string().optional(),
  maxStudents: z.number().int().min(1).optional(),
  description: z.string().optional(),
});

type ExamForm = z.infer<typeof schema>;

const EXAM_TYPES = [
  { value: 'MIDTERM', label: '중간고사' },
  { value: 'FINAL', label: '기말고사' },
  { value: 'QUIZ', label: '쪽지시험' },
  { value: 'MAKEUP', label: '재시험' },
  { value: 'EXTRA', label: '추가시험' },
];

export default function ExamCreate() {
  const navigate = useNavigate();

  const { data: courses } = useQuery({
    queryKey: ['courses', 'list'],
    queryFn: () => coursesApi.list({ size: 100 }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ExamForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      examType: 'MIDTERM',
    },
  });

  const examDate = watch('examDate');

  const createMutation = useMutation({
    mutationFn: (data: ExamForm) =>
      examsApi.create({
        ...data,
        startTime: `${data.examDate}T${data.startTime}:00+09:00`,
        endTime: `${data.examDate}T${data.endTime}:00+09:00`,
      }),
    onSuccess: () => navigate('/exams'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) setError('root', { message: msg });
    },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> 뒤로
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">시험 등록</h1>
        <p className="text-gray-500 text-sm mt-1">새 시험 일정을 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* 강의 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">강의 *</label>
          <div className="relative">
            <select
              {...register('courseId', { valueAsNumber: true })}
              className={`w-full pl-3.5 pr-8 py-2.5 rounded-lg border text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.courseId ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">강의를 선택하세요</option>
              {courses?.content?.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.year}-{c.semester})</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId.message}</p>}
        </div>

        {/* 시험 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">시험 유형 *</label>
          <div className="relative">
            <select
              {...register('examType')}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              {EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 시험명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">시험명 *</label>
          <input
            {...register('title')}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="예: 2025-1학기 자료구조 중간고사"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* 날짜 + 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">시험 날짜 *</label>
          <input
            type="date"
            {...register('examDate')}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.examDate ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.examDate && <p className="text-xs text-red-500 mt-1">{errors.examDate.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">시작 시각 *</label>
            <input
              type="time"
              {...register('startTime')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.startTime ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">종료 시각 *</label>
            <input
              type="time"
              {...register('endTime')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.endTime ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">강의실</label>
            <input
              {...register('room')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="예: 공학관 401호"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">최대 응시인원</label>
            <input
              type="number"
              {...register('maxStudents', { valueAsNumber: true })}
              min={1}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">시험 안내</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            placeholder="시험 범위, 유의사항 등을 입력하세요."
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">취소</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? '등록 중...' : '시험 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
