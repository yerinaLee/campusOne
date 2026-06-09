import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/api/staff';
import { ArrowLeft, Loader2, Briefcase } from 'lucide-react';
import type { StaffStatus, EmploymentType } from '@/types';

const STATUS_CONFIG: Record<StaffStatus, { label: string; className: string }> = {
  ACTIVE:   { label: '재직',     className: 'bg-green-100 text-green-700' },
  LEAVE:    { label: '휴직',     className: 'bg-yellow-100 text-yellow-700' },
  RETIRED:  { label: '퇴직',     className: 'bg-gray-100 text-gray-600' },
  RESIGNED: { label: '의원면직', className: 'bg-red-100 text-red-600' },
};

const EMP_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  PART_TIME: '계약직',
  INTERN:    '인턴',
};

const JOB_CAT_LABELS: Record<string, string> = {
  ACADEMIC: '학사', HR: '인사', FINANCE: '재무', IT: '전산',
  LIBRARY: '도서관', STUDENT_SUPPORT: '학생지원', RESEARCH_ADMIN: '연구행정',
  FACILITY: '시설', ETC: '기타',
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffApi.get(Number(id)),
    enabled: !!id,
  });

  const { data: assignments } = useQuery({
    queryKey: ['staff', id, 'assignments'],
    queryFn: () => staffApi.getAssignments(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-500">
        <Loader2 size={20} className="animate-spin" /><span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  if (isError || !data) {
    return <div className="p-6 max-w-3xl mx-auto"><p className="text-red-500 text-sm">교직원 정보를 불러오는 데 실패했습니다.</p></div>;
  }

  const sc = STATUS_CONFIG[data.status];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/staff')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        교직원 목록
      </button>

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{data.staffNumber} · {EMP_TYPE_LABELS[data.employmentType]}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sc.className}`}>
            {sc.label}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5">
          <Field label="소속 부서"   value={data.officeName} />
          <Field label="이메일"      value={data.email} />
          <Field label="전화번호"    value={data.phone} />
          <Field label="임용일"      value={data.hireDate} />
          <Field label="부서 전화"   value={data.officePhone} />
          <Field label="부서 위치"   value={data.officeLocation} />
          <Field label="생년월일"    value={data.birthDate} />
        </dl>
      </div>

      {/* Jobs */}
      {data.jobs && data.jobs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Briefcase size={16} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900 text-sm">담당 직무</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.jobs.map((job) => (
              <div key={job.id} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.jobTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.officeName} · {job.positionName} · {JOB_CAT_LABELS[job.jobCategory] ?? job.jobCategory}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.startDate} ~ {job.endDate ?? '현재'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {job.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">주 직무</span>
                    )}
                    {!job.endDate && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">진행 중</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment history */}
      {assignments && assignments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <h2 className="font-semibold text-gray-900 text-sm px-5 py-4 border-b border-gray-100">발령 이력</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">발령 유형</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">이전 부서</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">발령 부서</th>
                  <th className="px-4 py-2.5 text-center font-medium text-gray-600">발령일</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">사유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-700">{a.assignmentType}</td>
                    <td className="px-4 py-2.5 text-gray-500">{a.fromOfficeName ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{a.toOfficeName}</td>
                    <td className="px-4 py-2.5 text-center text-gray-500">{a.effectiveDate}</td>
                    <td className="px-4 py-2.5 text-gray-500">{a.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
