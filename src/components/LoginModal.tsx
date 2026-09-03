import React, { useState } from 'react';
import { UserCircle, Lock, School, ShieldAlert, CheckCircle2, Sparkles, X } from 'lucide-react';
import { StudentUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: StudentUser) => void;
}

const DAMYANG_SCHOOLS = [
  '담양여자중학교'
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [studentId, setStudentId] = useState('30215');
  const [name, setName] = useState('이수민');
  const [school, setSchool] = useState('담양여자중학교');
  const [password, setPassword] = useState('1234');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim() || !password.trim()) {
      setErrorMsg('학번, 이름, 비밀번호를 모두 입력해 주세요.');
      return;
    }

    const user: StudentUser = {
      studentId: studentId.trim(),
      name: name.trim(),
      school,
      password: password.trim(),
      role: 'student'
    };

    onLoginSuccess(user);
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'damyang2026' || adminPassword === 'admin') {
      const adminUser: StudentUser = {
        studentId: 'TEACHER',
        name: '인솔교사/관리자',
        school: '담양여자중학교 인솔추진단',
        role: 'admin'
      };
      onLoginSuccess(adminUser);
      onClose();
    } else {
      setErrorMsg('관리자 비밀번호가 올바르지 않습니다. (기본: damyang2026)');
    }
  };

  const handleQuickDemoStudent = () => {
    const user: StudentUser = {
      studentId: '30215',
      name: '이수민',
      school: '담양여자중학교',
      password: 'demo',
      role: 'student'
    };
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl shadow-xs mb-3">
            🎋
          </div>
          <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
            담양여자중학교 워크북
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2">
            2026. 글로컬 죽향 역사문화탐방
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            학번과 비밀번호를 통해 나만의 탐방 기록 및 스탬프를 안전하게 동기화합니다.
          </p>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 w-full mt-5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setErrorMsg(''); }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🎓 학생 로그인
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              👨‍🏫 인솔교사 관리실
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600" />
                  소속 학교
                </label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  {DAMYANG_SCHOOLS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <UserCircle className="w-3.5 h-3.5 text-emerald-600" />
                    학번 (5자리)
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="30215"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    이름 (학생 성명)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이수민"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * 첫 로그인 시 입력한 비밀번호가 내 워크북 비밀번호로 저장됩니다.
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>워크북 시작하기</span>
              </button>

              <div className="pt-3 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoStudent}
                  className="text-xs text-slate-500 hover:text-emerald-700 transition font-medium"
                >
                  ⚡ 체험용 학생 계정(담양여중 이수민)으로 1초 로그인
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                담양여자중학교 인솔 교사용 관리 모드입니다. 학생들의 실시간 8대 스탬프 완료 현황과 제출 보고서를 한눈에 조회하고 엑셀/PDF로 관리할 수 있습니다.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  교사용 인증 암호
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="인증 암호 입력 (damyang2026)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  * 기본 테스트 암호: <code className="text-emerald-700 font-mono font-bold">damyang2026</code>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm shadow-sm transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>교사 관리자 접속</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
