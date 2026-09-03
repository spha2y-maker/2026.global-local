import React, { useState, useEffect } from 'react';
import { 
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
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Rocket, 
  HeartHandshake, 
  ChevronRight,
  Compass,
  Building2,
  Users
} from 'lucide-react';
import { StudentUser, WorkbookEntry } from '../types';
import { PLACES_DATA } from '../data/travelData';

interface HomeViewProps {
  currentUser: StudentUser | null;
  entries: Record<string, WorkbookEntry>;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  entries,
  setActiveTab,
  onOpenLogin
}) => {
  // D-Day Target: 2026-10-13 07:00:00 (KST, UTC+9)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateCountdown = () => {
      const departureDate = new Date('2026-10-13T07:00:00+09:00').getTime();
      const now = new Date().getTime();
      const difference = departureDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalStamps = PLACES_DATA.length;
  const acquiredStamps = (Object.values(entries) as WorkbookEntry[]).filter(e => e.stampAcquired).length;
  const completionPercent = Math.round((acquiredStamps / totalStamps) * 100);

  // 3 Core Values
  const coreValues = [
    {
      title: '독립투혼의 숨결',
      subtitle: '순국선열의 숭고한 나라사랑',
      icon: Flame,
      color: 'from-amber-500 to-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-900',
      accentColor: 'text-rose-600',
      desc: '백범 김구 선생과 매헌 윤봉길 의사의 숨결이 서린 상하이 대한민국 임시정부청사와 루쉰공원(매헌기념관)을 답사하며, 일제강점기 조국 광복을 위해 목숨을 바친 애국선열들의 불굴의 독립투혼을 가슴 깊이 새깁니다.'
    },
    {
      title: '2050 스마트 미래',
      subtitle: '글로벌 경제·과학·문화 중심지',
      icon: Rocket,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-950',
      accentColor: 'text-cyan-700',
      desc: '468m 동방명주 타워와 푸둥 금융 중심가, 첨단 상하이 과학기술관 및 세계적 문화 콘텐츠 디즈니랜드를 체험하며, 4차 산업혁명과 인공지능 시대를 이끌어갈 글로벌 안목과 창의적 미래 역량을 기릅니다.'
    },
    {
      title: '전남의 \'의\' 정신',
      subtitle: '담양의 대나무 기개와 정의로운 리더십',
      icon: HeartHandshake,
      color: 'from-emerald-500 to-teal-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-950',
      accentColor: 'text-emerald-700',
      desc: '의향(義鄕) 전남과 담양의 푸른 대나무처럼 바르고 곧은 선비 정신(죽향)을 이어받아, 국가와 인류 사회에 기여하고 타인을 배려하며 정의를 실천하는 당당한 담양여중인으로 성장합니다.'
    }
  ];

  // Navigation Hub Items
  const navHub = [
    {
      id: 'schedule',
      title: '3박 4일 탐방 일정표',
      desc: '담양 집결(07:00)부터 인천공항, 상하이 명소 코스 및 식사 안내',
      icon: Calendar,
      emoji: '📅',
      badge: '10.13 ~ 10.16',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'places',
      title: '8대 방문지 워크북',
      desc: '루쉰공원, 임시정부청사, 동방명주, 예원 등 현장 탐구 기록',
      icon: MapPin,
      emoji: '🗺️',
      badge: '필수 8개 코스',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'stamps',
      title: '사진인증 스탬프 랠리',
      desc: '8개 현장 미션 인증 사진을 찍고 디지털 스탬프 수집 및 완주 제출',
      icon: Award,
      emoji: '💮',
      badge: `${acquiredStamps} / ${totalStamps} 획득`,
      badgeColor: acquiredStamps === 8 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
    },
    {
      id: 'toolkit',
      title: '여행 툴킷 (준비물 & 환율)',
      desc: '출발 전 필수 짐 싸기 체크리스트와 중국 위안화(CNY) 환율 계산기',
      icon: Luggage,
      emoji: '🧳',
      badge: '출발 필수 준비',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'immigration',
      title: '입국심사 영어 말하기',
      desc: '푸둥공항 입국심사관 질문과 자신 있는 영어 답변 음성 듣기 훈련',
      icon: Plane,
      emoji: '✈️',
      badge: '원어민 TTS 지원',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'chinese',
      title: '생생 중국어 회화 16선',
      desc: '식당 주문, 길찾기, 쇼핑, 긴급 상황 필수 중국어 발음 듣기',
      icon: Languages,
      emoji: '🇨🇳',
      badge: '병음·성조 학습',
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'weather',
      title: '상하이 기후 조사 일지',
      desc: '3박 4일 일정별 최저/최고 기온, 습도, 일교차와 옷차림 탐구',
      icon: CloudSun,
      emoji: '⛅',
      badge: '과학·환경 융합',
      badgeColor: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 'book',
      title: '<맞바꾼 회중시계> 독서 활동',
      desc: '김구와 윤봉길의 시계 교환에 담긴 역사적 의미와 나의 다짐',
      icon: BookOpen,
      emoji: '📖',
      badge: '국어·역사·도덕',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'export',
      title: 'PPT 발표 & 워크북 PDF 출력',
      desc: '완성된 나만의 탐방 기록을 슬라이드로 발표하고 인쇄/제출하기',
      icon: FileDown,
      emoji: '📑',
      badge: '최종 결과물',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Hero Banner with D-Day Countdown */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg border border-emerald-600/40">
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Main Slogan & Title */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/60 border border-emerald-400/40 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>2026. 담양여자중학교 글로컬 죽향 역사문화탐방</span>
            </div>

            {/* Requested Main Slogan */}
            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight sm:leading-snug text-white">
              “담양의 죽향 정신을 품고<br className="hidden sm:inline" />
              <span className="text-emerald-300"> 상하이의 역사와 미래를 만나다</span>”
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
              선열들의 뜨거운 독립투혼이 살아 숨쉬는 역사 현장부터 세계 경제와 스마트 첨단 과학을 선도하는 상하이까지, 
              담양여중 학생들이 대나무의 곧은 기개와 글로컬 안목을 키워가는 자기주도 융합 워크북입니다.
            </p>

            {/* Date & Location Pill */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-emerald-100 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-emerald-900/50 px-3 py-1 rounded-xl border border-emerald-500/30">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                2026년 10월 13일(화) ~ 10월 16일(금) [3박 4일]
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-900/50 px-3 py-1 rounded-xl border border-emerald-500/30">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                1일차 담양 집결 07:00 출발
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-900/50 px-3 py-1 rounded-xl border border-emerald-500/30">
                <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                중국 상하이 일원
              </span>
            </div>
          </div>

          {/* D-Day Card Component */}
          <div className="w-full lg:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>탐방 출발 D-Day 카운트다운</span>
              </div>

              {timeLeft.isPast ? (
                <div className="py-3 px-6 bg-emerald-600/80 rounded-2xl border border-emerald-300/40 text-lg font-bold text-white">
                  🎉 탐방이 시작되었습니다!
                </div>
              ) : (
                <>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight my-1">
                    D-{timeLeft.days}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center w-full">
                    <div className="bg-black/20 rounded-xl p-2 min-w-[60px]">
                      <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300">{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div className="text-[10px] text-emerald-200">시간</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2 min-w-[60px]">
                      <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div className="text-[10px] text-emerald-200">분</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2 min-w-[60px]">
                      <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div className="text-[10px] text-emerald-200">초</div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 pt-3 border-t border-white/15 w-full flex items-center justify-between text-[11px] text-emerald-100">
                <span>출발일: 2026. 10. 13.(화)</span>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="font-bold underline hover:text-white flex items-center gap-0.5"
                >
                  일정 보기 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Student Status Quick Summary Bar */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
            🎋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                {currentUser?.name || '체험 학생'} 학생의 워크북
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                {currentUser?.school || '담양여자중학교'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              학번: <span className="font-mono font-medium text-slate-700">{currentUser?.studentId || '30215'}</span> | 상하이 8대 명소 스탬프 랠리 참여 중
            </p>
          </div>
        </div>

        {/* Mini Stamp Progress */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 min-w-[260px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">8대 스탬프 획득 현황</span>
              <span className="text-emerald-700 font-mono">{acquiredStamps} / {totalStamps}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setActiveTab('stamps')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition"
          >
            스탬프 찍기
          </button>
        </div>
      </section>

      {/* 2. Three Core Values of the Exploration */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 Core Values of Glocal Damyang Tour</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              글로컬 죽향 역사문화탐방의 3대 핵심 가치
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {coreValues.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className={`rounded-3xl p-6 border ${v.borderColor} ${v.bgColor} shadow-xs flex flex-col justify-between transition hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-white shadow-xs border ${v.borderColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${v.accentColor}`} />
                    </div>
                    <span className="text-xs font-mono font-black text-slate-400">
                      VALUE 0{idx + 1}
                    </span>
                  </div>

                  <span className={`text-xs font-bold ${v.accentColor} block mb-1`}>
                    {v.subtitle}
                  </span>
                  <h3 className={`text-xl font-black ${v.textColor} tracking-tight mb-3`}>
                    {v.title}
                  </h3>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">핵심 연계 활동</span>
                  <span className={`font-bold ${v.accentColor}`}>
                    {idx === 0 ? '임시정부·매헌기념관' : idx === 1 ? '동방명주·과기관·디즈니' : '회중시계·담양정신'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Quick Navigation Hub Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore All Modules</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              워크북 주요 메뉴 바로가기
            </h2>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            필요한 학습 메뉴를 클릭하여 바로 이동할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navHub.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="group p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center text-lg transition">
                      <span>{item.emoji}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition flex items-center gap-1.5">
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition">
                  <span>바로가기</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Travel Essential Notice Card */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Luggage className="w-3.5 h-3.5" />
            <span>탐방 출발 전 필수 확인</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            짐 싸기와 환율 계산이 필요하신가요?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            여권 유효기간, 보조배터리 비행기 기내 반입 규정, 비상약 등 꼼꼼한 체크리스트와 중국 위안화(CNY) 환율 계산기를 지금 바로 활용해 보세요.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('toolkit')}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Luggage className="w-4 h-4" />
          <span>여행 툴킷 열기 (준비물 & 환율)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
