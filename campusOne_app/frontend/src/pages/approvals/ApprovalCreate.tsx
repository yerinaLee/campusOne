import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { approvalsApi } from '@/api/approvals';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const schema = z.object({
  templateId: z.coerce.number().positive('결재 양식을 선택해주세요'),
  title:      z.string().min(2, '제목을 입력해주세요'),
  content:    z.string().min(5, '내용을 입력해주세요'),
});

type FormData = z.infer<typeof schema>;

interface ApprovalLineInput {
  step: number;
  approverId: string;
  roleLabel: string;
}

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

export default function ApprovalCreate() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<ApprovalLineInput[]>([
    { step: 1, approverId: '', roleLabel: '' },
  ]);

  const { data: templates } = useQuery({
    queryKey: ['approval-templates'],
    queryFn: approvalsApi.templates,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      approvalsApi.create({
        ...data,
        approvalLines: lines
          .filter((l) => l.approverId)
          .map((l) => ({
            step: l.step,
            approverId: Number(l.approverId),
            roleLabel: l.roleLabel || undefined,
          })),
      }),
    onSuccess: () => navigate('/approvals'),
  });

  const addLine = () => {
    setLines((prev) => [...prev, { step: prev.length + 1, approverId: '', roleLabel: '' }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) =>
      prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, step: i + 1 }))
    );
  };

  const updateLine = (index: number, field: keyof ApprovalLineInput, value: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/approvals')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        전자결재 목록
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-5">결재 문서 기안</h1>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
        >
          <Field label="결재 양식 *" error={errors.templateId?.message}>
            <select {...register('templateId')} className={inputCls}>
              <option value="">양식을 선택하세요</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>

          <Field label="제목 *" error={errors.title?.message}>
            <input {...register('title')} className={inputCls} placeholder="결재 문서 제목" />
          </Field>

          <Field label="내용 *" error={errors.content?.message}>
            <textarea
              {...register('content')}
              rows={6}
              className={`${inputCls} resize-none`}
              placeholder="결재 요청 내용을 상세하게 작성해 주세요..."
            />
          </Field>

          {/* Approval lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">결재선 설정 *</label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus size={13} />
                결재자 추가
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 w-5 text-center flex-shrink-0">{line.step}</span>
                  <input
                    type="number"
                    value={line.approverId}
                    onChange={(e) => updateLine(index, 'approverId', e.target.value)}
                    placeholder="결재자 ID"
                    className="w-28 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={line.roleLabel}
                    onChange={(e) => updateLine(index, 'roleLabel', e.target.value)}
                    placeholder="역할 (예: 지도교수)"
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">결재자 ID는 사용자 고유 번호입니다. 관리자에게 문의하세요.</p>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '기안에 실패했습니다.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/approvals')}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '기안 중...' : '결재 기안'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
