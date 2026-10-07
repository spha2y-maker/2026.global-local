import React, { useState } from 'react';
import { 
  Printer, 
  Presentation, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Download, 
  Award,
  RefreshCw,
  FileDown
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { StudentUser, WorkbookEntry, WeatherRecord, BookActivity, DailyReflection } from '../types';
import { PLACES_DATA } from '../data/travelData';

interface PresentationExportViewProps {
  currentUser: StudentUser | null;
  entries: Record<string, WorkbookEntry>;
  weatherRecords: WeatherRecord[];
  dailyReflections?: DailyReflection[];
  bookActivity?: BookActivity;
}

interface SlideItem {
  title: string;
  subtitle?: string;
  type: 'cover' | 'overview' | 'place' | 'weather' | 'reflection';
  stamps?: string;
  items?: string[];
  place?: any;
  entry?: any;
  records?: any;
  reflections?: any;
}

export const PresentationExportView: React.FC<PresentationExportViewProps> = ({
  currentUser,
  entries,
  weatherRecords,
  dailyReflections = []
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'slideshow'>('preview');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);

  const completedStamps = PLACES_DATA.filter((p) => entries[p.id]?.stampAcquired).length;

  const handlePrint = () => {
    window.print();
  };

  // PPTX File Generator using pptxgenjs
  const handleDownloadPptx = async () => {
    setIsGeneratingPptx(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = `${currentUser?.name || '담양여자중학교 학생'}`;
      pptx.company = '담양여자중학교';
      pptx.title = '2026 글로컬 죽향 역사문화탐방 결과 보고서';

      // 1. Cover Slide
      const slide1 = pptx.addSlide();
      slide1.background = { color: '064E3B' }; // Deep emerald
      slide1.addText('2026. 글로컬 죽향 역사·문화 탐방', {
        x: 0.8, y: 1.1, w: 8.4, h: 0.6,
        fontSize: 20, color: 'A7F3D0', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText('중국 상하이 역사·문화 탐방 결과 보고서', {
        x: 0.8, y: 1.8, w: 8.4, h: 1.0,
        fontSize: 32, color: 'FFFFFF', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText('상하이 8대 명소 현장 스탬프 랠리 & 융합 교과연계 워크북', {
        x: 0.8, y: 2.8, w: 8.4, h: 0.5,
        fontSize: 16, color: 'D1FAE5', fontFace: 'Malgun Gothic'
      });
      
      // Metadata Box
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 3.9, w: 8.4, h: 1.4,
        fill: { color: '047857' }, line: { color: '34D399', width: 1 }
      });
      slide1.addText(`소속: ${currentUser?.school || '담양여자중학교'} 3학년    |    학번: ${currentUser?.studentId || '30215'}    |    성명: ${currentUser?.name || '이수민'}`, {
        x: 1.0, y: 4.15, w: 8.0, h: 0.45,
        fontSize: 15, color: 'FFFFFF', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText(`스탬프 완주: 8대 방문지 중 ${completedStamps}개 완료    |    탐방 기간: 2026. 10. 13 (화) ~ 10. 16 (금)`, {
        x: 1.0, y: 4.65, w: 8.0, h: 0.45,
        fontSize: 13, color: 'E2E8F0', fontFace: 'Malgun Gothic'
      });

      // 2. Overview Slide
      const slide2 = pptx.addSlide();
      slide2.background = { color: 'F8FAFC' };
      slide2.addText('탐방 개요 및 3박 4일 일정', {
        x: 0.8, y: 0.6, w: 8.4, h: 0.6,
        fontSize: 24, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      const daysData = [
        { day: '제1일차 (10.13 화)', desc: '담양 집결 ➔ 인천공항 ➔ 상하이 푸둥 ➔ 남경로 보행가 ➔ 마시청 서커스 & 외탄 야경' },
        { day: '제2일차 (10.14 수)', desc: '루쉰공원(매헌 윤봉길 기념관) ➔ 대한민국임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원' },
        { day: '제3일차 (10.15 목)', desc: '상하이 과학기술관 (첨단 AI·로봇 탐구) ➔ 상하이 디즈니랜드 ➔ 야간 마법의 성 일루미네이션' },
        { day: '제4일차 (10.16 금)', desc: '호텔 체크아웃 ➔ 푸둥공항 출국 ➔ 인천공항 ➔ 담양 귀환 및 해단식' }
      ];
      daysData.forEach((d, i) => {
        slide2.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 1.45 + i * 1.1, w: 8.4, h: 0.95,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        slide2.addText(d.day, {
          x: 1.0, y: 1.55 + i * 1.1, w: 3.5, h: 0.35,
          fontSize: 13, color: '047857', bold: true, fontFace: 'Malgun Gothic'
        });
        slide2.addText(d.desc, {
          x: 1.0, y: 1.95 + i * 1.1, w: 8.0, h: 0.35,
          fontSize: 11, color: '334155', fontFace: 'Malgun Gothic'
        });
      });

      // 3~10. 8 Places Slides
      PLACES_DATA.forEach((place, idx) => {
        const pSlide = pptx.addSlide();
        pSlide.background = { color: 'F8FAFC' };
        const entry = entries[place.id];
        const isStamped = entry?.stampAcquired;

        // Title Row
        pSlide.addText(`${idx + 1}. ${place.name} (${place.chineseName})`, {
          x: 0.8, y: 0.5, w: 6.5, h: 0.5,
          fontSize: 22, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
        });
        pSlide.addText(`${place.dayLabel} | ${place.timeSlot}`, {
          x: 0.8, y: 1.0, w: 6.5, h: 0.35,
          fontSize: 12, color: '64748B', fontFace: 'Malgun Gothic'
        });
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 7.5, y: 0.5, w: 2.0, h: 0.55,
          fill: { color: isStamped ? 'DC2626' : '94A3B8' }
        });
        pSlide.addText(isStamped ? '★ 스탬프 인증완료' : '스탬프 미인증', {
          x: 7.5, y: 0.5, w: 2.0, h: 0.55,
          fontSize: 11, color: 'FFFFFF', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });

        // Left Box: Place Characteristics & Korea Connection
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 1.45, w: 4.1, h: 3.85,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        pSlide.addText('장소 특징 및 탐방 의의', {
          x: 1.0, y: 1.55, w: 3.7, h: 0.3,
          fontSize: 12, color: '047857', bold: true, fontFace: 'Malgun Gothic'
        });
        pSlide.addText(place.features, {
          x: 1.0, y: 1.9, w: 3.7, h: 1.4,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });
        pSlide.addText('대한민국 및 독립운동사 연계', {
          x: 1.0, y: 3.35, w: 3.7, h: 0.3,
          fontSize: 12, color: '0F766E', bold: true, fontFace: 'Malgun Gothic'
        });
        pSlide.addText(place.koreaConnection, {
          x: 1.0, y: 3.7, w: 3.7, h: 1.45,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });

        // Right Box: Curriculum Exploration Questions & Answers
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 5.1, y: 1.45, w: 4.4, h: 3.85,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        pSlide.addText('교과연계 현장 탐구 기록', {
          x: 5.3, y: 1.55, w: 4.0, h: 0.3,
          fontSize: 12, color: '047857', bold: true, fontFace: 'Malgun Gothic'
        });

        let currY = 1.95;
        place.curriculumLinks.forEach((link, cIdx) => {
          const respKey = `${link.subject}_${cIdx}`;
          const answer = entry?.curriculumResponses?.[respKey] || '(작성된 답변 없음)';
          pSlide.addText(`[${link.subject}] ${link.title}`, {
            x: 5.3, y: currY, w: 4.0, h: 0.28,
            fontSize: 10.5, color: '065F46', bold: true, fontFace: 'Malgun Gothic'
          });
          currY += 0.28;
          pSlide.addText(`질문: ${link.guideQuestion}`, {
            x: 5.3, y: currY, w: 4.0, h: 0.35,
            fontSize: 8.5, color: '64748B', fontFace: 'Malgun Gothic'
          });
          currY += 0.35;
          pSlide.addText(`나의 기록: ${answer}`, {
            x: 5.3, y: currY, w: 4.0, h: 0.65,
            fontSize: 9.5, color: '0F172A', fontFace: 'Malgun Gothic'
          });
          currY += 0.72;
        });
      });

      // 11. Weather Slide
      const weatherSlide = pptx.addSlide();
      weatherSlide.background = { color: 'F8FAFC' };
      weatherSlide.addText('상하이 4일간 기후 조사 및 기상 관측 기록', {
        x: 0.8, y: 0.6, w: 8.4, h: 0.6,
        fontSize: 24, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      weatherRecords.forEach((w, i) => {
        const colX = 0.8 + i * 2.15;
        weatherSlide.addShape(pptx.ShapeType.rect, {
          x: colX, y: 1.45, w: 2.0, h: 3.85,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        weatherSlide.addText(`DAY ${w.day}`, {
          x: colX + 0.1, y: 1.6, w: 1.8, h: 0.35,
          fontSize: 14, color: '047857', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(w.date.split(' ')[1] || '', {
          x: colX + 0.1, y: 1.95, w: 1.8, h: 0.25,
          fontSize: 10, color: '64748B', align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(w.forecast, {
          x: colX + 0.1, y: 2.25, w: 1.8, h: 0.3,
          fontSize: 11, color: '0F172A', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(`${w.morningTemp}°C ~ ${w.afternoonTemp}°C`, {
          x: colX + 0.1, y: 2.55, w: 1.8, h: 0.3,
          fontSize: 11, color: '0369A1', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(`복장 안내:\n${w.clothingNotes}`, {
          x: colX + 0.15, y: 2.9, w: 1.7, h: 0.9,
          fontSize: 9, color: '475569', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(`학생 기후 관측:\n${w.studentInvestigation}`, {
          x: colX + 0.15, y: 3.85, w: 1.7, h: 1.3,
          fontSize: 9, color: '334155', fontFace: 'Malgun Gothic'
        });
      });

      // 12. Daily Reflections Slide
      const refSlide = pptx.addSlide();
      refSlide.background = { color: 'F8FAFC' };
      refSlide.addText('3박 4일 일자별 오늘의 성찰일지 (Daily Reflection)', {
        x: 0.8, y: 0.6, w: 8.4, h: 0.6,
        fontSize: 24, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      dailyReflections.slice(0, 4).forEach((r, i) => {
        const rx = 0.8 + (i % 2) * 4.3;
        const ry = 1.45 + Math.floor(i / 2) * 1.95;
        refSlide.addShape(pptx.ShapeType.rect, {
          x: rx, y: ry, w: 4.1, h: 1.8,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        refSlide.addText(`제${r.day}일차 (${r.date.split(' ')[1] || ''})`, {
          x: rx + 0.2, y: ry + 0.1, w: 3.7, h: 0.3,
          fontSize: 12, color: '047857', bold: true, fontFace: 'Malgun Gothic'
        });
        refSlide.addText(`1. 기억에 남는 장면: ${r.memorableScene || '(미작성)'}`, {
          x: rx + 0.2, y: ry + 0.4, w: 3.7, h: 0.4,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });
        refSlide.addText(`2. 크게 느낀 감정: ${r.biggestEmotion || '(미작성)'}`, {
          x: rx + 0.2, y: ry + 0.85, w: 3.7, h: 0.4,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });
        refSlide.addText(`3. 새롭게 알게 된 것: ${r.newlyLearned || '(미작성)'}`, {
          x: rx + 0.2, y: ry + 1.3, w: 3.7, h: 0.4,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });
      });

      // 13. Closing Confirmation Slide
      const closeSlide = pptx.addSlide();
      closeSlide.background = { color: '064E3B' };
      closeSlide.addText('탐방 활동 수료 및 워크북 검인', {
        x: 0.8, y: 1.8, w: 8.4, h: 0.6,
        fontSize: 26, color: 'A7F3D0', bold: true, align: 'center', fontFace: 'Malgun Gothic'
      });
      closeSlide.addText('위와 같이 2026. 글로컬 죽향 역사문화탐방 워크북 활동을 성실히 수행하였음을 확인합니다.', {
        x: 0.8, y: 2.6, w: 8.4, h: 0.5,
        fontSize: 15, color: 'FFFFFF', align: 'center', fontFace: 'Malgun Gothic'
      });
      closeSlide.addText(`담양여자중학교 지도교사 및 탐방추진단 귀하\n발행일: ${new Date().toLocaleDateString('ko-KR')}`, {
        x: 0.8, y: 3.5, w: 8.4, h: 0.8,
        fontSize: 14, color: 'D1FAE5', bold: true, align: 'center', fontFace: 'Malgun Gothic'
      });

      const studentSafeId = currentUser?.studentId || '30215';
      const studentSafeName = currentUser?.name || '이수민';
      const fileName = `2026_상하이_역사문화탐방_결과보고서_${studentSafeId}_${studentSafeName}.pptx`;
      await pptx.writeFile({ fileName });
    } catch (err) {
      console.error('PPTX generation error:', err);
      alert('PPTX 파일 다운로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  // Slides configuration for In-App Presentation Mode
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
        '제1일차 (10.13): 담양여중 출정 ➔ 인천공항 ➔ 상하이 푸둥공항 ➔ 남경로 보행가 ➔ 마시청 서커스 관람 & 외탄 야경',
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
      title: '3박 4일 일자별 오늘의 성찰일지',
      type: 'reflection',
      reflections: dailyReflections
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
              작성한 모든 답사 기록, 인증 사진, 스탬프, 교과 탐구, 기후 조사, 성찰일지가 집약된 공식 보고서입니다. 
              PDF 파일로 인쇄하거나 <strong>PPTX(파워포인트) 파일로 다운로드</strong>하여 교실에서 직접 발표할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'preview' ? 'slideshow' : 'preview')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <Presentation className="w-4 h-4 text-emerald-600" />
              <span>{viewMode === 'preview' ? '슬라이드 발표 모드' : '인쇄용 문서 뷰'}</span>
            </button>

            {/* PPTX Download Button */}
            <button
              onClick={handleDownloadPptx}
              disabled={isGeneratingPptx}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs disabled:opacity-60"
              title="파워포인트(.pptx) 파일로 다운로드합니다."
            >
              {isGeneratingPptx ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>PPTX 생성 중...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>PPTX 파일 다운로드</span>
                </>
              )}
            </button>

            {/* PDF Print Button */}
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

      {/* Mode 1: Interactive In-App Slideshow */}
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

          <div className="min-h-[460px] flex flex-col justify-between bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {slides[currentSlide].type.toUpperCase()}
                </span>
                {slides[currentSlide].stamps && (
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                    {slides[currentSlide].stamps}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                {slides[currentSlide].title}
              </h2>
              {slides[currentSlide].subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 mb-6">{slides[currentSlide].subtitle}</p>
              )}

              {slides[currentSlide].type === 'cover' && (
                <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="text-emerald-800 font-bold text-base">🎋 담양여자중학교 3학년 글로컬 역사문화체험</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    선열들의 숭고한 자주독립 투혼을 기리고, 세계적 메트로폴리스 상하이의 미래 스마트 과학·도시 문화를 체험하며 담양의 대나무처럼 곧고 바른 세계 시민으로 성장하는 배움의 기록입니다.
                  </p>
                </div>
              )}

              {slides[currentSlide].type === 'overview' && (
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {slides[currentSlide].items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-center gap-3 shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {slides[currentSlide].type === 'place' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-2">
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
                      <strong className="text-emerald-700 block mb-1">우리나라와의 역사적 관련성</strong>
                      <p className="text-xs text-slate-600 leading-relaxed">{slides[currentSlide].place.koreaConnection}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <strong className="text-emerald-800 block mb-1.5">교과연계 현장 탐구 기록</strong>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {slides[currentSlide].place.curriculumLinks.map((link: any, cIdx: number) => {
                          const respKey = `${link.subject}_${cIdx}`;
                          const ans = slides[currentSlide].entry?.curriculumResponses?.[respKey] || '';
                          return (
                            <div key={cIdx} className="text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                              <span className="font-bold text-emerald-800 block">[{link.subject}] {link.title}</span>
                              <span className="text-slate-700 mt-0.5 block">{ans || '(답변 작성 전)'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slides[currentSlide].type === 'weather' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
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

              {slides[currentSlide].type === 'reflection' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-4">
                  {dailyReflections.map((ref) => (
                    <div key={ref.day} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          제{ref.day}일차 ({ref.date})
                        </span>
                      </div>
                      <div>
                        <strong className="text-slate-900 block text-[11px]">기억에 남는 장면:</strong>
                        <p className="text-slate-600 line-clamp-2">{ref.memorableScene || '내용 미작성'}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900 block text-[11px]">가장 크게 느낀 감정:</strong>
                        <p className="text-slate-600 line-clamp-2">{ref.biggestEmotion || '내용 미작성'}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900 block text-[11px]">새롭게 알게 된 것:</strong>
                        <p className="text-slate-600 line-clamp-2">{ref.newlyLearned || '내용 미작성'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200 mt-6">
              <span>담양여자중학교 2026. 글로컬 죽향 역사문화탐방</span>
              <span>Slide {currentSlide + 1} of {totalSlides}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Printable Document View (for PDF export & browser printing) */
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
                          ★ 스탬프 인증완료 ({entry.stampedAt || '현장 인증'})
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

                    {/* Curriculum Responses */}
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <strong className="text-slate-900 block text-[11px]">교과연계 현장 탐구 기록:</strong>
                      {place.curriculumLinks.map((link, cIdx) => {
                        const ansKey = `${link.subject}_${cIdx}`;
                        const ans = entry?.curriculumResponses?.[ansKey] || '';
                        return (
                          <div key={cIdx} className="text-[11px] leading-relaxed pt-1 border-t border-slate-100 first:border-t-0 first:pt-0">
                            <span className="font-bold text-emerald-800">[{link.subject}] {link.title}: </span>
                            <span className="text-slate-700">{ans || '(답변 미작성)'}</span>
                          </div>
                        );
                      })}
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

          {/* Section 3: Daily Reflection Journal */}
          <div className="space-y-4 mb-10 break-inside-avoid">
            <h2 className="text-lg font-black text-slate-900 pb-2 border-b-2 border-slate-800">
              III. 3박 4일 일자별 오늘의 성찰일지 (Daily Reflection)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {dailyReflections.map((r) => (
                <div key={r.day} className="p-4 border border-slate-300 rounded-xl bg-slate-50/70 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-mono text-emerald-800">제{r.day}일차 ({r.date})</span>
                  </div>
                  <div>
                    <strong className="text-slate-800 block text-[11px]">1. 기억에 남는 장면이나 사건:</strong>
                    <p className="text-slate-600 whitespace-pre-wrap">{r.memorableScene || '(내용 미작성)'}</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 block text-[11px]">2. 가장 크게 느낀 생각이나 감정:</strong>
                    <p className="text-slate-600 whitespace-pre-wrap">{r.biggestEmotion || '(내용 미작성)'}</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 block text-[11px]">3. 새롭게 알게 된 것:</strong>
                    <p className="text-slate-600 whitespace-pre-wrap">{r.newlyLearned || '(내용 미작성)'}</p>
                  </div>
                </div>
              ))}
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
