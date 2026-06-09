import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/api/courses';
import { gradesApi } from '@/api/grades';
import type { GradeItem } from '@/types';
import { PenSquare, Search, ChevronDown, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LETTER_GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.5, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
  'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0,
};

interface GradeFormState {
  letterGrade: string;
  score: string;
  remark: string;
}

export default function GradeManagement() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [keyword, setKeyword] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [editingMap, setEditingMap] = useState<Record<number, GradeFormState>>({});
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const currentYear = new Date().getFullYear();
  const currentSemester = new Date().getMonth() < 6 ? 1 : 2;

  const { data: coursePage } = useQuery({
    queryKey: ['professorCourses', keyword],
    queryFn: () =>
      coursesApi.list({ year: currentYear, semester: currentSemester, keyword, size: 50 }),
  });

  const courses = coursePage?.content ?? [];

  const { data: gradeList = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['courseGrades', selectedCourseId],
    queryFn: () => gradesApi.courseGrades(selectedCourseId!),
    enabled: selectedCourseId !== null,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { enrollmentId: number; letterGrade: string; score: number; gradePoints: number }) =>
      gradesApi.submit(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['courseGrades', selectedCourseId] });
      setSavedIds((prev) => new Set(prev).add(vars.enrollmentId));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; letterGrade: string; score: number; gradePoints: number }) =>
      gradesApi.update(data.id, { letterGrade: data.letterGrade, score: data.score, gradePoints: data.gradePoints }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseGrades', selectedCourseId] });
    },
  });

  const getFormState = (grade: GradeItem): GradeFormState => {
    return (
      editingMap[grade.id] ?? {
        letterGrade: grade.letterGrade ?? '',
        score: grade.score?.toString() ?? '',
        remark: '',
      }
    );
  };

  const setFormField = (gradeId: number, field: keyof GradeFormState, value: string, grade: GradeItem) => {
    setEditingMap((prev) => ({
      ...prev,
      [gradeId]: { ...getFormState(grade), [field]: value },
    }));
  };

  const handleSave = (grade: GradeItem) => {
    const form = getFormState(grade);
    const lg = form.letterGrade;
    const sc = parseFloat(form.score);
    const gp = GRADE_POINTS[lg] ?? 0;

    if (!lg) return;

    if (grade.letterGrade === null) {
      submitMutation.mutate({ enrollmentId: grade.enrollmentId, letterGrade: lg, score: sc, gradePoints: gp });
    } else {
      updateMutation.mutate({ id: grade.id, letterGrade: lg, score: sc, gradePoints: gp });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PenSquare className="text-blue-600" size={24} />
          성적 입력
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {currentYear}년 {currentSemester}학기 담당 강의의 수강생 성적을 입력합니다.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Course selector */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">담당 강의</p>
              <div className="mt-2 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="강의명 검색..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>
            <ul className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {courses.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-xs">강의가 없습니다.</li>
              ) : (
                courses.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setEditingMap({});
                        setSavedIds(new Set());
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedCourseId === c.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.courseCode} · {c.currentEnrollment}명 수강</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Grade input table */}
        <div className="col-span-8">
          {selectedCourseId === null ? (
            <div className="bg-white rounded-xl border border-gray-200 h-64 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <ChevronDown size={32} className="mx-auto mb-2 opacity-30" />
                좌측에서 강의를 선택하세요
              </div>
            </div>
          ) : gradesLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 h-64 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gradeList.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 h-64 flex items-center justify-center text-gray-400 text-sm">
              수강생이 없거나 아직 성적 데이터가 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  수강생 성적 입력 <span className="text-gray-400 font-normal ml-1">({gradeList.length}명)</span>
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">학번 / 이름</th>
                    <th className="px-4 py-3 text-center w-28">성적</th>
                    <th className="px-4 py-3 text-center w-24">점수</th>
                    <th className="px-4 py-3 text-center w-20">저장</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gradeList.map((g) => {
                    const form = getFormState(g);
                    const isSaved = savedIds.has(g.enrollmentId);
                    const isConfirmed = g.status === 'CONFIRMED';
                    return (
                      <tr key={g.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{g.studentName}</p>
                          <p className="text-xs text-gray-400">{g.studentNumber}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={form.letterGrade}
                            onChange={(e) => setFormField(g.id, 'letterGrade', e.target.value, g)}
                            disabled={isConfirmed}
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            <option value="">선택</option>
                            {LETTER_GRADES.map((lg) => (
                              <option key={lg} value={lg}>{lg}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            value={form.score}
                            onChange={(e) => setFormField(g.id, 'score', e.target.value, g)}
                            disabled={isConfirmed}
                            placeholder="점수"
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isConfirmed ? (
                            <span className="text-xs text-emerald-600 font-medium">확정</span>
                          ) : isSaved ? (
                            <CheckCircle2 size={18} className="mx-auto text-emerald-500" />
                          ) : (
                            <button
                              onClick={() => handleSave(g)}
                              disabled={!form.letterGrade || submitMutation.isPending || updateMutation.isPending}
                              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Save size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
