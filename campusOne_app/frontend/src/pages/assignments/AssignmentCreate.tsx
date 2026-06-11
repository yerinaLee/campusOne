import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { assignmentsApi } from '@/api/assignments';
import { coursesApi } from '@/api/courses';

const schema = z.object({
  courseId: z.number({ required_error: '강의를 선택하세요.' }).int(),
  title: z.string().min(1, '제목을 입력하세요.'),
  description: z.string().optional(),
  dueDate: z.string().min(1, '마감일을 설정하세요.'),
  maxScore: z.number().min(1).max(9999),
  submissionType: z.enum(['FILE', 'TEXT', 'BOTH']),
  allowLateSubmit: z.boolean(),
  isVisible: z.boolean(),
});

type AssignmentForm = z.infer<typeof schema>;

export default function AssignmentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId');

  const { data: courses } = useQuery({
    queryKey: ['courses', 'list'],
    queryFn: () => coursesApi.list({ size: 100 }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AssignmentForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseId: preselectedCourseId ? Number(preselectedCourseId) : undefined,
      maxScore: 100,
      submissionType: 'FILE',
      allowLateSubmit: false,
      isVisible: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AssignmentForm) =>
      assignmentsApi.create({
        ...data,
        dueDate: data.dueDate + ':00+09:00',
      }),
    onSuccess: () => navigate('/assignments'),
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
        <h1 className="text-2xl font-bold text-gray-900">과제 개설</h1>
        <p className="text-gray-500 text-sm mt-1">새 과제를 등록합니다.</p>
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
              {courses?.content?.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.year}-{c.semester})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId.message}</p>}
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">과제 제목 *</label>
          <input
            {...register('title')}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="과제 제목을 입력하세요."
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">설명</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            placeholder="과제 내용 및 요구사항을 입력하세요."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 마감일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">마감일시 *</label>
            <input
              type="datetime-local"
              {...register('dueDate')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${errors.dueDate ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
          </div>

          {/* 만점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">만점 *</label>
            <input
              type="number"
              {...register('maxScore', { valueAsNumber: true })}
              min={1}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 제출 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">제출 유형</label>
          <div className="relative">
            <select
              {...register('submissionType')}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-lg border border-gray-300 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="FILE">파일 업로드</option>
              <option value="TEXT">텍스트 입력</option>
              <option value="BOTH">파일 또는 텍스트</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 옵션 */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('allowLateSubmit')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">지각 제출 허용</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isVisible')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">학생에게 공개</span>
          </label>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">취소</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? '등록 중...' : '과제 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
