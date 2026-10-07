import React, { useRef, useState, useEffect } from 'react';
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
  Sparkles,
  CloudCheck,
  RefreshCw,
  BookHeart,
  ChevronLeft,
  ChevronRight
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
  cloudSyncStatus?: 'saving' | 'saved' | 'idle' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  stampsCount,
  totalStamps,
  onLogout,
  onOpenLogin,
  adminNewSubmissionsCount = 0,
  cloudSyncStatus = 'saved'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const navItems = [
    { id: 'home', label: '홈', icon: Home, emoji: '🏠' },
    { id: 'schedule', label: '탐방 일정', icon: Calendar, emoji: '📅' },
    { id: 'places', label: '8대 방문지 워크북', icon: MapPin, emoji: '🗺️' },
    { id: 'reflection', label: '오늘의 성찰일지', icon: BookHeart, emoji: '📝' },
    { id: 'stamps', label: '스탬프 랠리', icon: Award, emoji: '💮', badge: `${stampsCount}/${totalStamps}` },
    { id: 'weather', label: '기후 조사', icon: CloudSun, emoji: '⛅' },
    { id: 'toolkit', label: '여행 툴킷', icon: Luggage, emoji: '🧳' },
    { id: 'immigration', label: '입국심사 영어', icon: Plane, emoji: '✈️' },
    { id: 'chinese', label: '필수 중국어', icon: Languages, emoji: '🇨🇳' },
    { id: 'export', label: '발표/PDF 출력', icon: FileDown, emoji: '📑' },
    { 
      id: 'admin', 
      label: '교사 관리실', 
      icon: ShieldCheck, 
      emoji: '👨‍🏫',
      notification: adminNewSubmissionsCount > 0 ? adminNewSubmissionsCount : undefined
    },
  ];

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth + 2;
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [currentUser?.role]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 250);
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    // Center selected element on mobile/tablet
    setTimeout(() => {
      const el = scrollContainerRef.current;
      const activeEl = document.getElementById(`nav-tab-${id}`);
      if (el && activeEl) {
        const elRect = el.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const offset = (activeRect.left + activeRect.width / 2) - (elRect.left + elRect.width / 2);
        el.scrollBy({ left: offset, behavior: 'smooth' });
        setTimeout(checkScroll, 250);
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs text-lg">
              🎋
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  담양여중
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> 학생 워크북
                </span>
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1 mt-0.5">
                <span>2026. 글로컬 죽향 역사문화탐방</span>
              </h1>
            </div>
          </div>

          {/* Center Weather & Status Pill Widget */}
          <div className="hidden xl:flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-xs">
            <span className="flex items-center gap-1">
              <span className="text-amber-500">☀️</span>
              <span className="font-mono font-medium">상하이 24°C</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1">
              <span>스탬프 {stampsCount}/{totalStamps}</span>
            </span>
            {currentUser && currentUser.role === 'student' && (
              <>
                <span className="text-slate-300">|</span>
                {cloudSyncStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                    <span>저장 중</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>동기화됨</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* User Status / Auth Action */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 space-x-2 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
                  {currentUser.role === 'admin' ? '교사' : '학생'}
                </div>
                <div className="text-left">
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-700 font-mono">({currentUser.studentId})</span>
                  </div>
                  <div className="text-[9px] text-slate-500 hidden sm:block">
                    {currentUser.school}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="로그아웃"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-all active:scale-95"
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                <span>학생 로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs with Left/Right Scroll Arrows and Perfect Containment */}
        <div className="relative border-t border-slate-200/80 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-white">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex items-center">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-full bg-white/95 border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition"
                aria-label="이전 메뉴 보기"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-6 h-9 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            </div>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex items-center">
              <div className="w-6 h-9 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-full bg-white/95 border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition"
                aria-label="다음 메뉴 보기"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Bar Track */}
          <nav 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none scroll-smooth px-1"
          >
            {navItems.filter(item => item.id !== 'admin' || (currentUser && currentUser.role === 'admin')).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-tab-${item.id}`}
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 relative shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className="tracking-tight">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
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

      </div>
    </header>
  );
};
