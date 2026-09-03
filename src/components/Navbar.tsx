import React from 'react';
import { 
  Home,
  Calendar, 
  MapPin, 
  Award, 
  Luggage,
  Plane, 
  Languages, 
  CloudSun, 
  BookOpen, 
  FileDown, 
  ShieldCheck, 
  LogOut, 
  UserCircle2,
  Sparkles
} from 'lucide-react';
import { StudentUser } from '../types';

interface NavbarProps {
  currentUser: StudentUser | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stampsCount: number;
  totalStamps: number;
  onLogout: () => void;
  onOpenLogin: () => void;
  adminNewSubmissionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  stampsCount,
  totalStamps,
  onLogout,
  onOpenLogin,
  adminNewSubmissionsCount = 0
}) => {
  const navItems = [
    { id: 'home', label: '홈', icon: Home, emoji: '🏠' },
    { id: 'schedule', label: '탐방 일정', icon: Calendar, emoji: '📅' },
    { id: 'places', label: '8대 방문지 워크북', icon: MapPin, emoji: '🗺️' },
    { id: 'stamps', label: '사진인증 스탬프', icon: Award, emoji: '💮', badge: `${stampsCount}/${totalStamps}` },
    { id: 'toolkit', label: '여행 툴킷', icon: Luggage, emoji: '🧳' },
    { id: 'immigration', label: '입국심사 영어', icon: Plane, emoji: '✈️' },
    { id: 'chinese', label: '필수 중국어', icon: Languages, emoji: '🇨🇳' },
    { id: 'weather', label: '기후 조사', icon: CloudSun, emoji: '⛅' },
    { id: 'book', label: '<맞바꾼 회중시계>', icon: BookOpen, emoji: '📖' },
    { id: 'export', label: 'PPT/PDF 출력', icon: FileDown, emoji: '📑' },
    { 
      id: 'admin', 
      label: '교사 관리실', 
      icon: ShieldCheck, 
      emoji: '👨‍🏫',
      notification: adminNewSubmissionsCount > 0 ? adminNewSubmissionsCount : undefined
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs text-xl">
              🎋
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  담양여자중학교
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> 학생 워크북
                </span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>2026. 글로컬 죽향 역사문화탐방</span>
              </h1>
            </div>
          </div>

          {/* Center Weather & Status Pill Widget */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-xs">
            <span className="flex items-center gap-1">
              <span className="text-amber-500 text-sm">☀️</span>
              <span className="font-mono font-medium">상하이 24°C</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1">
              <span>스탬프 {stampsCount}/{totalStamps}</span>
            </span>
          </div>

          {/* User Status / Auth Action */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentUser ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-1.5 space-x-2.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {currentUser.role === 'admin' ? '교사' : '학생'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[11px] text-emerald-700 font-mono">({currentUser.studentId})</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentUser.school}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="로그아웃"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95"
              >
                <UserCircle2 className="w-4 h-4" />
                <span>학생 로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Navigation Tabs with Bright Light Styling */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-200/80 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className="text-sm">{item.emoji}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-emerald-800 text-white'
                      : stampsCount === totalStamps
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.notification !== undefined && (
                  <span className="animate-pulse bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.notification}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
