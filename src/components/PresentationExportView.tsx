import React, { useState } from 'react';
import { 
  Printer, 
  Presentation, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Award,
  School,
  User,
  Calendar
} from 'lucide-react';
import { StudentUser, WorkbookEntry, WeatherRecord, BookActivity } from '../types';
import { PLACES_DATA } from '../data/travelData';

interface PresentationExportViewProps {
  currentUser: StudentUser | null;
  entries: Record<string, WorkbookEntry>;
  weatherRecords: WeatherRecord[];
  bookActivity: BookActivity;
}

interface SlideItem {
  title: string;
  subtitle?: string;
  type: 'cover' | 'overview' | 'place' | 'weather' | 'book';
  stamps?: string;
  items?: string[];
  place?: any;
  entry?: any;
  records?: any;
  activity?: any;
}

export const PresentationExportView: React.FC<PresentationExportViewProps> = ({
  currentUser,
  entries,
  weatherRecords,
  bookActivity
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'slideshow'>('preview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const completedStamps = PLACES_DATA.filter((p) => entries[p.id]?.stampAcquired).length;

  const handlePrint = () => {
    window.print();
  };

  // Slides configuration for Presentation Mode
  const slides: SlideItem[] = [
    {
      title: '2026 글로컬 죽향 역사·문화 탐방 결과 보고서',
      subtitle: `${currentUser?.school || '담양여자중학교'} 3학년 | 학번: ${currentUser?.studentId || '30215'} | 성명: ${currentUser?.name || '이수민'}`,
      type: 'cover',
      stamps: `${completedStamps} / 8 완료`
    },
    {
      title: '탐방 개요 및 4일간의 여정 요약',
      type: 'overview',
      items: [
        '제1일차 (10.13): 담양여중 출정 ➔ 인천공항 ➔ 상하이 푸동공항 ➔ 남경로 보행가 ➔ 외탄 야경',
        '제2일차 (10.14): 루쉰공원(매헌기념관) ➔ 임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원',
        '제3일차 (10.15): 상하이 과학기술관 ➔ 상하이 디즈니랜드 ➔ 야간 마법의 성 일루미네이션',
        '제4일차 (10.16): 상하이 푸동공항 출국 ➔ 인천공항 ➔ 담양 귀환 및 해단식'
      ]
    },
    ...PLACES_DATA.map((p, idx) => ({
      title: `${idx + 1}. ${p.name} 탐구 및 현장 인증`,
      place: p,
      entry: entries[p.id],
      type: 'place' as const
    })),
    {
      title: '상하이 4일간 기후 조사 및 관측 결과',
      type: 'weather',
      records: weatherRecords
    },
    {
      title: '<맞바꾼 회중시계> 독서활동과 청소년의 다짐',
      type: 'book',
      activity: bookActivity
    }
  ];

  const totalSlides = slides.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Top Action Header (Hidden in Print) */}
      <div className="print:hidden relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/20 to-white border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>담양여자중학교 결과 보고서 & 프레젠테이션</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              나만의 탐방 워크북 인쇄 및 PPT 발표 자료
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              작성한 모든 답사 기록, 인증 사진, 스탬프, 교과 탐구, 기후 조사, 독후감이 집약된 공식 보고서입니다. 
              PDF 파일로 저장/출력하거나 PPT 슬라이드쇼 모드로 교실에서 발표할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'preview' ? 'slideshow' : 'preview')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <Presentation className="w-4 h-4 text-emerald-600" />
              <span>{viewMode === 'preview' ? 'PPT 슬라이드 발표 모드' : '인쇄용 문서 뷰'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>PDF 저장 / 인쇄하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Interactive PPT Presentation Slideshow */}
      {viewMode === 'slideshow' ? (
        <div className="print:hidden bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-mono text-emerald-700 font-bold">
              <span>SLIDE {currentSlide + 1} / {totalSlides}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(c => Math.max(0, c - 1))}
                className="p-2 rounded-xl bg-slate-50 disabled:opacity-30 hover:bg-slate-100 text-slate-700 border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentSlide === totalSlides - 1}
                onClick={() => setCurrentSlide(c => Math.min(totalSlides - 1, c + 1))}
                className="p-2 rounded-xl bg-slate-50 disabled:opacity-30 hover:bg-slate-100 text-slate-700 border border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Frame (16:9 Aspect Ratio) */}
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 rounded-2xl border border-slate-200 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xs">
            {/* Slide Header */}
            <div>
              <div className="text-xs font-mono text-emerald-700 font-bold uppercase tracking-wider mb-2">
                2026. 글로컬 죽향 역사문화탐방 | 담양여자중학교
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {slides[currentSlide].title}
              </h3>
            </div>

            {/* Slide Body Content */}
            <div className="my-auto">
              {slides[currentSlide].type === 'cover' && (
                <div className="text-center space-y-4 py-8">
                  <div className="text-5xl sm:text-6xl">🎋 ✈️ 🇨🇳</div>
                  <div className="text-sm sm:text-lg text-emerald-800 font-semibold">
                    {slides[currentSlide].subtitle}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm font-bold">
                    <Award className="w-4 h-4" />
                    <span>8대 탐방지 스탬프: {slides[currentSlide].stamps}</span>
                  </div>
                </div>
              )}

              {slides[currentSlide].type === 'overview' && (
                <div className="space-y-3">
                  {slides[currentSlide].items?.map((it, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-center gap-3 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              )}

              {slides[currentSlide].type === 'place' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    {slides[currentSlide].entry?.photoUrl ? (
                      <img
                        src={slides[currentSlide].entry.photoUrl}
                        alt="인증사진"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={slides[currentSlide].place.image}
                        alt="기본사진"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {slides[currentSlide].entry?.stampAcquired && (
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                        ★ 스탬프 인증 완료
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <strong className="text-emerald-700 block mb-1">우리나라와의 관련성</strong>
                      {slides[currentSlide].place.koreaConnection}
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <strong className="text-teal-700 block mb-1">나의 탐방 소감</strong>
                      {slides[currentSlide].entry?.reflectionText || '아직 소감이 작성되지 않았습니다.'}
                    </div>
                  </div>
                </div>
              )}

              {slides[currentSlide].type === 'weather' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {weatherRecords.map(w => (
                    <div key={w.day} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
                      <div className="text-[11px] font-bold text-emerald-700 font-mono">DAY {w.day}</div>
                      <div className="text-xs text-slate-600">{w.forecast}</div>
                      <div className="text-sm font-bold text-slate-900">{w.morningTemp}° / {w.afternoonTemp}°</div>
                      <div className="text-[10px] text-slate-500 truncate">{w.clothingNotes}</div>
                    </div>
                  ))}
                </div>
              )}

              {slides[currentSlide].type === 'book' && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
                    <strong className="text-amber-900">회중시계 교환의 의미: </strong>
                    {bookActivity.clockExchangeMeaning || '내용 미작성'}
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <strong className="text-slate-900">청소년으로서의 다짐: </strong>
                    {bookActivity.myPromiseToFuture || '내용 미작성'}
                  </div>
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200">
              <span>담양여자중학교 2026. 글로컬 죽향 역사문화탐방</span>
              <span>Slide {currentSlide + 1} of {totalSlides}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Printable PDF Layout */
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-12 shadow-xs border border-slate-200 print:border-none print:p-0 print:shadow-none print:rounded-none">
          
          {/* Official Document Cover Header */}
          <div className="border-b-4 border-slate-900 pb-6 mb-8 text-center space-y-3">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded tracking-widest uppercase">
              2026. 글로컬 죽향 역사문화탐방 공식 워크북
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              중국 상하이 역사·문화 탐방 종합 학습 보고서
            </h1>
            <p className="text-xs text-slate-600">
              일정: 2026년 10월 13일(화) ~ 10월 16일(금) [3박 4일] | 담양여자중학교 3학년
            </p>

            {/* Student Metadata Table */}
            <div className="max-w-xl mx-auto grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-4 border-t border-slate-200">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">소속 학교</span>
                <span className="text-slate-900 font-bold">{currentUser?.school || '담양여자중학교'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">학번</span>
                <span className="text-slate-900 font-bold font-mono">{currentUser?.studentId || '30215'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">성명</span>
                <span className="text-slate-900 font-bold">{currentUser?.name || '이수민'}</span>
              </div>
            </div>
          </div>

          {/* Section 1: 8 Places & Authenticated Stamps */}
          <div className="space-y-8 mb-10">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-800">
              <h2 className="text-lg font-black text-slate-900">
                I. 8대 탐방지 현장 인증 사진 및 교과연계 탐구
              </h2>
              <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded">
                스탬프 {completedStamps} / 8 완료
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLACES_DATA.map((place, index) => {
                const entry = entries[place.id];

                return (
                  <div key={place.id} className="border border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-3 break-inside-avoid">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-slate-500">[{index + 1}]</span>
                        <span>{place.name}</span>
                      </h3>
                      {entry?.stampAcquired ? (
                        <span className="text-[10px] font-black text-red-600 border border-red-500 px-2 py-0.5 rounded bg-red-50">
                          ★ 스탬프 인증완료 ({entry.stampedAt})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">인증 대기</span>
                      )}
                    </div>

                    {/* Authenticated Photo */}
                    <div className="h-40 w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
                      {entry?.photoUrl ? (
                        <img
                          src={entry.photoUrl}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          인증 사진 미등록
                        </div>
                      )}
                    </div>

                    {/* Student Reflection */}
                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      <strong className="text-slate-900 block mb-1">현장 답사 소감:</strong>
                      <p className="whitespace-pre-wrap">{entry?.reflectionText || '(작성된 소감 없음)'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Weather Investigation */}
          <div className="space-y-4 mb-10 break-inside-avoid">
            <h2 className="text-lg font-black text-slate-900 pb-2 border-b-2 border-slate-800">
              II. 일자별 상하이 기후 조사 및 현장 관측 기록
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {weatherRecords.map((w) => (
                <div key={w.day} className="p-3 border border-slate-300 rounded-xl bg-slate-50 text-xs space-y-1">
                  <div className="font-bold text-slate-900">DAY {w.day} ({w.date.split(' ')[1]})</div>
                  <div className="text-slate-600">{w.forecast} | {w.morningTemp}°C ~ {w.afternoonTemp}°C</div>
                  <div className="text-[11px] text-slate-500"><strong>복장:</strong> {w.clothingNotes}</div>
                  <div className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                    <strong>관측:</strong> {w.studentInvestigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Book Activity */}
          <div className="space-y-4 break-inside-avoid">
            <h2 className="text-lg font-black text-slate-900 pb-2 border-b-2 border-slate-800">
              III. &lt;맞바꾼 회중시계&gt; 독서 활동 및 소감문
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">1. 줄거리 및 가장 기억에 남는 장면:</strong>
                <p className="text-slate-700 whitespace-pre-wrap">{bookActivity.readingSummary || '(작성 내용 없음)'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">2. 시계를 맞바꾼 까닭과 한 시간의 의미:</strong>
                <p className="text-slate-700 whitespace-pre-wrap">{bookActivity.clockExchangeMeaning || '(작성 내용 없음)'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">3. 감정이입 글쓰기 (윤봉길 의사 혹은 백범 김구 선생에게):</strong>
                <p className="text-slate-700 whitespace-pre-wrap">{bookActivity.ifIWereHero || '(작성 내용 없음)'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">4. 회중시계가 남긴 유산과 대한민국 청소년으로서의 다짐:</strong>
                <p className="text-slate-700 whitespace-pre-wrap">{bookActivity.myPromiseToFuture || '(작성 내용 없음)'}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Seal */}
          <div className="mt-12 pt-6 border-t border-slate-300 text-center text-xs text-slate-500 space-y-2 break-inside-avoid">
            <p>위와 같이 2026. 글로컬 죽향 역사문화탐방 워크북을 성실히 수행하였음을 확인합니다.</p>
            <p className="font-bold text-slate-800 text-sm">담양여자중학교 지도교사 및 탐방추진단 귀하</p>
          </div>

        </div>
      )}

    </div>
  );
};
