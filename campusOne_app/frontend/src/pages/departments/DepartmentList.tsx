import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '@/api/departments';
import { useAuthStore } from '@/store/authStore';
import { Building2, Loader2, Users, GraduationCap } from 'lucide-react';

export default function DepartmentList() {
  const { user } = useAuthStore();
  const [collegeFilter, setCollegeFilter] = useState<number | ''>('');

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: departmentsApi.colleges,
  });

  const { data: departments, isLoading, isError } = useQuery({
    queryKey: ['departments', collegeFilter],
    queryFn: () => departmentsApi.departments(collegeFilter ? { collegeId: collegeFilter } : {}),
  });

  const canCreate = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-blue-600" size={24} />
            학과 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">단과대학 및 학과 현황을 조회합니다.</p>
        </div>
      </div>

      {/* College filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">단과대학 필터</label>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="">전체 단과대학</option>
              {colleges?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Department cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">학과 목록을 불러오는 중...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500 text-sm">데이터를 불러오는 데 실패했습니다.</div>
      ) : !departments?.length ? (
        <div className="text-center py-16 text-gray-400 text-sm">조회된 학과가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{dept.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{dept.collegeName}</p>
                </div>
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                  {dept.code}
                </span>
              </div>

              {dept.headProfessorName && (
                <p className="text-xs text-gray-500 mb-3">
                  학과장: <span className="font-medium text-gray-700">{dept.headProfessorName}</span>
                </p>
              )}

              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={13} className="text-blue-500" />
                  <span>학생 {dept.studentCount}명</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <GraduationCap size={13} className="text-purple-500" />
                  <span>교수 {dept.professorCount}명</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Colleges summary */}
      {colleges && colleges.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">단과대학 목록</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">코드</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">단과대학명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.code}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{c.name}</td>
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
