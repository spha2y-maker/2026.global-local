import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Presentation, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Award,
  RefreshCw,
  FileDown,
  Maximize2,
  Calendar,
  MapPin,
  Compass,
  BookOpen,
  CloudSun,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle
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

export const PresentationExportView: React.FC<PresentationExportViewProps> = ({
  currentUser,
  entries,
  weatherRecords,
  dailyReflections = [],
  bookActivity
}) => {
  const [viewMode, setViewMode] = useState<'slides' | 'slideshow'>('slides');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);
  const [showPrintTips, setShowPrintTips] = useState(true);

  const studentName = currentUser?.name || '이수민';
  const studentId = currentUser?.studentId || '30215';
  const studentSchool = currentUser?.school || '담양여자중학교';

  const completedStamps = PLACES_DATA.filter((p) => entries[p.id]?.stampAcquired).length;
  const totalStamps = PLACES_DATA.length;

  const handlePrint = () => {
    window.print();
  };

  // Keyboard navigation for interactive slideshow mode
  useEffect(() => {
    if (viewMode !== 'slideshow') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((c) => Math.min(13, c + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((c) => Math.max(0, c - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  // Comprehensive PPTX File Generator (14 Slides)
  const handleDownloadPptx = async () => {
    setIsGeneratingPptx(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = `${studentName} (${studentId})`;
      pptx.company = studentSchool;
      pptx.title = '2026 글로컬 죽향 역사문화탐방 상하이 발표 보고서';

      // 1. Cover Slide
      const slide1 = pptx.addSlide();
      slide1.background = { color: '064E3B' }; // Deep emerald
      slide1.addText('2026. 글로컬 죽향 역사·문화 탐방', {
        x: 0.8, y: 1.1, w: 8.4, h: 0.6,
        fontSize: 18, color: 'A7F3D0', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText('중국 상하이 역사·문화 탐방 결과 발표 보고서', {
        x: 0.8, y: 1.8, w: 8.4, h: 1.0,
        fontSize: 30, color: 'FFFFFF', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText('8대 명소 현장 스탬프 랠리 · 융합 교과연계 탐구 · 3박 4일 성찰일지', {
        x: 0.8, y: 2.8, w: 8.4, h: 0.5,
        fontSize: 15, color: 'D1FAE5', fontFace: 'Malgun Gothic'
      });
      
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 3.8, w: 8.4, h: 1.5,
        fill: { color: '047857' }, line: { color: '34D399', width: 1 }
      });
      slide1.addText(`소속: ${studentSchool} 3학년    |    학번: ${studentId}    |    성명: ${studentName}`, {
        x: 1.0, y: 4.05, w: 8.0, h: 0.45,
        fontSize: 15, color: 'FFFFFF', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText(`스탬프 완주: 8대 방문지 중 ${completedStamps}개 완료    |    탐방 기간: 2026. 10. 13 (화) ~ 10. 16 (금)`, {
        x: 1.0, y: 4.55, w: 8.0, h: 0.45,
        fontSize: 13, color: 'E2E8F0', fontFace: 'Malgun Gothic'
      });

      // 2. Overview Slide
      const slide2 = pptx.addSlide();
      slide2.background = { color: 'F8FAFC' };
      slide2.addText('탐방 개요 및 3박 4일 주요 여정 타임라인', {
        x: 0.8, y: 0.6, w: 8.4, h: 0.6,
        fontSize: 24, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      const daysData = [
        { day: '제1일차 (10.13 화)', desc: '담양 집결 ➔ 인천공항 ➔ 상하이 푸둥 ➔ 남경로 보행가 ➔ 마시청 서커스 & 외탄 야경' },
        { day: '제2일차 (10.14 수)', desc: '루쉰공원(매헌 윤봉길 기념관) ➔ 상하이 대한민국 임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원' },
        { day: '제3일차 (10.15 목)', desc: '상하이 과학기술관 (첨단 AI·로봇 탐구) ➔ 상하이 디즈니랜드 역사문화 테마파크 ➔ 야간 일루미네이션' },
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

        pSlide.addText(`${idx + 1}. ${place.name} (${place.chineseName})`, {
          x: 0.8, y: 0.5, w: 6.5, h: 0.5,
          fontSize: 22, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
        });
        pSlide.addText(`${place.dayLabel} | ${place.timeSlot} | ${place.location}`, {
          x: 0.8, y: 1.0, w: 6.5, h: 0.35,
          fontSize: 11, color: '64748B', fontFace: 'Malgun Gothic'
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
          x: 1.0, y: 1.88, w: 3.7, h: 1.25,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });
        pSlide.addText('대한민국 및 독립운동사 연계', {
          x: 1.0, y: 3.2, w: 3.7, h: 0.3,
          fontSize: 12, color: '0F766E', bold: true, fontFace: 'Malgun Gothic'
        });
        pSlide.addText(place.koreaConnection, {
          x: 1.0, y: 3.52, w: 3.7, h: 1.2,
          fontSize: 9.5, color: '334155', fontFace: 'Malgun Gothic'
        });
        if (entry?.reflectionText) {
          pSlide.addText(`한줄 소감: ${entry.reflectionText}`, {
            x: 1.0, y: 4.8, w: 3.7, h: 0.45,
            fontSize: 9, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
          });
        }

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

      // 13. Book Activity Slide
      const bookSlide = pptx.addSlide();
      bookSlide.background = { color: 'F8FAFC' };
      bookSlide.addText('역사 융합 독서 활동: 백범일지와 청년 의사의 혼', {
        x: 0.8, y: 0.6, w: 8.4, h: 0.6,
        fontSize: 24, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      const bookSections = [
        { label: '도서 핵심 내용 및 독서 요약', val: bookActivity?.readingSummary || '(작성 내용 없음)' },
        { label: '김구·윤봉길 회중시계 교환의 상징적 의미', val: bookActivity?.clockExchangeMeaning || '(작성 내용 없음)' },
        { label: '내가 만약 그 시대의 청년 영웅이었다면', val: bookActivity?.ifIWereHero || '(작성 내용 없음)' },
        { label: '미래의 나에게 보내는 약속과 다짐', val: bookActivity?.myPromiseToFuture || '(작성 내용 없음)' }
      ];
      bookSections.forEach((b, i) => {
        const bx = 0.8 + (i % 2) * 4.3;
        const by = 1.45 + Math.floor(i / 2) * 1.95;
        bookSlide.addShape(pptx.ShapeType.rect, {
          x: bx, y: by, w: 4.1, h: 1.8,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        bookSlide.addText(b.label, {
          x: bx + 0.2, y: by + 0.15, w: 3.7, h: 0.35,
          fontSize: 12, color: '047857', bold: true, fontFace: 'Malgun Gothic'
        });
        bookSlide.addText(b.val, {
          x: bx + 0.2, y: by + 0.55, w: 3.7, h: 1.15,
          fontSize: 10, color: '334155', fontFace: 'Malgun Gothic'
        });
      });

      // 14. Closing Confirmation Slide
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
      closeSlide.addText(`${studentSchool} 지도교사 및 탐방추진단 귀하\n발행일: ${new Date().toLocaleDateString('ko-KR')}`, {
        x: 0.8, y: 3.5, w: 8.4, h: 0.8,
        fontSize: 14, color: 'D1FAE5', bold: true, align: 'center', fontFace: 'Malgun Gothic'
      });

      const fileName = `2026_상하이_역사문화탐방_발표보고서_${studentId}_${studentName}.pptx`;
      await pptx.writeFile({ fileName });
    } catch (err) {
      console.error('PPTX generation error:', err);
      alert('PPTX 파일 다운로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  // Render Individual Slide Content by Slide Index (0 ~ 13)
  const renderSlideContent = (index: number) => {
    // Slide 1: Cover
    if (index === 0) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white rounded-2xl relative overflow-hidden">
          {/* Subtle bamboo motif watermarks */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">🎋</div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Kicker */}
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-200">
                2026. 글로컬 죽향 역사·문화 탐방
              </span>
            </div>
            <span className="text-xs text-emerald-300 font-mono">
              OFFICIAL PRESENTATION DECK
            </span>
          </div>

          {/* Main Title Block */}
          <div className="my-auto space-y-4 max-w-4xl">
            <span className="inline-block text-emerald-300 text-xs sm:text-sm font-bold tracking-widest uppercase">
              SHANGHAI HISTORICAL & CULTURAL WORKBOOK REPORT
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              중국 상하이 역사·문화 탐방<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                종합 결과 발표 보고서
              </span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              상하이 8대 역사문화 명소 현장 스탬프 랠리, 교과연계 현장 융합 탐구, 기후 조사 및 3박 4일 일자별 성찰일지
            </p>
          </div>

          {/* Presenter Footer Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <div>
              <span className="text-[11px] text-emerald-300 block">소속 학교</span>
              <span className="text-sm font-bold text-white">{studentSchool}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-300 block">학번 및 성명</span>
              <span className="text-sm font-bold text-white">{studentId} {studentName}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-300 block">8대 스탬프 완주</span>
              <span className="text-sm font-bold text-amber-300">{completedStamps} / {totalStamps} 완료 ({Math.round(completedStamps / totalStamps * 100)}%)</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-300 block">탐방 일정</span>
              <span className="text-sm font-bold text-white">2026. 10. 13 ~ 10. 16</span>
            </div>
          </div>
        </div>
      );
    }

    // Slide 2: Overview & Timeline
    if (index === 1) {
      const days = [
        { 
          day: 'DAY 1', 
          date: '10.13 (화)', 
          theme: '출정 및 상하이 도심 탐방', 
          places: '담양여중 집결 ➔ 인천공항 ➔ 상하이 푸둥 ➔ 남경로 보행가 ➔ 마시청 서커스 & 외탄 야경',
          curriculum: '역사(개항과 비밀접선), 사회(글로벌 상업), 미술(조명예술)'
        },
        { 
          day: 'DAY 2', 
          date: '10.14 (수)', 
          theme: '독립운동의 숨결과 현대 상하이', 
          places: '루쉰공원(매헌 윤봉길 기념관) ➔ 상하이 대한민국 임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원',
          curriculum: '도덕(숭고한 희생과 애국심), 역사(임시정부 수난사), 과학(초고층건축공학)'
        },
        { 
          day: 'DAY 3', 
          date: '10.15 (목)', 
          theme: '미래 과학과 문화 콘텐츠', 
          places: '상하이 과학기술관 (첨단 AI·로봇 탐구) ➔ 상하이 디즈니랜드 역사문화 테마파크 ➔ 야간 일루미네이션',
          curriculum: '과학·기술(미래 로봇공학), 음악·미술(스토리텔링과 시각예술)'
        },
        { 
          day: 'DAY 4', 
          date: '10.16 (금)', 
          theme: '귀환 및 성장 나눔', 
          places: '호텔 체크아웃 ➔ 푸둥공항 출국 ➔ 인천국제공항 ➔ 담양 귀환 및 해단식',
          curriculum: '국어(성찰일지 종합), 진로(글로컬 인재로서의 나의 꿈 설계)'
        }
      ];

      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-900 text-white rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-emerald-400 font-mono font-bold tracking-wider">SLIDE 02 · TRIP OVERVIEW</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">탐방 개요 및 3박 4일 주요 여정 타임라인</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
            {days.map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                    {d.day} · {d.date}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{d.theme}</span>
                </div>
                <div className="text-sm font-bold text-slate-100 leading-snug">{d.places}</div>
                <div className="text-xs text-emerald-400/90 pt-1 border-t border-slate-700/50">
                  <span className="font-semibold text-slate-400">연계 교과:</span> {d.curriculum}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
            <span>🎋 <strong>탐방 핵심 목표:</strong> 독립운동 선열의 자주정신 계승 · 첨단 글로벌 과학문화 체득 · 죽향 담양을 빛낼 세계시민 역량 함양</span>
            <span className="text-[11px] text-slate-400 font-mono">담양여자중학교</span>
          </div>
        </div>
      );
    }

    // Slides 3 ~ 10: 8 Places Slides
    if (index >= 2 && index <= 9) {
      const placeIdx = index - 2;
      const place = PLACES_DATA[placeIdx];
      const entry = entries[place.id];
      const isStamped = entry?.stampAcquired;

      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-900 text-white rounded-2xl relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  SLIDE 0{index + 1} · SPOT 0{placeIdx + 1}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs text-slate-300 font-medium">
                  {place.dayLabel} ({place.timeSlot})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                <span>{placeIdx + 1}. {place.name}</span>
                <span className="text-sm font-normal text-slate-400">({place.chineseName})</span>
              </h2>
            </div>

            {/* Official Stamp Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isStamped 
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {isStamped ? (
                <>
                  <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="text-right">
                    <span className="text-xs font-bold block leading-none">★ 스탬프 완주 직인</span>
                    <span className="text-[10px] text-rose-400 font-mono">{entry.stampedAt || '현장 인증 완료'}</span>
                  </div>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium">현장 인증 대기</span>
                </>
              )}
            </div>
          </div>

          {/* Body Content (Two Column Layout for High Legibility) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-auto">
            {/* Left Column (5 Cols): Photo + Place Significance + Korea Connection */}
            <div className="md:col-span-5 space-y-3">
              {/* Photo Box */}
              <div className="relative h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-md">
                <img
                  src={entry?.photoUrl || place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                  <span className="truncate">{entry?.photoUrl ? '📸 학생 본인 촬영 현장 인증 사진' : '🏛️ 탐방지 대표 전경'}</span>
                  <span className="text-emerald-300 font-mono shrink-0">{place.location}</span>
                </div>
              </div>

              {/* Historical & Place Essence */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <div>
                  <strong className="text-emerald-400 block text-[11px] mb-0.5">장소 의의 및 탐방 특징</strong>
                  <p className="text-slate-300 line-clamp-3 leading-relaxed">{place.features}</p>
                </div>
                <div className="pt-2 border-t border-slate-700/60">
                  <strong className="text-teal-300 block text-[11px] mb-0.5">우리나라 독립운동사 연계성</strong>
                  <p className="text-slate-300 line-clamp-3 leading-relaxed">{place.koreaConnection}</p>
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Curriculum Responses & Student Notes */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    교과연계 현장 융합 탐구 활동 기록
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {place.curriculumLinks.length}개 교과 연계
                  </span>
                </div>

                {place.curriculumLinks.map((link, cIdx) => {
                  const respKey = `${link.subject}_${cIdx}`;
                  const ans = entry?.curriculumResponses?.[respKey] || '';
                  return (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">
                          [{link.subject}] {link.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Q. {link.guideQuestion}
                      </p>
                      <div className="mt-1 p-2 rounded bg-slate-900/90 border border-slate-700 text-xs text-white font-medium leading-relaxed">
                        A. {ans || '(학생 작성 내용 없음)'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Student Personal Field Reflection */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
                <span className="font-bold text-emerald-300 block text-[11px] mb-0.5">
                  ✍️ {studentName} 학생의 현장 한줄 총평 및 느낀 점
                </span>
                <p className="text-slate-200 italic leading-relaxed">
                  "{entry?.reflectionText?.trim() || `${place.name}을(를) 직접 답사하며 책으로만 보던 역사의 현장을 피부로 느끼고, 선열들의 고귀한 희생과 상하이의 눈부신 발전을 함께 배울 수 있었습니다.`}"
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>{studentSchool} 2026. 글로컬 죽향 역사문화탐방 발표 자료</span>
            <span className="font-mono text-emerald-400">Slide {index + 1} / 14</span>
          </div>
        </div>
      );
    }

    // Slide 11: Weather & Climate Investigation
    if (index === 10) {
      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-900 text-white rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-emerald-400 font-mono font-bold tracking-wider">SLIDE 11 · CLIMATE & METEOROLOGY</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">상하이 4일간 기후 조사 및 현장 기상 관측 결과</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto">
            {weatherRecords.map((w) => (
              <div key={w.day} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-3">
                <div className="border-b border-slate-700/60 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-emerald-400">DAY {w.day}</span>
                    <span className="text-[11px] text-slate-400">{w.date.split(' ')[1] || ''}</span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">{w.forecast}</div>
                  <div className="text-sm font-bold text-sky-400 mt-0.5">{w.morningTemp}°C ~ {w.afternoonTemp}°C</div>
                </div>

                <div className="text-xs text-slate-300 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">현장 추천 복장</span>
                    <p className="line-clamp-2">{w.clothingNotes}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-[10px] text-emerald-300 block font-semibold">학생 기후 관측 기록</span>
                    <p className="text-white font-medium line-clamp-3 leading-relaxed">
                      {w.studentInvestigation || '(현장 관측 내용 작성 전)'}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/40 text-center">
                  상하이시 황푸구 기상 관측
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>🌏 <strong>기후 비교 분석:</strong> 가을철(10월) 상하이는 아열대 계절풍 기후의 영향으로 담양(온대 기후) 대비 평균 기온이 약 3~4°C 높고 습도가 온화하여 탐방 활동에 매우 쾌적했습니다.</span>
            <span className="text-[11px] font-mono text-emerald-400 shrink-0">Slide 11 / 14</span>
          </div>
        </div>
      );
    }

    // Slide 12: Daily Reflections
    if (index === 11) {
      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-900 text-white rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-emerald-400 font-mono font-bold tracking-wider">SLIDE 12 · DAILY REFLECTIONS</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">3박 4일 일자별 오늘의 성찰일지 (Daily Reflection)</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {dailyReflections.slice(0, 4).map((r) => (
              <div key={r.day} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    제{r.day}일차 ({r.date})
                  </span>
                  <span className="text-[11px] text-slate-400">오늘의 나 돌아보기</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[11px] text-emerald-300 font-semibold block">1. 가장 기억에 남는 장면이나 사건:</span>
                    <p className="text-slate-200 leading-snug line-clamp-2">
                      {r.memorableScene || '(성찰일지 내용 미작성)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-teal-300 font-semibold block">2. 가장 크게 느낀 생각이나 감정:</span>
                    <p className="text-slate-200 leading-snug line-clamp-2">
                      {r.biggestEmotion || '(성찰일지 내용 미작성)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-300 font-semibold block">3. 새롭게 알게 된 것과 배운 점:</span>
                    <p className="text-slate-200 leading-snug line-clamp-2">
                      {r.newlyLearned || '(성찰일지 내용 미작성)'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
            <span>📖 <strong>성찰의 의의:</strong> 매일 저녁 작성한 일지는 단순한 여정 기록을 넘어, 낯선 환경 속에서 자신의 생각과 가치관을 심도 있게 정립하는 소중한 자산이 되었습니다.</span>
            <span className="text-[11px] font-mono text-emerald-400 shrink-0">Slide 12 / 14</span>
          </div>
        </div>
      );
    }

    // Slide 13: Integrated Reading Activity
    if (index === 12) {
      const readingCards = [
        {
          label: '1. 도서 핵심 내용 및 독서 요약',
          sub: '백범일지 및 청년 의사들의 독립 투쟁사',
          text: bookActivity?.readingSummary || '김구 선생의 백범일지와 상하이 임시정부를 중심으로 조국의 독립을 위해 헌신한 한인애국단과 청년 의사들의 숭고한 결의를 읽고 시대적 배경을 탐구하였습니다.'
        },
        {
          label: '2. 김구·윤봉길 회중시계 교환의 상징적 의미',
          sub: '6원짜리 시계와 2원짜리 시계에 담긴 맹세',
          text: bookActivity?.clockExchangeMeaning || '윤봉길 의사가 거사 직전 자신의 새 시계와 김구 선생의 낡은 시계를 바꾸며 남긴 말은, 죽음을 앞두고도 오직 조국의 광복만을 생각했던 두 분의 굳은 신뢰와 영원한 독립의 맹세를 상징합니다.'
        },
        {
          label: '3. 내가 만약 그 시대의 청년 영웅이었다면',
          sub: '역사 속 주체로서의 나의 양심과 결단',
          text: bookActivity?.ifIWereHero || '만약 내가 일제강점기 그 엄혹한 시대를 살아갔다면, 나 자신의 안위보다는 억압받는 민족의 고통에 공감하고 당당하게 독립운동의 뜻에 동참하며 정의로운 길을 선택했을 것입니다.'
        },
        {
          label: '4. 미래의 나에게 보내는 약속과 다짐',
          sub: '담양의 대나무처럼 곧고 바른 세계시민으로',
          text: bookActivity?.myPromiseToFuture || '선열들이 피땀으로 지켜낸 평화로운 대한민국에서 살아가는 오늘, 나 역시 배움을 게을리하지 않고 담양의 푸른 대나무처럼 곧은 지조와 넓은 세계관을 가진 인재로 성장할 것을 다짐합니다.'
        }
      ];

      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-900 text-white rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-emerald-400 font-mono font-bold tracking-wider">SLIDE 13 · INTEGRATED READING</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">역사 융합 독서 활동: 백범일지와 청년 의사의 혼</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {readingCards.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">{c.label}</span>
                  <span className="text-[10px] text-slate-400 block">{c.sub}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed line-clamp-4">
                  {c.text}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>⏳ <strong>역사 독서 연계:</strong> 루쉰공원 매헌기념관 답사와 백범일지 독서 활동을 융합하여 역사적 사실에 대한 깊은 공감과 주도적 역사관을 함양했습니다.</span>
            <span className="text-[11px] font-mono text-emerald-400 shrink-0">Slide 13 / 14</span>
          </div>
        </div>
      );
    }

    // Slide 14: Certificate & Conclusion
    if (index === 13) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 text-white rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <span className="text-xs text-emerald-300 font-mono font-bold">SLIDE 14 · COMPLETION & CERTIFICATION</span>
            <span className="text-xs text-slate-400 font-mono">DY-2026-GLOCAL-{studentId}</span>
          </div>

          {/* Certificate Container */}
          <div className="my-auto max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-white/5 border-2 border-emerald-500/40 backdrop-blur-md text-center space-y-4">
            <div className="inline-block p-3 rounded-full bg-emerald-500/20 text-emerald-300 mb-1">
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-200 tracking-tight">
              탐방 활동 종합 수료 확인서
            </h2>

            <div className="max-w-xl mx-auto text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <p>
                위 학생은 전라남도 담양교육지원청 및 담양여자중학교에서 주관한 
                <strong>「2026. 글로컬 죽향 역사문화탐방」</strong> 프로그램에 참여하여 
                상하이 8대 역사문화 명소 답사, 교과연계 현장 융합 탐구, 기상 관측 및 성찰일지 전 과정을 
                성실히 완수하였음을 확인합니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-3 border-t border-white/10 text-xs">
              <div className="p-2 rounded bg-white/5">
                <span className="text-[10px] text-emerald-300 block">소속</span>
                <span className="font-bold text-white">{studentSchool}</span>
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-[10px] text-emerald-300 block">성명 (학번)</span>
                <span className="font-bold text-white">{studentName} ({studentId})</span>
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-[10px] text-emerald-300 block">스탬프 달성</span>
                <span className="font-bold text-amber-300">{completedStamps} / 8 완료</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-emerald-200 font-serif">
              2026년 10월 16일<br />
              <strong className="text-sm text-white">담양여자중학교 지도교사 및 탐방추진단 귀하</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-400/80 pt-2 border-t border-emerald-500/20 font-mono">
            <span>2026. GLOCAL JUKHYANG HISTORICAL & CULTURAL EXPEDITION</span>
            <span>END OF PRESENTATION DECK</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const totalSlides = 14;

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Action Header (Hidden in Print) */}
      <div className="print:hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <Presentation className="w-3.5 h-3.5 text-emerald-600" />
              <span>16:9 와이드 PPT 화면 규격 지원</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              발표용 PPT 슬라이드 & PDF 변환 출력
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              학생이 작성한 8대 명소 답사 사진과 기록, 교과연계 탐구, 기후 관측, 성찰일지가 
              <strong> 16:9 와이드 프레젠테이션 슬라이드 화면 구조</strong>로 자동 배치됩니다. 
              교실에서 화면에 띄워 직접 발표하거나, 고화질 PDF 및 파워포인트(PPTX) 파일로 출력할 수 있습니다.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {/* View Mode Toggle */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('slides')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  viewMode === 'slides' 
                    ? 'bg-white text-emerald-800 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>전체 슬라이드 뷰 (인쇄용)</span>
              </button>
              <button
                onClick={() => setViewMode('slideshow')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  viewMode === 'slideshow' 
                    ? 'bg-white text-emerald-800 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                <span>슬라이드쇼 발표 모드</span>
              </button>
            </div>

            {/* PPTX Download */}
            <button
              onClick={handleDownloadPptx}
              disabled={isGeneratingPptx}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs disabled:opacity-60"
              title="14장의 슬라이드로 구성된 파워포인트(.pptx) 파일로 다운로드합니다."
            >
              {isGeneratingPptx ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>PPTX 생성 중...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>PPTX 다운로드</span>
                </>
              )}
            </button>

            {/* Print / Save as PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>PDF 저장 / 인쇄하기</span>
            </button>
          </div>
        </div>

        {/* Print Guidance Note */}
        {showPrintTips && (
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>💡 PDF 인쇄 안내:</strong> 인쇄 창에서 대상 프린터를 <strong>'PDF로 저장'</strong>으로 선택하고, 
                용지 방향을 <strong>'가로(Landscape)'</strong>, 설정의 <strong>'배경 그래픽 포함'</strong>을 체크하시면 슬라이드당 1장씩 깔끔한 16:9 발표용 슬라이드 PDF가 생성됩니다.
              </span>
            </div>
            <button 
              onClick={() => setShowPrintTips(false)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold shrink-0 ml-2"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* Mode 1: Interactive In-App Fullscreen Slideshow (Hidden in Print) */}
      {viewMode === 'slideshow' ? (
        <div className="print:hidden space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <div className="flex items-center gap-2 font-mono text-emerald-800 font-bold">
              <span>SLIDE {currentSlideIndex + 1} OF {totalSlides}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-sans">키보드 방향키(◀, ▶) 또는 스페이스바로 슬라이드를 넘길 수 있습니다.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((c) => Math.max(0, c - 1))}
                className="p-2 rounded-xl bg-white disabled:opacity-30 hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentSlideIndex === totalSlides - 1}
                onClick={() => setCurrentSlideIndex((c) => Math.min(totalSlides - 1, c + 1))}
                className="p-2 rounded-xl bg-white disabled:opacity-30 hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Slide Frame (16:9 ratio) */}
          <div className="w-full max-w-6xl mx-auto aspect-[16/9] min-h-[520px] rounded-2xl shadow-xl overflow-hidden border border-slate-800">
            {renderSlideContent(currentSlideIndex)}
          </div>
        </div>
      ) : (
        /* Mode 2: Presentation Slides Sequential View (for Screen viewing & 100% Exact PDF Printing) */
        <div className="space-y-8">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div 
              key={idx} 
              className="ppt-slide-page w-full max-w-6xl mx-auto aspect-[16/9] min-h-[480px] sm:min-h-[580px] rounded-2xl shadow-md border border-slate-800 overflow-hidden break-inside-avoid"
            >
              {renderSlideContent(idx)}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
