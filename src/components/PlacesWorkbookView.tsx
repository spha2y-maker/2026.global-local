import React, { useState } from 'react';
import { 
  MapPin, 
  BookOpen, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  Camera, 
  Sparkles,
  ExternalLink,
  History,
  PenTool,
  TableProperties
} from 'lucide-react';
import { PlaceInfo, WorkbookEntry } from '../types';
import { PLACES_DATA } from '../data/travelData';
import { CurriculumTableView } from './CurriculumTableView';

interface PlacesWorkbookViewProps {
  entries: Record<string, WorkbookEntry>;
  onUpdateEntry: (placeId: string, updated: Partial<WorkbookEntry>) => void;
  onNavigateToStamp: (placeId: string) => void;
  selectedPlaceId?: string;
}

export const PlacesWorkbookView: React.FC<PlacesWorkbookViewProps> = ({
  entries,
  onUpdateEntry,
  onNavigateToStamp,
  selectedPlaceId
}) => {
  const [subTab, setSubTab] = useState<'places' | 'curriculum_table'>('places');
  const [activePlaceId, setActivePlaceId] = useState<string>(selectedPlaceId || PLACES_DATA[0].id);

  const activePlace = PLACES_DATA.find((p) => p.id === activePlaceId) || PLACES_DATA[0];
  const activeEntry = entries[activePlace.id] || {
    placeId: activePlace.id,
    reflectionText: '',
    curriculumResponses: {},
    stampAcquired: false
  };

  const handleCurriculumAnswerChange = (subjectKey: string, value: string) => {
    const updatedResponses = {
      ...(activeEntry.curriculumResponses || {}),
      [subjectKey]: value
    };
    onUpdateEntry(activePlace.id, { curriculumResponses: updatedResponses });
  };

  const handleGeneralReflectionChange = (text: string) => {
    onUpdateEntry(activePlace.id, { reflectionText: text });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">

      {/* Top View Mode Switcher: 8 Places vs. 12-Subject Curriculum Alignment Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('places')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              subTab === 'places'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🗺️ 8대 탐방지별 워크북</span>
          </button>
          <button
            onClick={() => setSubTab('curriculum_table')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              subTab === 'curriculum_table'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>📋 12개 교과 연계표</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-bold hidden md:inline">
              수학·체육·진로
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2 px-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>담양여중 글로컬 특색 교육과정(사전-현지-사후)</span>
        </div>
      </div>

      {subTab === 'curriculum_table' ? (
        <CurriculumTableView 
          onSelectPlace={(placeId) => {
            setActivePlaceId(placeId);
            setSubTab('places');
          }} 
        />
      ) : (
        <>
          {/* 8 Places Horizontal Quick Carousel / Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">8대 탐방지 선택</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSubTab('curriculum_table')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 transition"
                >
                  <TableProperties className="w-3 h-3" />
                  <span>교과연계표 보기</span>
                </button>
                <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  {PLACES_DATA.filter(p => entries[p.id]?.stampAcquired).length} / 8 완료
                </span>
              </div>
            </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PLACES_DATA.map((place, idx) => {
            const isSelected = activePlaceId === place.id;
            const isStamped = entries[place.id]?.stampAcquired;

            return (
              <button
                key={place.id}
                onClick={() => setActivePlaceId(place.id)}
                className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">{place.emoji}</span>
                  {isStamped ? (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5 ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      ✓ 완료
                    </span>
                  ) : (
                    <span className={`text-[9px] font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>#{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2">
                  <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-emerald-100' : 'text-emerald-700 font-semibold'}`}>
                    {place.dayLabel.split(' ')[0]}
                  </div>
                  <div className={`text-xs font-bold truncate mt-0.5 transition ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-emerald-700'}`}>
                    {place.name.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Place Detail & Interactive Workbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Place In-Depth Information (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            {/* Image Header */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden">
              <img
                src={activePlace.image}
                alt={activePlace.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-mono font-bold shadow-xs">
                  {activePlace.dayLabel} • {activePlace.timeSlot}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs text-teal-300 font-medium">{activePlace.chineseName}</span>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{activePlace.name}</span>
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activePlace.location}</span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Features */}
              <div>
                <h4 className="text-xs font-mono font-bold text-emerald-700 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>방문지 특색</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activePlace.features}
                </p>
              </div>

              {/* Korea Connection */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-600" />
                  <span>우리나라 역사 및 교과와의 관련성</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activePlace.koreaConnection}
                </p>
              </div>

              {/* Historical Events List */}
              {activePlace.historicalEvents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">주요 역사적 사건 및 인물 탐구</h4>
                  {activePlace.historicalEvents.map((ev, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{ev.title}</div>
                      <div className="text-slate-600 leading-relaxed">{ev.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stamp Action Callout */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigateToStamp(activePlace.id)}
                  className={`w-full py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs ${
                    activeEntry.stampAcquired
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {activeEntry.stampAcquired ? '인증 사진 및 스탬프 확인하기' : '인증 사진 첨부하고 스탬프 찍기'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Interactive Student Workbook (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {activePlace.name} 교과연계 탐구 워크북
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 자동 동기화됨
              </span>
            </div>

            {/* Curriculum Subject-Linked Questions */}
            <div className="space-y-6">
              {activePlace.curriculumLinks.map((curric, idx) => {
                const responseKey = `${curric.subject}_${idx}`;
                const currentValue = activeEntry.curriculumResponses?.[responseKey] || '';

                return (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {curric.subject}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{curric.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-500">{curric.description}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800">{curric.guideQuestion}</span>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        value={currentValue}
                        onChange={(e) => handleCurriculumAnswerChange(responseKey, e.target.value)}
                        placeholder="이곳에 나의 생각과 모둠원과의 토론 결과를 솔직하고 구체적으로 작성해 보세요..."
                        className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </div>
                  </div>
                );
              })}

              {/* General Place Reflection */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    종합 소감
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activePlace.name} 현장 답사 총평 & 한 줄 생각
                  </h4>
                </div>
                <textarea
                  rows={3}
                  value={activeEntry.reflectionText || ''}
                  onChange={(e) => handleGeneralReflectionChange(e.target.value)}
                  placeholder="이 장소를 직접 눈으로 보고 발로 디디며 느낀 가장 강렬했던 감정이나 새로운 배움을 한 편의 글로 남겨보세요..."
                  className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>

            </div>

          </div>
        </div>

      </div>
      </>
      )}

    </div>
  );
};
