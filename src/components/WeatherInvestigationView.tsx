import React from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Shirt, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Compass
} from 'lucide-react';
import { WeatherRecord } from '../types';

interface WeatherInvestigationViewProps {
  records: WeatherRecord[];
  onUpdateRecord: (day: number, updated: Partial<WeatherRecord>) => void;
}

export const WeatherInvestigationView: React.FC<WeatherInvestigationViewProps> = ({
  records,
  onUpdateRecord
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <CloudSun className="w-3.5 h-3.5" />
              <span>담양여자중학교 과학·기술가정 융합 탐구</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              상하이 3박 4일 탐방 일자별 기후 조사 워크북
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              상하이의 계절별 일기도와 지리적 특성(양쯔강 하구, 해양성 기후)을 바탕으로 탐방 기간(10.13 ~ 10.16)의 날씨를 조사하고, 현장 관측 기록 및 건강한 옷차림 대책을 작성하세요.
            </p>
          </div>
          <div className="text-xs text-emerald-800 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="font-mono font-medium">실시간 자동 동기화 지원</span>
          </div>
        </div>
      </div>

      {/* 4 Days Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((record) => (
          <div
            key={record.day}
            className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-emerald-300 transition shadow-xs space-y-5"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center text-sm border border-emerald-200">
                  D{record.day}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{record.date}</h3>
                  <div className="text-xs text-emerald-700 font-mono font-semibold">{record.city}</div>
                </div>
              </div>

              <input
                type="text"
                value={record.forecast}
                onChange={(e) => onUpdateRecord(record.day, { forecast: e.target.value })}
                placeholder="예: 맑음 ☀️"
                className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs text-slate-900 font-medium text-right focus:outline-none focus:border-emerald-500 w-32"
              />
            </div>

            {/* Temperature & Humidity Sensors Widget */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
                  <Thermometer className="w-3 h-3 text-emerald-600" /> 최저/아침
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    type="number"
                    value={record.morningTemp}
                    onChange={(e) => onUpdateRecord(record.day, { morningTemp: Number(e.target.value) })}
                    className="w-12 bg-transparent text-center font-mono font-bold text-emerald-700 text-lg focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">°C</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
                  <Thermometer className="w-3 h-3 text-rose-500" /> 최고/낮
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    type="number"
                    value={record.afternoonTemp}
                    onChange={(e) => onUpdateRecord(record.day, { afternoonTemp: Number(e.target.value) })}
                    className="w-12 bg-transparent text-center font-mono font-bold text-rose-600 text-lg focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">°C</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
                  <Droplets className="w-3 h-3 text-teal-600" /> 평균 습도
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    type="number"
                    value={record.humidity}
                    onChange={(e) => onUpdateRecord(record.day, { humidity: Number(e.target.value) })}
                    className="w-12 bg-transparent text-center font-mono font-bold text-teal-700 text-lg focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* Clothing Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-amber-600" />
                <span>추천 복장 및 개인 건강 대책</span>
              </label>
              <textarea
                rows={2}
                value={record.clothingNotes}
                onChange={(e) => onUpdateRecord(record.day, { clothingNotes: e.target.value })}
                placeholder="일교차와 야외 활동(강바람, 디즈니랜드 야간 등)을 고려한 복장 메모..."
                className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Student Science Investigation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>기후·일기도 조사 및 현장 관측 분석 (과학 연계)</span>
              </label>
              <textarea
                rows={3}
                value={record.studentInvestigation}
                onChange={(e) => onUpdateRecord(record.day, { studentInvestigation: e.target.value })}
                placeholder="기압 배치, 계절풍, 마천루 열섬 현상, 황포강 수변 미기후 등 과학적 관측 내용을 기록하세요..."
                className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
