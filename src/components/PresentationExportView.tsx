import React, { useState, useEffect, useRef } from 'react';
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
  Minimize2, 
  Calendar, 
  MapPin, 
  BookOpen, 
  CloudSun, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  CheckCircle2,
  HelpCircle, 
  Download,
  School,
  Clock,
  Compass,
  User
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { StudentUser, WorkbookEntry, WeatherRecord, BookActivity, DailyReflection } from '../types';
import { PLACES_DATA, INITIAL_WEATHER_RECORDS, INITIAL_DAILY_REFLECTIONS } from '../data/travelData';

export const SLIDE_INFO = [
  { index: 0, title: '표지: 상하이 역사문화탐방 종합 발표 보고서', short: '1. 표지' },
  { index: 1, title: '탐방 개요 및 3박 4일 일정 타임라인', short: '2. 일정 개요' },
  { index: 2, title: '1. 남경로 (난징둥루)', short: '3. 남경로' },
  { index: 3, title: '2. 외탄 (와이탄 야경)', short: '4. 외탄' },
  { index: 4, title: '3. 루쉰공원 (매헌 윤봉길 기념관)', short: '5. 루쉰공원' },
  { index: 5, title: '4. 상하이 대한민국 임시정부청사', short: '6. 임시정부' },
  { index: 6, title: '5. 주상하이 대한민국 총영사관', short: '7. 총영사관' },
  { index: 7, title: '6. 동방명주 & 황푸강 유람선', short: '8. 동방명주' },
  { index: 8, title: '7. 예원 (위위안)', short: '9. 예원' },
  { index: 9, title: '8. 상하이 과학기술관', short: '10. 과학기술관' },
  { index: 10, title: '상하이 4일간 기후 조사 및 기상 관측', short: '11. 기후 관측' },
  { index: 11, title: '3박 4일 일자별 오늘의 성찰일지', short: '12. 성찰일지' },
  { index: 12, title: '역사 융합 독서 활동 (백범일지)', short: '13. 독서 활동' },
  { index: 13, title: '탐방 활동 종합 수료 확인서', short: '14. 수료 확인서' },
];

interface PresentationExportViewProps {
  currentUser: StudentUser | null;
  entries: Record<string, WorkbookEntry>;
  weatherRecords: WeatherRecord[];
  dailyReflections?: DailyReflection[];
  bookActivity?: BookActivity;
}

