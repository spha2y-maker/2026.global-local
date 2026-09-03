import React from 'react';
import { 
  BookOpen, 
  Clock, 
  HeartHandshake, 
  Sparkles, 
  Feather, 
  Award, 
  CheckCircle2,
  Quote
} from 'lucide-react';
import { BookActivity } from '../types';
import { BOOK_ACTIVITY_BACKGROUND } from '../data/travelData';

interface BookActivityViewProps {
  activity: BookActivity;
  onUpdateActivity: (updated: Partial<BookActivity>) => void;
}

export const BookActivityView: React.FC<BookActivityViewProps> = ({
  activity,
  onUpdateActivity
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Top Banner with Historical Clock Visual Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-emerald-50/20 to-white border border-amber-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-mono font-bold mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>담양여자중학교 국어·역사·도덕 융합 독서 활동</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <span>&lt;{BOOK_ACTIVITY_BACKGROUND.bookTitle}&gt; 독서 활동 워크북</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              글: 김남중 | 상하이 홍커우 공원 의거와 두 애국지사의 숭고한 약속
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs text-xs text-amber-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">등록문화재 제441·442호 회중시계의 교훈</span>
          </div>
        </div>

        {/* Famous Historical Exchange Highlight */}
        <div className="mt-6 p-5 rounded-2xl bg-white/90 border border-amber-200 relative shadow-2xs">
          <Quote className="w-8 h-8 text-amber-400/20 absolute top-3 right-4 pointer-events-none" />
          <div className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" />
            <span>1932년 4월 29일 새벽, 상하이의 약속</span>
          </div>
          <blockquote className="text-xs sm:text-sm text-amber-950 font-serif italic leading-relaxed">
            {BOOK_ACTIVITY_BACKGROUND.famousQuote}
          </blockquote>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {BOOK_ACTIVITY_BACKGROUND.kimGooResponse}
          </p>
        </div>
      </div>

      {/* 4 Deep Reading Worksheets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-amber-400/80 transition shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>1. 책의 핵심 줄거리 & 가장 가슴 뭉클했던 명장면</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            책을 읽고 난 뒤 머릿속에 가장 선명하게 남은 장면과 그 이유를 자유롭게 서술하세요.
          </p>
          <textarea
            rows={4}
            value={activity.readingSummary}
            onChange={(e) => onUpdateActivity({ readingSummary: e.target.value })}
            placeholder="상하이로 건너간 윤봉길 의사의 고뇌, 백범과의 만남, 결전의 날 아침 풍경 등..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
          />
        </div>

        {/* Section 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-amber-400/80 transition shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>2. '시계를 맞바꾼 까닭'과 남겨진 시간의 의미</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            윤봉길 의사가 6원짜리 새 시계를 백범의 2원짜리 낡은 시계와 바꾸자고 한 진정한 속뜻은 무엇이었을까요?
          </p>
          <textarea
            rows={4}
            value={activity.clockExchangeMeaning}
            onChange={(e) => onUpdateActivity({ clockExchangeMeaning: e.target.value })}
            placeholder="'저는 이제 한 시간밖에 더 쓸모가 없습니다'라는 말 속에 담긴 비장함과 조국 독립을 향한 염원에 대해 적어보세요..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
          />
        </div>

        {/* Section 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-amber-400/80 transition shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Feather className="w-4 h-4" />
            <span>3. 감정이입 글쓰기 : 내가 만약 윤봉길(또는 김구)이었다면</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            당시 불과 스물다섯 나이였던 윤봉길 의사, 혹은 아들과도 같은 청년을 사지로 보내야 했던 백범 김구 선생의 심정이 되어 편지를 써보세요.
          </p>
          <textarea
            rows={4}
            value={activity.ifIWereHero}
            onChange={(e) => onUpdateActivity({ ifIWereHero: e.target.value })}
            placeholder="선생님께(혹은 봉길에게)... 차마 말로 다 하지 못했던 마음을 글로 띄웁니다..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
          />
        </div>

        {/* Section 4 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-amber-400/80 transition shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>4. 회중시계가 남긴 유산과 담양여중인으로서 나의 다짐</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            선열들이 피땀 흘려 지켜낸 대한민국에서 살아가는 오늘날, 담양의 청소년으로서 나는 어떤 꿈과 가치를 실천할 것인지 약속해 보세요.
          </p>
          <textarea
            rows={4}
            value={activity.myPromiseToFuture}
            onChange={(e) => onUpdateActivity({ myPromiseToFuture: e.target.value })}
            placeholder="대나무처럼 곧고 푸른 기개로 세계를 품는 글로벌 인재가 되기 위한 나의 다짐..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
          />
        </div>

      </div>

    </div>
  );
};
