import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { University, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { attendanceApi } from '@/api/attendance';
import { useAuthStore } from '@/store/authStore';

export default function AttendanceCheckIn() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [code, setCode] = useState('');
  const [result, setResult] = useState<{
    status: string;
    checkedInAt: string;
    courseName: string;
  } | null>(null);

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['attendance', 'qr', qrToken],
    queryFn: () => attendanceApi.getQrSession(qrToken!),
    enabled: !!qrToken,
    retry: false,
  });

  const checkInMutation = useMutation({
    mutationFn: () =>
      attendanceApi.checkIn({ qrToken: qrToken!, accessCode: code }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          세션 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-800">유효하지 않은 QR 코드</h2>
          <p className="text-sm text-gray-500">
            출결 세션을 찾을 수 없거나 이미 종료된 세션입니다.
          </p>
        </div>
      </div>
    );
  }

  // Session is closed
  if (!session.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle size={48} className="text-yellow-400 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-800">종료된 출결 세션</h2>
          <p className="text-sm text-gray-500">
            이 출결 세션은 이미 종료되었습니다.
          </p>
          <div className="text-left bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <p><span className="text-gray-400">강의</span> <span className="font-medium text-gray-700 ml-2">{session.courseName}</span></p>
            <p><span className="text-gray-400">교수</span> <span className="font-medium text-gray-700 ml-2">{session.professorName}</span></p>
            <p><span className="text-gray-400">날짜</span> <span className="font-medium text-gray-700 ml-2">{session.lectureDate}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Check-in result
  if (result) {
    const isLate = result.status === 'LATE';
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <CheckCircle2
            size={56}
            className={isLate ? 'text-yellow-400 mx-auto' : 'text-green-500 mx-auto'}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isLate ? '지각 처리되었습니다' : '출석 확인되었습니다!'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{result.courseName}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 text-left">
            <p>
              <span className="text-gray-400">상태</span>
              <span
                className={`ml-2 font-semibold ${isLate ? 'text-yellow-600' : 'text-green-600'}`}
              >
                {isLate ? '지각' : '출석'}
              </span>
            </p>
            <p>
              <span className="text-gray-400">시각</span>
              <span className="ml-2 font-medium text-gray-700">
                {result.checkedInAt.slice(11, 19)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mx-auto">
            <University size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">출석 체크인</h2>
            <p className="text-sm text-gray-500 mt-1">{session.courseName}</p>
          </div>
          <div className="text-left bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <p><span className="text-gray-400">교수</span> <span className="font-medium text-gray-700 ml-2">{session.professorName}</span></p>
            <p><span className="text-gray-400">날짜</span> <span className="font-medium text-gray-700 ml-2">{session.lectureDate}</span></p>
            <p><span className="text-gray-400">종료</span> <span className="font-medium text-gray-700 ml-2">{session.endTime.slice(11, 16)}</span></p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 text-left">
            <Lock size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700">출석 체크인을 위해 로그인이 필요합니다.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            로그인하고 출석 체크인
          </button>
        </div>
      </div>
    );
  }

  // Logged in — show code input
  const errorMsg = (checkInMutation.error as { response?: { data?: { message?: string } } } | null)
    ?.response?.data?.message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <University size={28} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">출석 체크인</h2>
          <p className="text-sm text-gray-500 mt-0.5">{session.courseName}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
          <p><span className="text-gray-400">교수</span> <span className="font-medium text-gray-700 ml-2">{session.professorName}</span></p>
          <p><span className="text-gray-400">날짜</span> <span className="font-medium text-gray-700 ml-2">{session.lectureDate}</span></p>
          <p><span className="text-gray-400">종료</span> <span className="font-medium text-gray-700 ml-2">{session.endTime.slice(11, 16)}</span></p>
          <p>
            <span className="text-gray-400">학생</span>
            <span className="font-medium text-gray-700 ml-2">{user.name}</span>
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            6자리 출석 코드 입력
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
          {errorMsg && (
            <p className="text-sm text-red-600 text-center">{errorMsg}</p>
          )}
          <button
            onClick={() => checkInMutation.mutate()}
            disabled={code.length !== 6 || checkInMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
          >
            {checkInMutation.isPending ? '처리 중...' : '출석 체크인'}
          </button>
        </div>
      </div>
    </div>
  );
}