export const PresentationExportView: React.FC<PresentationExportViewProps> = ({
  currentUser,
  entries = {},
  weatherRecords = [],
  dailyReflections = [],
  bookActivity
}) => {
  // 'workbook' = A4 Portrait printable report with clean bright white background
  // 'slideshow' = 16:9 widescreen A4 Landscape presentation deck
  const [viewMode, setViewMode] = useState<'workbook' | 'slideshow'>('workbook');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPrintTips, setShowPrintTips] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideshowContainerRef = useRef<HTMLDivElement>(null);

  // Safe data fallbacks so ANY student's submission renders completely and error-free
  const studentName = currentUser?.name?.trim() || '이수민';
  const studentId = currentUser?.studentId?.trim() || '30215';
  const studentSchool = currentUser?.school?.trim() || '담양여자중학교';

  const safeEntries: Record<string, WorkbookEntry> = entries || {};
  const safeWeatherRecords: WeatherRecord[] = 
    (weatherRecords && weatherRecords.length > 0) ? weatherRecords : INITIAL_WEATHER_RECORDS;
  const safeDailyReflections: DailyReflection[] = 
    (dailyReflections && dailyReflections.length > 0) ? dailyReflections : INITIAL_DAILY_REFLECTIONS;
  const safeBookActivity: BookActivity = bookActivity || {
    readingSummary: '',
    clockExchangeMeaning: '',
    ifIWereHero: '',
    symbolismReflection: '',
    myPromiseToFuture: ''
  };

  // Safe entry helper supporting both standard place.id and legacy indexed keys
  const getPlaceEntry = (place: (typeof PLACES_DATA)[number], idx: number): WorkbookEntry | undefined => {
    return safeEntries[place.id] || safeEntries[`p${idx + 1}`];
  };

  const completedStamps = PLACES_DATA.filter((p, idx) => getPlaceEntry(p, idx)?.stampAcquired).length;
  const totalStamps = PLACES_DATA.length;
  const stampPercent = Math.round((completedStamps / totalStamps) * 100);

  // Dynamically update document print orientation for @page
  const updatePrintOrientation = (orientation: 'portrait' | 'landscape') => {
    document.body.dataset.printMode = orientation;
    let styleEl = document.getElementById('print-orientation-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'print-orientation-style';
      document.head.appendChild(styleEl);
    }
    if (orientation === 'portrait') {
      styleEl.textContent = `
        @page {
          size: A4 portrait !important;
          margin: 10mm 11mm !important;
        }
      `;
    } else {
      styleEl.textContent = `
        @page {
          size: A4 landscape !important;
          margin: 0 !important;
        }
      `;
    }
  };

  useEffect(() => {
    updatePrintOrientation(viewMode === 'slideshow' ? 'landscape' : 'portrait');
  }, [viewMode]);

  // Handle native browser print
  const handlePrint = (orientationOverride?: 'portrait' | 'landscape') => {
    const orientation = orientationOverride || (viewMode === 'slideshow' ? 'landscape' : 'portrait');
    updatePrintOrientation(orientation);
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Print trigger error:', err);
      }
    }, 120);
  };

  // Ensure all images in a container finish loading/decoding before high-DPI PDF capture
  const waitForImagesReady = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
      imgs.map(async (img) => {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 4000);
          });
        }
        if (typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch {
            // Ignore decode warnings on fallback images
          }
        }
      })
    );
  };

  // Pre-crop loaded images to exact 16:9 at native high resolution so html2canvas never squashes object-cover or degrades photo clarity
  const buildHighRes16x9PhotoMap = (root: HTMLElement): Map<string, string> => {
    const photoMap = new Map<string, string>();
    const photoNodes = root.querySelectorAll<HTMLImageElement>('img[data-photo-16x9="true"]');

    photoNodes.forEach((imgEl) => {
      const photoId = imgEl.dataset.photoId;
      if (!photoId || !imgEl.complete || !imgEl.naturalWidth || !imgEl.naturalHeight) return;

      try {
        const srcW = imgEl.naturalWidth;
        const srcH = imgEl.naturalHeight;
        const targetRatio = 16 / 9;
        const srcRatio = srcW / srcH;

        let cropW = srcW;
        let cropH = srcH;
        let sx = 0;
        let sy = 0;

        if (srcRatio > targetRatio) {
          cropW = srcH * targetRatio;
          sx = (srcW - cropW) / 2;
        } else if (srcRatio < targetRatio) {
          cropH = srcW / targetRatio;
          sy = (srcH - cropH) / 2;
        }

        const outW = Math.min(1920, Math.max(1280, Math.round(cropW)));
        const outH = Math.round((outW * 9) / 16);

        const offCanvas = document.createElement('canvas');
        offCanvas.width = outW;
        offCanvas.height = outH;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imgEl, sx, sy, cropW, cropH, 0, 0, outW, outH);

        const highResDataUrl = offCanvas.toDataURL('image/jpeg', 0.96);
        photoMap.set(photoId, highResDataUrl);
      } catch {
        // Cross-origin fallback image without CORS headers: keep original src safely
      }
    });

    return photoMap;
  };

  // Direct 1-Click High-Resolution PDF Download with Section-Based Non-Clipping Pagination
  const handleDownloadPdfDirect = async () => {
    setIsGeneratingPdf(true);
    const isLandscape = viewMode === 'slideshow';
    const orientation = isLandscape ? 'landscape' : 'portrait';

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      if (isLandscape) {
        // Landscape Slideshow Mode: capture all 14 slide pages at high DPI
        const deckEl = document.getElementById('presentation-slides-deck');
        if (!deckEl) throw new Error('슬라이드 덱을 찾을 수 없습니다.');
        await waitForImagesReady(deckEl);
        const photoMap = buildHighRes16x9PhotoMap(deckEl);
        const slideNodes = deckEl.querySelectorAll<HTMLElement>('.ppt-slide-page');

        for (let i = 0; i < slideNodes.length; i++) {
          const slideNode = slideNodes[i];
          const canvas = await html2canvas(slideNode, {
            scale: 2.5,
            useCORS: true,
            allowTaint: false,
            imageTimeout: 15000,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
              clonedDoc.querySelectorAll<HTMLImageElement>('img[data-photo-16x9="true"]').forEach((clonedImg) => {
                const pid = clonedImg.dataset.photoId;
                if (pid && photoMap.has(pid)) {
                  clonedImg.src = photoMap.get(pid)!;
                }
              });
            }
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage('a4', 'landscape');
          pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'NONE');
        }
      } else {
        // Portrait Full Workbook Mode: capture discrete logical sections at 3x print DPI
        // and pack cleanly onto A4 Portrait pages so NO section or 16:9 photo is ever sliced or stretched
        const docEl = document.getElementById('workbook-document-root');
        if (!docEl) throw new Error('워크북 문서를 찾을 수 없습니다.');

        await waitForImagesReady(docEl);
        const photoMap = buildHighRes16x9PhotoMap(docEl);
        const sectionNodes = Array.from(docEl.querySelectorAll<HTMLElement>('.workbook-pdf-section'));

        const pageWidthMm = 210;
        const pageHeightMm = 297;
        const marginXMm = 11;
        const marginTopMm = 10;
        const marginBottomMm = 13; // Reserves clean space for footer page numbering
        const contentWidthMm = pageWidthMm - marginXMm * 2; // 188mm
        const maxContentHeightMm = pageHeightMm - marginTopMm - marginBottomMm; // 274mm
        const sectionGapMm = 4.5;

        let currentY = marginTopMm;
        let hasContentOnCurrentPage = false;
        let forceNextSectionNewPage = false;

        for (let i = 0; i < sectionNodes.length; i++) {
          const sectionNode = sectionNodes[i];
          const startOnNewPage =
            forceNextSectionNewPage || sectionNode.dataset.newPageBefore === 'true';

          const canvas = await html2canvas(sectionNode, {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            imageTimeout: 15000,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
              clonedDoc.querySelectorAll<HTMLImageElement>('img[data-photo-16x9="true"]').forEach((clonedImg) => {
                const pid = clonedImg.dataset.photoId;
                if (pid && photoMap.has(pid)) {
                  clonedImg.src = photoMap.get(pid)!;
                }
              });
            }
          });

          // Exact proportional dimensions so photos & typography never stretch or squash
          let drawW = contentWidthMm;
          let drawH = (canvas.height * drawW) / canvas.width;

          // Safety guard if any single section has extraordinary essay length exceeding 1 full A4 page
          if (drawH > maxContentHeightMm) {
            drawH = maxContentHeightMm;
            drawW = (canvas.width * drawH) / canvas.height;
          }

          const neededHeight = hasContentOnCurrentPage ? sectionGapMm + drawH : drawH;

          if (hasContentOnCurrentPage && (startOnNewPage || currentY + neededHeight > marginTopMm + maxContentHeightMm)) {
            pdf.addPage('a4', 'portrait');
            currentY = marginTopMm;
            hasContentOnCurrentPage = false;
          }

          if (hasContentOnCurrentPage) {
            currentY += sectionGapMm;
          }

          const drawX = (pageWidthMm - drawW) / 2;
          const imgData = canvas.toDataURL('image/jpeg', 0.96);
          pdf.addImage(imgData, 'JPEG', drawX, currentY, drawW, drawH, undefined, 'NONE');

          currentY += drawH;
          hasContentOnCurrentPage = true;
          forceNextSectionNewPage = sectionNode.dataset.newPageAfter === 'true';
        }

        // Stamp clean page numbers across all generated A4 portrait pages
        const totalPages = pdf.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          pdf.setPage(p);
          pdf.setDrawColor(226, 232, 240);
          pdf.setLineWidth(0.25);
          pdf.line(marginXMm, pageHeightMm - 9.5, pageWidthMm - marginXMm, pageHeightMm - 9.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(
            `2026 GLOCAL JUKHYANG SHANGHAI EXPEDITION  |  ID: ${studentId}`,
            marginXMm,
            pageHeightMm - 5.5
          );
          pdf.text(
            `Page ${p} / ${totalPages}`,
            pageWidthMm - marginXMm,
            pageHeightMm - 5.5,
            { align: 'right' }
          );
        }
      }

      const typeLabel = isLandscape ? '발표슬라이드_가로' : '워크북종합보고서_세로';
      const fileName = `2026_상하이_역사문화탐방_${typeLabel}_${studentId}_${studentName}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.warn('Direct PDF canvas export warning, falling back to print dialog:', err);
      handlePrint(orientation);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Fullscreen toggle for presentations
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (slideshowContainerRef.current?.requestFullscreen) {
          slideshowContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed:', e);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation for interactive slideshow mode
  useEffect(() => {
    if (viewMode !== 'slideshow') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((c) => Math.min(13, c + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((c) => Math.max(0, c - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(13);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  // PPTX File Generator (14 Slides, with 100% safe null-guards)
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
      slide1.background = { color: 'F0FDF4' };
      slide1.addText('2026. 글로컬 죽향 역사·문화 탐방', {
        x: 0.8, y: 1.1, w: 8.4, h: 0.6,
        fontSize: 18, color: '065F46', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText('중국 상하이 역사·문화 탐방 결과 발표 보고서', {
        x: 0.8, y: 1.8, w: 8.4, h: 1.0,
        fontSize: 30, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText('8대 명소 현장 스탬프 랠리 · 융합 교과연계 탐구 · 3박 4일 성찰일지', {
        x: 0.8, y: 2.8, w: 8.4, h: 0.5,
        fontSize: 15, color: '047857', fontFace: 'Malgun Gothic'
      });
      
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 3.8, w: 8.4, h: 1.5,
        fill: { color: 'FFFFFF' }, line: { color: '10B981', width: 1.5 }
      });
      slide1.addText(`소속: ${studentSchool} 3학년    |    학번: ${studentId}    |    성명: ${studentName}`, {
        x: 1.0, y: 4.05, w: 8.0, h: 0.45,
        fontSize: 15, color: '0F172A', bold: true, fontFace: 'Malgun Gothic'
      });
      slide1.addText(`스탬프 완주: 8대 방문지 중 ${completedStamps}개 완료 (${stampPercent}%)    |    탐방 기간: 2026. 10. 13 (화) ~ 10. 16 (금)`, {
        x: 1.0, y: 4.55, w: 8.0, h: 0.45,
        fontSize: 13, color: '334155', fontFace: 'Malgun Gothic'
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
        const entry = safeEntries[place.id];
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

        // Left Box
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

        // Right Box: Curriculum Responses
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
      safeWeatherRecords.forEach((w, i) => {
        const colX = 0.8 + i * 2.15;
        weatherSlide.addShape(pptx.ShapeType.rect, {
          x: colX, y: 1.45, w: 2.0, h: 3.85,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        weatherSlide.addText(`DAY ${w.day}`, {
          x: colX + 0.1, y: 1.6, w: 1.8, h: 0.35,
          fontSize: 14, color: '047857', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });
        const datePart = (w.date || '').split(' ')[1] || w.date || '';
        weatherSlide.addText(datePart, {
          x: colX + 0.1, y: 1.95, w: 1.8, h: 0.25,
          fontSize: 10, color: '64748B', align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(w.forecast || '맑음', {
          x: colX + 0.1, y: 2.25, w: 1.8, h: 0.3,
          fontSize: 11, color: '0F172A', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(`${w.morningTemp || 17}°C ~ ${w.afternoonTemp || 23}°C`, {
          x: colX + 0.1, y: 2.55, w: 1.8, h: 0.3,
          fontSize: 11, color: '0369A1', bold: true, align: 'center', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(`복장 안내:\n${w.clothingNotes || '편안한 복장'}`, {
          x: colX + 0.15, y: 2.9, w: 1.7, h: 0.9,
          fontSize: 9, color: '475569', fontFace: 'Malgun Gothic'
        });
        weatherSlide.addText(`학생 기후 관측:\n${w.studentInvestigation || '(현장 관측 기록 없음)'}`, {
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
      safeDailyReflections.slice(0, 4).forEach((r, i) => {
        const rx = 0.8 + (i % 2) * 4.3;
        const ry = 1.45 + Math.floor(i / 2) * 1.95;
        refSlide.addShape(pptx.ShapeType.rect, {
          x: rx, y: ry, w: 4.1, h: 1.8,
          fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
        });
        const refDate = (r.date || '').split(' ')[1] || r.date || '';
        refSlide.addText(`제${r.day}일차 (${refDate})`, {
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
        { label: '도서 핵심 내용 및 독서 요약', val: safeBookActivity.readingSummary || '(작성 내용 없음)' },
        { label: '김구·윤봉길 회중시계 교환의 상징적 의미', val: safeBookActivity.clockExchangeMeaning || '(작성 내용 없음)' },
        { label: '내가 만약 그 시대의 청년 영웅이었다면', val: safeBookActivity.ifIWereHero || '(작성 내용 없음)' },
        { label: '미래의 나에게 보내는 약속과 다짐', val: safeBookActivity.myPromiseToFuture || '(작성 내용 없음)' }
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
      closeSlide.background = { color: 'F0FDF4' };
      closeSlide.addText('탐방 활동 수료 및 워크북 검인', {
        x: 0.8, y: 1.8, w: 8.4, h: 0.6,
        fontSize: 26, color: '065F46', bold: true, align: 'center', fontFace: 'Malgun Gothic'
      });
      closeSlide.addText('위와 같이 2026. 글로컬 죽향 역사문화탐방 워크북 활동을 성실히 수행하였음을 확인합니다.', {
        x: 0.8, y: 2.6, w: 8.4, h: 0.5,
        fontSize: 15, color: '0F172A', align: 'center', fontFace: 'Malgun Gothic'
      });
      closeSlide.addText(`${studentSchool} 지도교사 및 탐방추진단 귀하\n발행일: ${new Date().toLocaleDateString('ko-KR')}`, {
        x: 0.8, y: 3.5, w: 8.4, h: 0.8,
        fontSize: 14, color: '047857', bold: true, align: 'center', fontFace: 'Malgun Gothic'
      });

      const fileName = `2026_상하이_역사문화탐방_발표보고서_${studentId}_${studentName}.pptx`;
      await pptx.writeFile({ fileName });
    } catch (err) {
      console.error('PPTX generation error:', err);
      alert('PPTX 파일 생성 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  // Render 16:9 Presentation Slide Content (0 ~ 13) for Slideshow Mode
  const renderSlideContent = (index: number) => {
    // Slide 1: Cover
    if (index === 0) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 text-slate-900 rounded-2xl border border-emerald-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl text-emerald-900 select-none">🎋</div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-xs sm:text-sm font-bold tracking-wider text-emerald-800">
                2026. 글로컬 죽향 역사·문화 탐방
              </span>
            </div>
            <span className="text-xs text-emerald-700 font-mono font-semibold bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full">
              OFFICIAL PRESENTATION DECK
            </span>
          </div>

          <div className="my-auto space-y-4 max-w-4xl">
            <span className="inline-block text-emerald-700 text-xs sm:text-sm font-bold tracking-widest uppercase">
              SHANGHAI HISTORICAL & CULTURAL WORKBOOK REPORT
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              중국 상하이 역사·문화 탐방<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900">
                종합 결과 발표 보고서
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
              상하이 8대 역사문화 명소 현장 스탬프 랠리, 교과연계 현장 융합 탐구, 기후 조사 및 3박 4일 일자별 성찰일지
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200 shadow-sm">
            <div>
              <span className="text-[11px] text-emerald-800 font-semibold block">소속 학교</span>
              <span className="text-sm font-bold text-slate-900">{studentSchool}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-800 font-semibold block">학번 및 성명</span>
              <span className="text-sm font-bold text-slate-900">{studentId} {studentName}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-800 font-semibold block">8대 스탬프 완주</span>
              <span className="text-sm font-bold text-emerald-700">{completedStamps} / {totalStamps} 완료 ({stampPercent}%)</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-800 font-semibold block">탐방 일정</span>
              <span className="text-sm font-bold text-slate-900">2026. 10. 13 ~ 10. 16</span>
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
          curriculum: '역사(개항과 비밀접선), 사회(글로벌 상업), 체육(도보건강관리)'
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
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-emerald-700 font-mono font-bold tracking-wider">SLIDE 02 · TRIP OVERVIEW</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">탐방 개요 및 3박 4일 주요 여정 타임라인</h2>
            </div>
            <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
            {days.map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                    {d.day} · {d.date}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{d.theme}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 leading-snug">{d.places}</div>
                <div className="text-xs text-slate-600 pt-1.5 border-t border-slate-200">
                  <span className="font-semibold text-emerald-800">연계 교과:</span> {d.curriculum}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <span>🎋 <strong>탐방 핵심 목표:</strong> 독립운동 선열의 자주정신 계승 · 첨단 글로벌 과학문화 체득 · 죽향 담양을 빛낼 세계시민 역량 함양</span>
            <span className="text-[11px] text-emerald-800 font-mono font-medium">담양여자중학교</span>
          </div>
        </div>
      );
    }

    // Slides 3 ~ 10: 8 Places Slides
    if (index >= 2 && index <= 9) {
      const placeIdx = index - 2;
      const place = PLACES_DATA[placeIdx];
      const entry = getPlaceEntry(place, placeIdx);
      const isStamped = entry?.stampAcquired;

      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  SLIDE 0{index + 1} · SPOT 0{placeIdx + 1}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-500 font-medium">
                  {place.dayLabel} ({place.timeSlot})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{placeIdx + 1}. {place.name}</span>
                <span className="text-sm font-normal text-slate-500">({place.chineseName})</span>
              </h2>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isStamped 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              {isStamped ? (
                <>
                  <CheckCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="text-right">
                    <span className="text-xs font-bold block leading-none">★ 스탬프 완주 직인</span>
                    <span className="text-[10px] text-rose-600 font-mono">{entry?.stampedAt || '현장 인증 완료'}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-auto">
            {/* Left Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="workbook-photo-16x9 relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                <img
                  data-photo-16x9="true"
                  data-photo-id={`slide-place-${placeIdx}`}
                  src={entry?.photoUrl || place.image}
                  alt={place.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = place.image;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white bg-slate-900/80 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  <span className="truncate">{entry?.photoUrl ? '📸 학생 촬영 현장 인증 사진 (16:9)' : '🏛️ 탐방지 대표 전경'}</span>
                  <span className="text-emerald-300 font-mono shrink-0">{place.location}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div>
                  <strong className="text-emerald-800 block text-[11px] font-bold mb-0.5">장소 의의 및 탐방 특징</strong>
                  <p className="text-slate-700 line-clamp-3 leading-relaxed">{place.features}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <strong className="text-teal-800 block text-[11px] font-bold mb-0.5">우리나라 독립운동사 연계성</strong>
                  <p className="text-slate-700 line-clamp-3 leading-relaxed">{place.koreaConnection}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    교과연계 현장 융합 탐구 활동 기록
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {place.curriculumLinks.length}개 교과 연계
                  </span>
                </div>

                {place.curriculumLinks.map((link, cIdx) => {
                  const respKey = `${link.subject}_${cIdx}`;
                  const ans = entry?.curriculumResponses?.[respKey] || '';
                  return (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">
                          [{link.subject}] {link.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Q. {link.guideQuestion}
                      </p>
                      <div className="mt-1 p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-medium leading-relaxed shadow-2xs">
                        A. {ans || '(학생 작성 내용 없음)'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 block text-[11px] mb-0.5">
                  ✍️ {studentName} 학생의 현장 한줄 소감
                </span>
                <p className="text-slate-800 italic leading-relaxed">
                  "{entry?.reflectionText?.trim() || `${place.name}을(를) 직접 답사하며 책으로만 보던 역사의 현장을 피부로 느끼고, 선열들의 고귀한 희생과 상하이의 눈부신 발전을 함께 배울 수 있었습니다.`}"
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
            <span>{studentSchool} 2026. 글로컬 죽향 역사문화탐방 발표 자료</span>
            <span className="font-mono text-emerald-700 font-bold">Slide {index + 1} / 14</span>
          </div>
        </div>
      );
    }

    // Slide 11: Weather Investigation
    if (index === 10) {
      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-sky-700 font-mono font-bold tracking-wider">SLIDE 11 · CLIMATE & METEOROLOGY</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">상하이 4일간 기후 조사 및 현장 기상 관측 결과</h2>
            </div>
            <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto">
            {safeWeatherRecords.map((w) => (
              <div key={w.day} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-sky-800">DAY {w.day}</span>
                    <span className="text-[11px] text-slate-500">{(w.date || '').split(' ')[1] || w.date || ''}</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">{w.forecast || '맑음'}</div>
                  <div className="text-sm font-bold text-sky-700 mt-0.5">{w.morningTemp || 17}°C ~ {w.afternoonTemp || 23}°C</div>
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">현장 추천 복장</span>
                    <p className="line-clamp-2 text-slate-700">{w.clothingNotes || '편안한 복장'}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-sky-800 block font-bold">학생 기후 관측 기록</span>
                    <p className="text-slate-900 font-medium line-clamp-3 leading-relaxed mt-0.5 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      {w.studentInvestigation || '(현장 관측 내용 작성 전)'}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 text-center font-mono">
                  상하이시 황푸구 기상 관측
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-center justify-between">
            <span>🌏 <strong>기후 비교 분석:</strong> 가을철(10월) 상하이는 아열대 계절풍 기후의 영향으로 담양(온대 기후) 대비 평균 기온이 약 3~4°C 높고 습도가 온화하여 탐방 활동에 매우 쾌적했습니다.</span>
            <span className="text-[11px] font-mono text-sky-800 font-bold shrink-0">Slide 11 / 14</span>
          </div>
        </div>
      );
    }

    // Slide 12: Daily Reflections
    if (index === 11) {
      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-emerald-700 font-mono font-bold tracking-wider">SLIDE 12 · DAILY REFLECTIONS</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">3박 4일 일자별 오늘의 성찰일지 (Daily Reflection)</h2>
            </div>
            <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {safeDailyReflections.slice(0, 4).map((r) => (
              <div key={r.day} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded">
                    제{r.day}일차 ({r.date || ''})
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">오늘의 나 돌아보기</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[11px] text-emerald-900 font-bold block">1. 가장 기억에 남는 장면이나 사건:</span>
                    <p className="text-slate-800 leading-snug line-clamp-2 mt-0.5 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {r.memorableScene || '(성찰일지 내용 미작성)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-teal-900 font-bold block">2. 가장 크게 느낀 생각이나 감정:</span>
                    <p className="text-slate-800 leading-snug line-clamp-2 mt-0.5 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {r.biggestEmotion || '(성찰일지 내용 미작성)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-900 font-bold block">3. 새롭게 알게 된 것과 배운 점:</span>
                    <p className="text-slate-800 leading-snug line-clamp-2 mt-0.5 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {r.newlyLearned || '(성찰일지 내용 미작성)'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <span>📖 <strong>성찰의 의의:</strong> 매일 저녁 작성한 일지는 단순한 여정 기록을 넘어, 낯선 환경 속에서 자신의 생각과 가치관을 심도 있게 정립하는 소중한 자산이 되었습니다.</span>
            <span className="text-[11px] font-mono text-emerald-800 font-bold shrink-0">Slide 12 / 14</span>
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
          text: safeBookActivity.readingSummary || '김구 선생의 백범일지와 상하이 임시정부를 중심으로 조국의 독립을 위해 헌신한 한인애국단과 청년 의사들의 숭고한 결의를 읽고 시대적 배경을 탐구하였습니다.'
        },
        {
          label: '2. 김구·윤봉길 회중시계 교환의 상징적 의미',
          sub: '6원짜리 시계와 2원짜리 시계에 담긴 맹세',
          text: safeBookActivity.clockExchangeMeaning || '윤봉길 의사가 거사 직전 자신의 새 시계와 김구 선생의 낡은 시계를 바꾸며 남긴 말은, 죽음을 앞두고도 오직 조국의 광복만을 생각했던 두 분의 굳은 신뢰와 영원한 독립의 맹세를 상징합니다.'
        },
        {
          label: '3. 내가 만약 그 시대의 청년 영웅이었다면',
          sub: '역사 속 주체로서의 나의 양심과 결단',
          text: safeBookActivity.ifIWereHero || '만약 내가 일제강점기 그 엄혹한 시대를 살아갔다면, 나 자신의 안위보다는 억압받는 민족의 고통에 공감하고 당당하게 독립운동의 뜻에 동참하며 정의로운 길을 선택했을 것입니다.'
        },
        {
          label: '4. 미래의 나에게 보내는 약속과 다짐',
          sub: '담양의 대나무처럼 곧고 바른 세계시민으로',
          text: safeBookActivity.myPromiseToFuture || '선열들이 피땀으로 지켜낸 평화로운 대한민국에서 살아가는 오늘, 나 역시 배움을 게을리하지 않고 담양의 푸른 대나무처럼 곧은 지조와 넓은 세계관을 가진 인재로 성장할 것을 다짐합니다.'
        }
      ];

      return (
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-emerald-700 font-mono font-bold tracking-wider">SLIDE 13 · INTEGRATED READING</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">역사 융합 독서 활동: 백범일지와 청년 의사의 혼</h2>
            </div>
            <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{studentId} {studentName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {readingCards.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <span className="text-xs font-bold text-emerald-800 block">{c.label}</span>
                  <span className="text-[10px] text-slate-500 block">{c.sub}</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed line-clamp-4 p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {c.text}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <span>⏳ <strong>역사 독서 연계:</strong> 루쉰공원 매헌기념관 답사와 백범일지 독서 활동을 융합하여 역사적 사실에 대한 깊은 공감과 주도적 역사관을 함양했습니다.</span>
            <span className="text-[11px] font-mono text-emerald-800 font-bold shrink-0">Slide 13 / 14</span>
          </div>
        </div>
      );
    }

    // Slide 14: Certificate & Conclusion
    if (index === 13) {
      return (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50 text-slate-900 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <span className="text-xs text-emerald-800 font-mono font-bold">SLIDE 14 · COMPLETION & CERTIFICATION</span>
            <span className="text-xs text-slate-500 font-mono">DY-2026-GLOCAL-{studentId}</span>
          </div>

          <div className="my-auto max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-300 shadow-md text-center space-y-4">
            <div className="inline-block p-3 rounded-full bg-emerald-100 text-emerald-700 mb-1 border border-emerald-200">
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              탐방 활동 종합 수료 확인서
            </h2>

            <div className="max-w-xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p>
                위 학생은 전라남도 담양교육지원청 및 담양여자중학교에서 주관한 
                <strong className="text-emerald-900 font-bold"> 「2026. 글로컬 죽향 역사문화탐방」</strong> 프로그램에 참여하여 
                상하이 8대 역사문화 명소 답사, 교과연계 현장 융합 탐구, 기상 관측 및 성찰일지 전 과정을 
                성실히 완수하였음을 확인합니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-3 border-t border-slate-200 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-emerald-800 font-semibold block">소속</span>
                <span className="font-bold text-slate-900">{studentSchool}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-emerald-800 font-semibold block">성명 (학번)</span>
                <span className="font-bold text-slate-900">{studentName} ({studentId})</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-emerald-800 font-semibold block">스탬프 달성</span>
                <span className="font-bold text-emerald-700">{completedStamps} / 8 완료</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-600 font-serif">
              2026년 10월 16일<br />
              <strong className="text-sm text-emerald-950 font-bold font-sans">담양여자중학교 지도교사 및 탐방추진단 귀하</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-2 border-t border-emerald-200 font-mono">
            <span>2026. GLOCAL JUKHYANG HISTORICAL & CULTURAL EXPEDITION</span>
            <span className="font-bold">END OF PRESENTATION DECK</span>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render Full A4 Portrait Printable Workbook Document
  // Partitioned into discrete, non-clipping logical sections with 16:9 high-resolution photo frames
  const renderWorkbookDoc = () => {
    const day1And2Reflections = safeDailyReflections.slice(0, 2);
    const day3And4Reflections = safeDailyReflections.slice(2, 4);

    return (
      <div id="workbook-document-root" className="workbook-print-doc space-y-6">
        
        {/* SECTION 1 (Cover & Trip Overview): Always dedicated Page 1 */}
        <section
          data-new-page-after="true"
          className="workbook-pdf-section workbook-section-card workbook-force-page-break w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-7 sm:p-10 shadow-sm space-y-6 text-slate-900 break-inside-avoid"
        >
          {/* Official Header */}
          <div className="border-b-2 border-emerald-800 pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
              <span>🎋 전라남도 담양교육지원청</span>
              <span>•</span>
              <span>담양여자중학교</span>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              문서번호: DY-2026-SH-{studentId}
            </span>
          </div>

          {/* Title Banner */}
          <div className="text-center py-5 border-b border-slate-200 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono">
              I. 탐방 종합 개요 및 여정 안내
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              중국 상하이 역사·문화 탐방 결과 보고서
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              8대 역사문화 명소 스탬프 랠리 · 융합 교과연계 현장 탐구 · 3박 4일 일자별 성찰일지 종합
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="rounded-xl border border-slate-300 overflow-hidden text-xs sm:text-sm">
            <div className="bg-slate-50 px-4 py-2 font-bold text-slate-800 border-b border-slate-300 flex items-center justify-between">
              <span>탐방 학생 기본 인적사항 및 이수 현황</span>
              <span className="text-emerald-700 font-mono text-xs">확인 완료</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[11px] text-slate-500 block mb-0.5">소속 학교</span>
                <span className="font-bold text-slate-900">{studentSchool}</span>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[11px] text-slate-500 block mb-0.5">학번 및 성명</span>
                <span className="font-bold text-slate-900">{studentId} {studentName}</span>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[11px] text-slate-500 block mb-0.5">8대 스탬프 완주</span>
                <span className="font-bold text-emerald-700">{completedStamps} / 8 완료 ({stampPercent}%)</span>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[11px] text-slate-500 block mb-0.5">탐방 기간</span>
                <span className="font-bold text-slate-900">2026.10.13 ~ 10.16</span>
              </div>
            </div>
          </div>

          {/* 4-Day Timeline Table */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>3박 4일 주요 여정 및 연계 교과 타임라인</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 w-24">일자</th>
                    <th className="p-2.5">주요 방문지 및 활동</th>
                    <th className="p-2.5 w-36">연계 교과</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-800 bg-slate-50">제1일차 (10.13)</td>
                    <td className="p-2.5">담양 집결 ➔ 인천공항 ➔ 상하이 푸둥 ➔ 남경로 보행가 ➔ 마시청 서커스 & 외탄 야경</td>
                    <td className="p-2.5 text-slate-600">역사, 사회, 체육</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-800 bg-slate-50">제2일차 (10.14)</td>
                    <td className="p-2.5">루쉰공원(매헌 윤봉길 기념관) ➔ 상하이 임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원</td>
                    <td className="p-2.5 text-slate-600">도덕, 역사, 과학</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-800 bg-slate-50">제3일차 (10.15)</td>
                    <td className="p-2.5">상하이 과학기술관 (AI·로봇 탐구) ➔ 상하이 디즈니랜드 역사문화 테마파크 ➔ 야간 일루미네이션</td>
                    <td className="p-2.5 text-slate-600">과학, 기술, 미술</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-800 bg-slate-50">제4일차 (10.16)</td>
                    <td className="p-2.5">호텔 체크아웃 ➔ 푸둥공항 출국 ➔ 인천국제공항 ➔ 담양 귀환 및 해단식</td>
                    <td className="p-2.5 text-slate-600">국어, 진로</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Pledge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">본 학생 보고서의 모든 기록과 탐구 답변은 현장에서 직접 체험하고 작성하였음을 확인합니다.</p>
              <p className="text-slate-500 mt-0.5">{studentSchool} 3학년 {studentName} ({studentId})</p>
            </div>
            <div className="w-15 h-15 rounded-full border-2 border-dashed border-emerald-600 flex items-center justify-center text-[10px] text-emerald-800 font-bold shrink-0 text-center leading-tight">
              학생 확인<br />(인)
            </div>
          </div>
        </section>

        {/* SECTIONS 2 ~ 9: 8 Places Individual Non-Splitting Sections (with 16:9 High-Res Student Photo Frame) */}
        {PLACES_DATA.map((place, placeIdx) => {
          const entry = getPlaceEntry(place, placeIdx);
          const isStamped = !!entry?.stampAcquired;
          const hasStudentPhoto = Boolean(entry?.photoUrl);

          return (
            <section
              key={place.id}
              className="workbook-pdf-section workbook-section-card w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3.5 text-slate-900 break-inside-avoid"
            >
              {/* Section Category Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px]">
                <span className="font-bold text-emerald-800">
                  II. 8대 역사문화 명소 현장 답사 및 교과연계 탐구 기록 — 구획 {placeIdx + 1} / 8
                </span>
                <span className="text-slate-500 font-mono">
                  {studentName} ({studentId})
                </span>
              </div>

              {/* Place Title & Stamp Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    SPOT 0{placeIdx + 1} • {place.dayLabel} ({place.timeSlot}) • {place.location}
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {placeIdx + 1}. {place.name}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">({place.chineseName})</span>
                  </h4>
                </div>

                <div
                  className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                    isStamped
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-slate-300 bg-slate-50 text-slate-400'
                  }`}
                >
                  {isStamped ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>★ 스탬프 직인 완료 ({entry?.stampedAt || '현장 인증'})</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>현장 미인증</span>
                    </>
                  )}
                </div>
              </div>

              {/* Top Row: Exact 16:9 High-Resolution Photo (6 cols) + Historical Context (6 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch text-xs">
                <div className="sm:col-span-6 flex flex-col justify-between space-y-1.5">
                  <div className="workbook-photo-16x9 relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
                    <img
                      data-photo-16x9="true"
                      data-photo-id={`workbook-place-${placeIdx}`}
                      src={entry?.photoUrl || place.image}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = place.image;
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] px-1 text-slate-500">
                    <span className={hasStudentPhoto ? 'font-bold text-emerald-800' : 'text-slate-500'}>
                      {hasStudentPhoto ? '📸 학생 업로드 현장 인증 사진 (16:9 고화질 원본 비율)' : '🏛️ 탐방지 참고 사진 (16:9 비율)'}
                    </span>
                    <span className="font-mono">{place.location}</span>
                  </div>
                </div>

                <div className="sm:col-span-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] leading-relaxed flex flex-col justify-between space-y-2">
                  <div>
                    <strong className="text-emerald-800 block font-bold mb-0.5">방문지 핵심 특징</strong>
                    <p className="text-slate-700">{place.features}</p>
                  </div>
                  {place.koreaConnection && (
                    <div className="pt-2 border-t border-slate-200">
                      <strong className="text-teal-800 block font-bold mb-0.5">우리나라 독립운동사 및 교과 연계성</strong>
                      <p className="text-slate-700">{place.koreaConnection}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Row: Full-Width Curriculum Questions & Student Answers */}
              <div className="space-y-2 pt-0.5">
                {place.curriculumLinks.map((link, cIdx) => {
                  const respKey = `${link.subject}_${cIdx}`;
                  const ans = entry?.curriculumResponses?.[respKey] || '';
                  return (
                    <div key={cIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-emerald-800 text-[11px]">
                          [{link.subject}] {link.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{link.description}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Q. {link.guideQuestion}
                      </p>
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-900 font-medium leading-relaxed whitespace-pre-wrap break-words">
                        A. {ans || '(학생 작성 내용 없음)'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Row: Full-Width Student Field Reflection */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px]">
                <strong className="text-emerald-900 font-bold block mb-0.5">✍️ 현장 답사 한줄 소감:</strong>
                <p className="text-slate-800 italic leading-relaxed whitespace-pre-wrap break-words">
                  "{entry?.reflectionText?.trim() || `${place.name}을(를) 직접 답사하며 역사의 숨결을 피부로 느끼고 선열들의 숭고한 정신을 배웠습니다.`}"
                </p>
              </div>
            </section>
          );
        })}

        {/* SECTION 10: Part III-1 Weather Investigation Section (Starts cleanly on a new page) */}
        <section
          data-new-page-before="true"
          className="workbook-pdf-section workbook-section-card workbook-start-new-page w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-slate-900 break-inside-avoid"
        >
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-xs">
            <span className="font-bold text-emerald-800">
              III-1. 상하이 4일간 현장 기상 관측 및 기후 비교 조사
            </span>
            <span className="text-slate-500 font-mono">
              {studentName} ({studentId})
            </span>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-emerald-700" />
              <span>일자별 기온 · 날씨 및 학생 기상 관측 기록표</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 w-18">일자</th>
                    <th className="p-2.5 w-24">날씨 / 기온</th>
                    <th className="p-2.5 w-44">현장 추천 복장</th>
                    <th className="p-2.5">학생 기후 관측 및 탐구 소감</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {safeWeatherRecords.map((w) => (
                    <tr key={w.day}>
                      <td className="p-2.5 font-bold text-emerald-800 bg-slate-50">DAY {w.day}</td>
                      <td className="p-2.5">
                        <span className="font-bold block">{w.forecast || '맑음'}</span>
                        <span className="text-[11px] text-sky-700 font-mono">{w.morningTemp || 17}°C ~ {w.afternoonTemp || 23}°C</span>
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-600 leading-snug">{w.clothingNotes || '편안한 복장'}</td>
                      <td className="p-2.5 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                        {w.studentInvestigation || '(학생 관측 기록 없음)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 11: Part III-2a Daily Reflections (Day 1 & Day 2) */}
        <section className="workbook-pdf-section workbook-section-card w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-slate-900 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-xs">
            <span className="font-bold text-emerald-800">
              III-2. 3박 4일 일자별 오늘의 성찰일지 (제1일차 · 제2일차)
            </span>
            <span className="text-slate-500 font-mono">
              {studentName} ({studentId})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {day1And2Reflections.map((r) => (
              <div key={r.day} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2.5">
                <div className="font-bold text-emerald-800 flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>제{r.day}일차 성찰일지</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">{r.date || ''}</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <strong className="text-emerald-800 block mb-0.5">1. 오늘 가장 기억에 남는 장면</strong>
                    <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{r.memorableScene || '(내용 미작성)'}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <strong className="text-emerald-800 block mb-0.5">2. 크게 느낀 생각이나 감정</strong>
                    <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{r.biggestEmotion || '(내용 미작성)'}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <strong className="text-emerald-800 block mb-0.5">3. 오늘 새롭게 알게 된 점</strong>
                    <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{r.newlyLearned || '(내용 미작성)'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 12: Part III-2b Daily Reflections (Day 3 & Day 4) */}
        {day3And4Reflections.length > 0 && (
          <section className="workbook-pdf-section workbook-section-card w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-slate-900 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-xs">
              <span className="font-bold text-emerald-800">
                III-3. 3박 4일 일자별 오늘의 성찰일지 (제3일차 · 제4일차)
              </span>
              <span className="text-slate-500 font-mono">
                {studentName} ({studentId})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {day3And4Reflections.map((r) => (
                <div key={r.day} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2.5">
                  <div className="font-bold text-emerald-800 flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>제{r.day}일차 성찰일지</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">{r.date || ''}</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <strong className="text-emerald-800 block mb-0.5">1. 오늘 가장 기억에 남는 장면</strong>
                      <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{r.memorableScene || '(내용 미작성)'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <strong className="text-emerald-800 block mb-0.5">2. 크게 느낀 생각이나 감정</strong>
                      <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{r.biggestEmotion || '(내용 미작성)'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <strong className="text-emerald-800 block mb-0.5">3. 오늘 새롭게 알게 된 점</strong>
                      <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{r.newlyLearned || '(내용 미작성)'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 13: Part IV-1 Integrated Reading Activity (Starts cleanly on a new page) */}
        <section
          data-new-page-before="true"
          className="workbook-pdf-section workbook-section-card workbook-start-new-page w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-slate-900 break-inside-avoid"
        >
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-xs">
            <span className="font-bold text-emerald-800">
              IV-1. 역사 융합 독서 활동: 백범일지와 청년 의사의 혼
            </span>
            <span className="text-slate-500 font-mono">
              {studentName} ({studentId})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1.5">
              <strong className="text-emerald-800 block font-bold text-[11px]">1. 도서 핵심 내용 및 독서 요약</strong>
              <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                {safeBookActivity.readingSummary || '김구 선생의 백범일지와 상하이 임시정부를 중심으로 조국의 독립을 위해 헌신한 한인애국단과 청년 의사들의 숭고한 결의를 읽고 시대적 배경을 탐구하였습니다.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1.5">
              <strong className="text-emerald-800 block font-bold text-[11px]">2. 김구·윤봉길 회중시계 교환의 상징적 의미</strong>
              <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                {safeBookActivity.clockExchangeMeaning || '윤봉길 의사가 거사 직전 자신의 새 시계와 김구 선생의 낡은 시계를 바꾸며 남긴 말은, 죽음을 앞두고도 오직 조국의 광복만을 생각했던 두 분의 굳은 신뢰와 영원한 독립의 맹세를 상징합니다.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1.5">
              <strong className="text-emerald-800 block font-bold text-[11px]">3. 내가 만약 그 시대의 청년 영웅이었다면</strong>
              <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                {safeBookActivity.ifIWereHero || '만약 내가 일제강점기 그 엄혹한 시대를 살아갔다면, 나 자신의 안위보다는 억압받는 민족의 고통에 공감하고 당당하게 독립운동의 뜻에 동참하며 정의로운 길을 선택했을 것입니다.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1.5">
              <strong className="text-emerald-800 block font-bold text-[11px]">4. 미래의 나에게 보내는 약속과 다짐</strong>
              <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                {safeBookActivity.myPromiseToFuture || '선열들이 피땀으로 지켜낸 평화로운 대한민국에서 살아가는 오늘, 나 역시 배움을 게을리하지 않고 담양의 푸른 대나무처럼 곧은 지조와 넓은 세계관을 가진 인재로 성장할 것을 다짐합니다.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 14: Part IV-2 Official Completion Certificate (Atomic Non-Splitting Block) */}
        <section className="workbook-pdf-section workbook-section-card w-full max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-slate-900 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-xs">
            <span className="font-bold text-emerald-800">
              IV-2. 탐방 활동 종합 수료 확인서
            </span>
            <span className="text-slate-500 font-mono">
              {studentName} ({studentId})
            </span>
          </div>

          <div className="p-6 rounded-2xl border-2 border-emerald-800 bg-white text-center space-y-4">
            <div className="inline-block p-2 rounded-full bg-emerald-100 text-emerald-800 mb-0.5">
              <Award className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              탐방 활동 종합 수료 확인서
            </h2>

            <div className="max-w-lg mx-auto text-xs text-slate-700 leading-relaxed space-y-1.5">
              <p>
                위 학생은 전라남도 담양교육지원청 및 담양여자중학교에서 주관한{' '}
                <strong>「2026. 글로컬 죽향 역사문화탐방」</strong> 프로그램에 참여하여{' '}
                상하이 8대 역사문화 명소 답사, 교과연계 현장 융합 탐구, 기상 관측 및 성찰일지 전 과정을{' '}
                성실히 완수하였음을 확인합니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto pt-2 border-t border-slate-200 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">소속</span>
                <span className="font-bold text-slate-900">{studentSchool}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">성명 (학번)</span>
                <span className="font-bold text-slate-900">{studentName} ({studentId})</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">스탬프 달성</span>
                <span className="font-bold text-emerald-800">{completedStamps} / 8 완료</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-700 space-y-1">
              <div>2026년 10월 16일</div>
              <div className="text-sm font-bold text-slate-900">
                담양여자중학교 지도교사 및 탐방추진단 귀하
              </div>
            </div>
          </div>
        </section>

      </div>
    );
  };

  const totalSlides = 14;

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Action Header (Hidden in Print) */}
      <div className="print:hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>A4 세로 워크북 & 16:9 가로 슬라이드쇼 완벽 지원</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {viewMode === 'workbook' 
                ? '전체 워크북 보고서 출력 (A4 세로 규격)' 
                : '발표용 PPT 슬라이드 & PDF 출력 (A4 가로 규격)'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              {viewMode === 'workbook' ? (
                <>
                  초록색 배경 대신 <strong>깨끗한 밝은 흰 바탕</strong>으로 구성되어 종이 인쇄 시 잉크를 절약하고 가독성을 극대화한 
                  <strong> A4 규격 세로 보고서</strong>입니다. 브라우저 인쇄 창 또는 <strong>1-클릭 PDF 직접 다운로드</strong>로 즉시 저장할 수 있습니다.
                </>
              ) : (
                <>
                  교실 프로젝터나 전자칠판에서 직접 화면에 띄워 발표할 수 있는 <strong>16:9 가로 슬라이드쇼 발표 모드</strong>입니다. 
                  전체 슬라이드 덱을 <strong>A4 가로 규격 고화질 PDF</strong> 및 <strong>파워포인트(PPTX)</strong> 파일로 저장할 수 있습니다.
                </>
              )}
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* View Mode Toggle: Workbook (Portrait) vs Slideshow (Landscape) */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('workbook')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  viewMode === 'workbook' 
                    ? 'bg-white text-emerald-800 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>전체 워크북 뷰 (A4 세로 인쇄용)</span>
              </button>
              <button
                onClick={() => setViewMode('slideshow')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  viewMode === 'slideshow' 
                    ? 'bg-white text-emerald-800 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Presentation className="w-4 h-4 text-emerald-600" />
                <span>슬라이드쇼 발표 모드 (A4 가로)</span>
              </button>
            </div>

            {/* Direct 1-Click PDF File Download (.pdf) */}
            <button
              onClick={handleDownloadPdfDirect}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
              title="모바일 및 PC 어디서든 즉시 .pdf 파일로 직접 다운로드합니다."
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF 파일 다운로드 (.pdf)</span>
                </>
              )}
            </button>

            {/* Browser Native Print / Save as PDF */}
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition shadow-xs active:scale-95 cursor-pointer"
              title={viewMode === 'workbook' ? 'A4 세로 방향으로 인쇄 창을 엽니다.' : 'A4 가로 방향으로 인쇄 창을 엽니다.'}
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{viewMode === 'workbook' ? '인쇄 / A4 세로 저장' : '인쇄 / A4 가로 저장'}</span>
            </button>

            {/* PPTX Download (Slideshow Mode) */}
            {viewMode === 'slideshow' && (
              <button
                onClick={handleDownloadPptx}
                disabled={isGeneratingPptx}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs disabled:opacity-60 cursor-pointer"
                title="14장의 파워포인트(.pptx) 파일로 다운로드합니다."
              >
                {isGeneratingPptx ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PPTX 생성...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>PPTX 다운로드</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Print Guidance Note */}
        {showPrintTips && (
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>💡 인쇄 및 PDF 저장 안내:</strong> 현재 모드인 <strong>{viewMode === 'workbook' ? '전체 워크북(A4 세로)' : '슬라이드쇼 발표(A4 가로)'}</strong> 규격에 맞추어 인쇄 규격이 자동 지정됩니다. 인쇄 창에서 'PDF로 저장'을 선택하시거나, 위 <strong>[PDF 파일 다운로드 (.pdf)]</strong> 버튼을 누르면 기기에 바로 파일이 저장됩니다.
              </span>
            </div>
            <button 
              onClick={() => setShowPrintTips(false)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold shrink-0 ml-2 cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Full Workbook Document (A4 Portrait, Bright White Background) */}
      {viewMode === 'workbook' && (
        <div className="space-y-6">
          {renderWorkbookDoc()}
        </div>
      )}

      {/* VIEW 2: Slideshow Presentation Mode (Interactive on Screen, A4 Landscape in Print) */}
      {viewMode === 'slideshow' && (
        <div className="space-y-6">
          {/* Interactive Slideshow Viewer (Hidden in Print) */}
          <div className="print:hidden space-y-4" ref={slideshowContainerRef}>
            {/* Presenter Toolbar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Slide Index & Direct Selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-xs font-bold font-mono text-emerald-800 uppercase tracking-wider">
                    SLIDE {currentSlideIndex + 1} / {totalSlides}
                  </span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <select
                  value={currentSlideIndex}
                  onChange={(e) => setCurrentSlideIndex(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-1.5 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[240px] sm:max-w-[320px] truncate"
                >
                  {SLIDE_INFO.map((s) => (
                    <option key={s.index} value={s.index} className="bg-white text-slate-800">
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center: Prev / Next Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex((c) => Math.max(0, c - 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer"
                  title="이전 슬라이드 (◀ 또는 PageUp)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">이전</span>
                </button>

                <span className="text-xs font-mono text-slate-500 px-1">
                  {currentSlideIndex + 1} <span className="text-slate-300">/</span> {totalSlides}
                </span>

                <button
                  disabled={currentSlideIndex === totalSlides - 1}
                  onClick={() => setCurrentSlideIndex((c) => Math.min(totalSlides - 1, c + 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer"
                  title="다음 슬라이드 (▶ 또는 Space 또는 PageDown)"
                >
                  <span className="hidden sm:inline">다음</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: PDF & Fullscreen Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={() => handlePrint('landscape')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                  title="발표 슬라이드 전체를 A4 가로 방향 PDF로 인쇄/저장합니다."
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A4 가로 PDF 인쇄</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                  title={isFullscreen ? '전체화면 종료 (ESC)' : '전체화면 발표 모드 (F)'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Slide Frame (16:9 ratio) */}
            <div className="w-full max-w-6xl mx-auto aspect-[16/9] min-h-[520px] rounded-2xl shadow-xl overflow-hidden border border-slate-200 bg-white">
              {renderSlideContent(currentSlideIndex)}
            </div>

            {/* Slide Jump Strip / Dots */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto text-xs">
              <span className="text-[11px] font-mono text-slate-500 shrink-0">
                슬라이드 바로가기:
              </span>
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1">
                {SLIDE_INFO.map((s) => (
                  <button
                    key={s.index}
                    onClick={() => setCurrentSlideIndex(s.index)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      currentSlideIndex === s.index
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title={s.title}
                  >
                    {s.short}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 hidden xl:inline shrink-0 font-sans">
                ⌨️ ◀ / ▶ 방향키 이동 | F 전체화면
              </span>
            </div>
          </div>

          {/* Sequential 14 Presentation Slides Deck (Visible in Print & Direct PDF Export) */}
          <div id="presentation-slides-deck" className="space-y-8 print:space-y-0">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div 
                key={idx} 
                className="ppt-slide-page w-full max-w-6xl mx-auto aspect-[16/9] min-h-[480px] sm:min-h-[580px] rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden break-inside-avoid print:border-none print:shadow-none print:rounded-none"
              >
                {renderSlideContent(idx)}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
