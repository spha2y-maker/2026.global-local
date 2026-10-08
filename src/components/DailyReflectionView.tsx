import React, { useState } from 'react';
import { 
  BookHeart, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  PenLine, 
  Lightbulb, 
  Heart, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Award,
  Check,
  Info
} from 'lucide-react';
import { DailyReflection } from '../types';
import { INITIAL_DAILY_REFLECTIONS } from '../data/travelData';

interface DailyReflectionViewProps {
  reflections: DailyReflection[];
  onUpdateReflection: (day: number, updated: Partial<DailyReflection>) => void;
}

export const DailyReflectionView: React.FC<DailyReflectionViewProps> = ({
  reflections,
  onUpdateReflection
}) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentReflection = reflections.find((r) => r.day === activeDay) || {
    day: activeDay,
    date: `2026. 10.${12 + activeDay}`,
    memorableScene: '',
    biggestEmotion: '',
    newlyLearned: ''
  };

  const completedCount = reflections.filter(
    (r) => r.memorableScene?.trim() && r.biggestEmotion?.trim() && r.newlyLearned?.trim()
  ).length;

  const daySummaries: Record<number, { title: string; places: string }> = {
    1: {
      title: '담양 출정 & 상하이 심장부 입성',
      places: '인천공항 ➔ 상하이 푸둥공항 ➔ 남경로 보행가 ➔ 마시청 서커스 공연 & 외탄 야경'
    },
    2: {
      title: '불멸의 독립운동 성지와 역사의 숨결',
      places: '루쉰공원(매헌기념관) ➔ 상하이 대한민국 임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원'
    },
    3: {
      title: '미래 첨단 과학과 글로벌 문화 콘텐츠',
      places: '상하이 과학기술관 ➔ 상하이 디즈니랜드 매직 킹덤 & 야간 일루미네이션'
    },
    4: {
      title: '글로벌 리더의 다짐 & 담양 귀환',
      places: '상하이 푸둥공항 출국 ➔ 인천공항 ➔ 담양 귀환 및 해단식'
    }
  };

  const handleResetDay = () => {
    if (window.confirm(`제${activeDay}일차 성찰일지 작성을 초기화하시겠습니까?`)) {
      onUpdateReflection(activeDay, {
        memorableScene: '',
        biggestEmotion: '',
        newlyLearned: ''
      });
      showToast(`제${activeDay}일차 성찰일지가 초기화되었습니다.`);
    }
  };

  const handleLoadExample = () => {
    const example = INITIAL_DAILY_REFLECTIONS.find((r) => r.day === activeDay);
    if (example) {
      if (window.confirm(`제${activeDay}일차 추천 예시 내용을 불러오시겠습니까?`)) {
        onUpdateReflection(activeDay, {
          memorableScene: example.memorableScene,
          biggestEmotion: example.biggestEmotion,
          newlyLearned: example.newlyLearned
        });
        showToast(`제${activeDay}일차 추천 예시 내용을 불러왔습니다.`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <BookHeart className="w-3.5 h-3.5" />
              <span>담양여자중학교 매일 밤 자기성찰 프로그램</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              오늘의 성찰일지 (Daily Reflection Journal)
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              하루의 탐방을 마치고 숙소에서 차분히 마음을 가다듬으며 오늘 하루 가장 기억에 남는 장면, 가슴 깊이 느낀 생각과 감정, 그리고 새롭게 알게 된 깨달음을 진솔하게 기록하세요.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">성찰일지 작성 현황</div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {completedCount} / 4 일차 완료
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>작성한 내용은 기기와 상관없이 로그인한 계정의 Cloud Firestore에 실시간 자동 저장됩니다.</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-800 font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>실시간 자동 동기화 활성화</span>
          </div>
        </div>
      </div>

      {/* 4 Days Tab Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((dayNum) => {
          const ref = reflections.find((r) => r.day === dayNum);
          const isDone = Boolean(ref?.memorableScene?.trim() && ref?.biggestEmotion?.trim() && ref?.newlyLearned?.trim());
          const isActive = activeDay === dayNum;

          return (
            <button
              key={dayNum}
              onClick={() => setActiveDay(dayNum)}
              className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  제{dayNum}일차
                </span>
                {isDone ? (
                  <span className="text-emerald-600 flex items-center gap-0.5 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 완료
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">작성 중</span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  10.{12 + dayNum} ({['화', '수', '목', '금'][dayNum - 1]})
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {daySummaries[dayNum]?.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Journal Card for the Selected Day */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Day Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
                D{activeDay}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {currentReflection.date || `2026. 10.${12 + activeDay} 제${activeDay}일차`} 성찰일지
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              주요 코스: {daySummaries[activeDay]?.places}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDay}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
              title="이 날짜 일지 비우기"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>초기화</span>
            </button>
            <button
              onClick={handleLoadExample}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
              title="예시 내용 참고하여 불러오기"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>예시 불러오기</span>
            </button>
          </div>
        </div>

        {/* 3 Core Fields Required by the User */}
        <div className="space-y-6">
          
          {/* 1. 기억에 남는 장면이나 사건 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  1. 기억에 남는 장면이나 사건
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentReflection.memorableScene?.length || 0}자
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>오늘 걸었던 거리, 방문지에서 눈앞에 가장 생생하게 스쳐 지나간 순간이나 모둠원들과 겪은 인상적인 에피소드를 구체적으로 묘사해 보세요.</span>
            </div>

            <textarea
              rows={4}
              value={currentReflection.memorableScene || ''}
              onChange={(e) => onUpdateReflection(activeDay, { memorableScene: e.target.value })}
              placeholder="예: 마시청 서커스 공연에서 거대한 철구 안을 질주하던 오토바이 묘기 장면과, 100년 전 독립운동가들이 비밀리에 걸었던 남경로 보행가의 석조 건물이 가장 눈에 아른거렸습니다..."
              className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition leading-relaxed"
            />
          </div>

          {/* 2. 가장 크게 느낀 생각이나 감정 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  2. 가장 크게 느낀 생각이나 감정
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentReflection.biggestEmotion?.length || 0}자
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>오늘 탐방을 하며 마음속 깊은 곳에서 울려 퍼진 감정(애국선열들에 대한 감사, 친구들과의 우정, 벅찬 감동, 조국에 대한 긍지 등)을 솔직하게 표현해 보세요.</span>
            </div>

            <textarea
              rows={4}
              value={currentReflection.biggestEmotion || ''}
              onChange={(e) => onUpdateReflection(activeDay, { biggestEmotion: e.target.value })}
              placeholder="예: 머나먼 타국 땅에서도 조국의 자주독립을 위해 모든 것을 바친 선열들의 결연한 눈빛을 생각하니, 가슴이 먹먹해지며 지금 내가 누리는 평화가 얼마나 소중한지 깊이 깨달았습니다..."
              className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition leading-relaxed"
            />
          </div>

          {/* 3. 새롭게 알게 된 것 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  3. 새롭게 알게 된 것
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentReflection.newlyLearned?.length || 0}자
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>교과서에서 글자로만 보다가 현장에 와서 눈으로 확인하며 새롭게 깨달은 역사적 사실, 문화와 과학기술의 원리, 나만의 새로운 배움을 정리해 보세요.</span>
            </div>

            <textarea
              rows={4}
              value={currentReflection.newlyLearned || ''}
              onChange={(e) => onUpdateReflection(activeDay, { newlyLearned: e.target.value })}
              placeholder="예: 상하이 대한민국 임시정부청사가 크고 웅장한 관공서가 아니라 좁은 골목의 스쿠먼 벽돌 주택이었다는 점과, 그럼에도 전 국민을 대변하는 헌법을 세운 정통 정부였다는 사실을 배웠습니다..."
              className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition leading-relaxed"
            />
          </div>

        </div>

        {/* Bottom Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveDay((prev) => Math.max(1, prev - 1))}
            disabled={activeDay === 1}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 일차 (D{activeDay - 1})</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {activeDay} / 4 일차
          </span>

          <button
            onClick={() => setActiveDay((prev) => Math.min(4, prev + 1))}
            disabled={activeDay === 4}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
          >
            <span>다음 일차 (D{activeDay + 1})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
