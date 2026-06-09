import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { professorsApi } from '@/api/professors';
import { departmentsApi } from '@/api/departments';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  name:          z.string().min(2, '이름을 입력해주세요'),
  email:         z.string().email('올바른 이메일을 입력해주세요'),
  phone:         z.string().optional(),
  password:      z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  departmentId:  z.coerce.number().positive('학과를 선택해주세요'),
  position:      z.string().optional(),
  researchField: z.string().optional(),
  officeLocation:z.string().optional(),
  officePhone:   z.string().optional(),
  hireDate:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ProfessorCreate() {
  const navigate = useNavigate();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.departments(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: professorsApi.create,
    onSuccess: () => navigate('/professors'),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/professors')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        교수 목록
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-5">교수 등록</h1>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="이름 *" error={errors.name?.message}>
              <input {...register('name')} className={inputCls} placeholder="김교수" />
            </Field>
            <Field label="이메일 *" error={errors.email?.message}>
              <input {...register('email')} className={inputCls} placeholder="prof@university.ac.kr" />
            </Field>
            <Field label="전화번호" error={errors.phone?.message}>
              <input {...register('phone')} className={inputCls} placeholder="010-2222-3333" />
            </Field>
            <Field label="임시 비밀번호 *" error={errors.password?.message}>
              <input {...register('password')} type="password" className={inputCls} />
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="직위" error={errors.position?.message}>
              <select {...register('position')} className={inputCls}>
                <option value="">선택</option>
                <option value="교수">교수</option>
                <option value="부교수">부교수</option>
                <option value="조교수">조교수</option>
                <option value="강사">강사</option>
              </select>
            </Field>
            <Field label="임용일" error={errors.hireDate?.message}>
              <input {...register('hireDate')} type="date" className={inputCls} />
            </Field>
            <Field label="연구분야" error={errors.researchField?.message}>
              <input {...register('researchField')} className={inputCls} placeholder="인공지능, 머신러닝..." />
            </Field>
            <Field label="연구실 전화" error={errors.officePhone?.message}>
              <input {...register('officePhone')} className={inputCls} placeholder="02-1234-5678" />
            </Field>
            <Field label="연구실 위치" error={errors.officeLocation?.message}>
              <input {...register('officeLocation')} className={inputCls} placeholder="공학관 301호" />
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
              onClick={() => navigate('/professors')}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '등록 중...' : '교수 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
