import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '@/api/staff';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  name:             z.string().min(2, '이름을 입력해주세요'),
  email:            z.string().email('올바른 이메일을 입력해주세요'),
  phone:            z.string().optional(),
  password:         z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  officeId:         z.coerce.number().positive('소속 부서를 선택해주세요'),
  employmentType:   z.enum(['FULL_TIME', 'PART_TIME', 'INTERN']),
  hireDate:         z.string().min(1, '임용일을 입력해주세요'),
  birthDate:        z.string().optional(),
  address:          z.string().optional(),
  emergencyContact: z.string().optional(),
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

export default function StaffCreate() {
  const navigate = useNavigate();

  const { data: offices } = useQuery({
    queryKey: ['offices'],
    queryFn: staffApi.offices,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { employmentType: 'FULL_TIME' },
  });

  const mutation = useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => navigate('/staff'),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/staff')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        교직원 목록
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-5">교직원 등록</h1>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="이름 *" error={errors.name?.message}>
              <input {...register('name')} className={inputCls} placeholder="이직원" />
            </Field>
            <Field label="이메일 *" error={errors.email?.message}>
              <input {...register('email')} className={inputCls} placeholder="staff@university.ac.kr" />
            </Field>
            <Field label="전화번호" error={errors.phone?.message}>
              <input {...register('phone')} className={inputCls} placeholder="010-3333-4444" />
            </Field>
            <Field label="임시 비밀번호 *" error={errors.password?.message}>
              <input {...register('password')} type="password" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="소속 부서 *" error={errors.officeId?.message}>
              <select {...register('officeId')} className={inputCls}>
                <option value="">부서를 선택하세요</option>
                {offices?.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </Field>
            <Field label="고용 유형 *" error={errors.employmentType?.message}>
              <select {...register('employmentType')} className={inputCls}>
                <option value="FULL_TIME">정규직</option>
                <option value="PART_TIME">계약직</option>
                <option value="INTERN">인턴</option>
              </select>
            </Field>
            <Field label="임용일 *" error={errors.hireDate?.message}>
              <input {...register('hireDate')} type="date" className={inputCls} />
            </Field>
            <Field label="생년월일" error={errors.birthDate?.message}>
              <input {...register('birthDate')} type="date" className={inputCls} />
            </Field>
          </div>

          <Field label="주소" error={errors.address?.message}>
            <input {...register('address')} className={inputCls} placeholder="서울시 마포구..." />
          </Field>
          <Field label="비상 연락처" error={errors.emergencyContact?.message}>
            <input {...register('emergencyContact')} className={inputCls} placeholder="010-9999-0000" />
          </Field>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록에 실패했습니다.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '등록 중...' : '교직원 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
