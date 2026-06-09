import { useQuery } from '@tanstack/react-query';
import { gradesApi } from '@/api/grades';
import type { GradeItem } from '@/types';
import { GraduationCap, TrendingUp, BookOpen, Award } from 'lucide-react';

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A':  'bg-emerald-100 text-emerald-600',
  'B+': 'bg-blue-100 text-blue-700',
  'B':  'bg-blue-100 text-blue-600',
  'C+': 'bg-yellow-100 text-yellow-700',
  'C':  'bg-yellow-100 text-yellow-600',
  'D+': 'bg-orange-100 text-orange-700',
  'D':  'bg-orange-100 text-orange-600',
  'F':  'bg-red-100 text-red-700',
  'P':  'bg-teal-100 text-teal-700',
  'NP': 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  TEMP: '임시',
  SUBMITTED: '제출됨',
  CONFIRMED: '확정',
};

const STATUS_COLORS: Record<string, string> = {
  TEMP: 'text-gray-500 bg-gray-100',
  SUBMITTED: 'text-blue-600 bg-blue-50',
  CONFIRMED: 'text-emerald-600 bg-emerald-50',
};

function computeGpa(grades: GradeItem[]): string {
  const eligible = grades.filter(
    (g) => !g.isPassFail && g.gradePoints !== null && g.status === 'CONFIRMED'
  );
  if (eligible.length === 0) return '-';
  const totalCredits = eligible.reduce((sum, g) => sum + g.credit, 0);
  const totalPoints = eligible.reduce((sum, g) => sum + (g.gradePoints ?? 0) * g.credit, 0);
  if (totalCredits === 0) return '-';
  return (totalPoints / totalCredits).toFixed(2);
}

function computeTotalCredits(grades: GradeItem[]): number {
  return grades
    .filter((g) => g.status === 'CONFIRMED' && g.letterGrade !== 'F')
    .reduce((sum, g) => sum + g.credit, 0);
}

export default function MyGrades() {
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['myGrades'],
    queryFn: gradesApi.myGrades,
  });

  const gpa = computeGpa(grades);
  const totalCredits = computeTotalCredits(grades);
  const confirmedCount = grades.filter((g) => g.status === 'CONFIRMED').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="text-blue-600" size={26} />
          내 성적
        </h1>
        <p className="text-gray-500 text-sm mt-1">수강한 강의의 성적을 확인합니다.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <TrendingUp size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">GPA (확정)</p>
            <p className="text-2xl font-bold text-gray-900">{gpa}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Award size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">취득 학점</p>
            <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
            <BookOpen size={22} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">수강 과목</p>
            <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
          </div>
        </div>
      </div>

      {/* Grades table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">성적 목록</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
            성적 데이터가 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">강의명</th>
                <th className="px-5 py-3 text-left">학점</th>
                <th className="px-5 py-3 text-center">성적</th>
                <th className="px-5 py-3 text-center">점수</th>
                <th className="px-5 py-3 text-center">평점</th>
                <th className="px-5 py-3 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{g.courseName}</p>
                    <p className="text-xs text-gray-400">{g.courseCode}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{g.credit}학점</td>
                  <td className="px-5 py-3.5 text-center">
                    {g.letterGrade ? (
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          GRADE_COLORS[g.letterGrade] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {g.letterGrade}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600">
                    {g.score !== null ? g.score : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600">
                    {g.isPassFail ? 'P/NP' : g.gradePoints !== null ? g.gradePoints.toFixed(1) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                        STATUS_COLORS[g.status] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {STATUS_LABELS[g.status] ?? g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmedCount === 0 && grades.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          * GPA는 교수가 성적을 확정한 후 반영됩니다.
        </p>
      )}
    </div>
  );
}
