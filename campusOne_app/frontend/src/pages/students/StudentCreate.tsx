import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '@/api/students';
import { departmentsApi } from '@/api/departments';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  name:          z.string().min(2, '이름을 입력해주세요'),
  email:         z.string().email('올바른 이메일을 입력해주세요'),
  phone:         z.string().optional(),
  password:      z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  departmentId:  z.coerce.number().positive('학과를 선택해주세요'),
  grade:         z.coerce.number().min(1).max(4),
  semester:      z.coerce.number().min(1).max(2),
  admissionYear: z.coerce.number().min(2000).max(2100),
  birthDate:     z.string().optional(),
  address:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

export default function StudentCreate() {
  const navigate = useNavigate();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.departments(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      grade: 1,
      semester: 1,
      admissionYear: new Date().getFullYear(),
    },
  });

  const mutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => navigate('/students'),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        학생 목록
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-5">학생 등록</h1>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="이름 *" error={errors.name?.message}>
              <input {...register('name')} className={inputCls} placeholder="홍길동" />
            </Field>
            <Field label="이메일 *" error={errors.email?.message}>
              <input {...register('email')} className={inputCls} placeholder="hong@university.ac.kr" />
            </Field>
            <Field label="전화번호" error={errors.phone?.message}>
              <input {...register('phone')} className={inputCls} placeholder="010-1234-5678" />
            </Field>
            <Field label="임시 비밀번호 *" error={errors.password?.message}>
              <input {...register('password')} type="password" className={inputCls} placeholder="6자 이상" />
            </Field>
          </div>

          <Field label="학과 *" error={errors.departmentId?.message}>
            <select {...register('departmentId')} className={inputCls}>
              <option value="">학과를 선택하세요</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.collegeName})</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="입학연도 *" error={errors.admissionYear?.message}>
              <input {...register('admissionYear')} type="number" className={inputCls} />
            </Field>
            <Field label="학년 *" error={errors.grade?.message}>
              <select {...register('grade')} className={inputCls}>
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
                <option value={4}>4학년</option>
              </select>
            </Field>
            <Field label="학기 *" error={errors.semester?.message}>
              <select {...register('semester')} className={inputCls}>
                <option value={1}>1학기</option>
                <option value={2}>2학기</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="생년월일" error={errors.birthDate?.message}>
              <input {...register('birthDate')} type="date" className={inputCls} />
            </Field>
            <Field label="주소" error={errors.address?.message}>
              <input {...register('address')} className={inputCls} placeholder="서울시 강남구..." />
            </Field>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록에 실패했습니다.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '등록 중...' : '학생 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
