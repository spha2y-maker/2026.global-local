import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Shirt, 
  Search, 
  CheckCircle2, 
  Sparkles,
  RotateCcw,
  RefreshCw,
  Info,
  Check,
  Zap,
  Navigation,
  Sun,
  Eye,
  Activity
} from 'lucide-react';
import { WeatherRecord } from '../types';
import { fetchLiveShanghaiWeather, LiveShanghaiWeather } from '../services/weatherService';

interface WeatherInvestigationViewProps {
  records: WeatherRecord[];
  onUpdateRecord: (day: number, updated: Partial<WeatherRecord>) => void;
  onResetRecords?: () => void;
  onLoadExampleRecords?: () => void;
}

export const WeatherInvestigationView: React.FC<WeatherInvestigationViewProps> = ({
  records,
  onUpdateRecord,
  onResetRecords,
  onLoadExampleRecords
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveShanghaiWeather | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [applyingLive, setApplyingLive] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [loadExamplesConfirmOpen, setLoadExamplesConfirmOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load real-time Shanghai weather on mount
  const loadLiveWeather = async () => {
    setLoadingWeather(true);
    try {
      const data = await fetchLiveShanghaiWeather();
      setLiveWeather(data);
    } catch (err) {
      console.error('Failed to load real-time weather:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadLiveWeather();
  }, []);

  // Apply real-time Shanghai weather to all 4 days in workbook
  const handleApplyRealTimeWeather = () => {
    if (!liveWeather) return;
    setApplyingLive(true);

    try {
      records.forEach((r, idx) => {
        const forecastItem = liveWeather.dailyForecasts[idx] || liveWeather.dailyForecasts[0];
        
        const morning = forecastItem ? forecastItem.tempMin : Math.round(liveWeather.temperature - 5);
        const afternoon = forecastItem ? forecastItem.tempMax : Math.round(liveWeather.temperature + 2);
        const hum = forecastItem ? forecastItem.humidity : liveWeather.humidity;
        const weatherDesc = forecastItem 
          ? `${forecastItem.weatherText} ${forecastItem.weatherEmoji}` 
          : `${liveWeather.weatherText} ${liveWeather.weatherEmoji}`;

        const daySpecificNotes = [
          `[실시간 관측 반영] 낮 최고 ${afternoon}°C / 아침 최저 ${morning}°C. 공항 및 푸시 도심 이동에 적합한 가벼운 셔츠 차림, 야간 마시청 서커스 관람 시 냉방 대비 얇은 겉옷 지참.`,
          `[실시간 관측 반영] 루자쭈이 마천루와 대한민국 임시정부 답사: 낮 최고 ${afternoon}°C. 와이탄 강바람에 대비하여 바람막이 재킷 필수, 편안한 운동화 착용.`,
          `[실시간 관측 반영] 상하이 디즈니랜드 종일 야외 활동: 자외선 차단 모자 및 통기성 좋은 복장 착용, 야간 불꽃놀이 대기 시 기온 저하(${morning}°C) 대비 보온 겉옷 준비.`,
          `[실시간 관측 반영] 루쉰공원(매헌기념관) 및 귀국일: 평균 ${hum}% 습도 고려한 쾌적한 복장, 귀국 비행기 기내 보온용 긴팔 착용 권장.`
        ];

        const daySpecificInvestigation = [
          `[실시간 기상청 위성 연동] 실시간 상하이 기온 ${liveWeather.temperature}°C, 풍속 ${liveWeather.windSpeed}km/h. 양쯔강 하구 저기압 및 동중국해 해양성 기단 영향으로 온화한 초가을 기후 관측.`,
          `[실시간 기상청 위성 연동] 황푸강 수변의 미기후(River Breeze) 효과로 내륙보다 강풍 발생, 초고층 빌딩 숲 루자쭈이의 빌딩풍과 열섬 현상(Urban Heat Island) 상호작용 분석.`,
          `[실시간 기상청 위성 연동] 넓은 야외 테마파크 부지의 일사량 증가 및 지표면 복사열 관측. 야간 방사냉각으로 인한 급격한 기온 하강 대비 필요.`,
          `[실시간 기상청 위성 연동] 상하이의 10월 계절풍(북동 계절풍 유입)과 습도(${hum}%) 변화 관측. 이동성 고기압 가장자리에 위치하여 대체로 쾌청한 시계 확보.`
        ];

        onUpdateRecord(r.day, {
          forecast: weatherDesc,
          morningTemp: morning,
          afternoonTemp: afternoon,
          humidity: hum,
          clothingNotes: daySpecificNotes[idx] || liveWeather.clothingAdvice,
          studentInvestigation: daySpecificInvestigation[idx] || liveWeather.climateAnalysis
        });
      });

      showToast(`🛰️ 실시간 상하이 현지 기후(${liveWeather.temperature}°C, ${liveWeather.weatherText})가 워크북 전체에 성공적으로 반영되었습니다!`);
    } catch (e) {
      showToast('실시간 날씨 반영 중 오류가 발생했습니다.');
    } finally {
      setApplyingLive(false);
    }
  };

  // Apply real-time data to single day
  const handleApplySingleDay = (dayNumber: number) => {
    if (!liveWeather) return;
    const idx = dayNumber - 1;
    const forecastItem = liveWeather.dailyForecasts[idx] || liveWeather.dailyForecasts[0];

    const morning = forecastItem ? forecastItem.tempMin : Math.round(liveWeather.temperature - 5);
    const afternoon = forecastItem ? forecastItem.tempMax : Math.round(liveWeather.temperature + 2);
    const hum = forecastItem ? forecastItem.humidity : liveWeather.humidity;
    const weatherDesc = forecastItem 
      ? `${forecastItem.weatherText} ${forecastItem.weatherEmoji}` 
      : `${liveWeather.weatherText} ${liveWeather.weatherEmoji}`;

    onUpdateRecord(dayNumber, {
      forecast: weatherDesc,
      morningTemp: morning,
      afternoonTemp: afternoon,
      humidity: hum,
      clothingNotes: `[실시간 연동] 실시간 기온 ${liveWeather.temperature}°C 반영. ${liveWeather.clothingAdvice}`,
      studentInvestigation: `[실시간 관측] 상하이 현지 실시간 기온 ${liveWeather.temperature}°C, 습도 ${liveWeather.humidity}%, 풍속 ${liveWeather.windSpeed}km/h 관측. ${liveWeather.climateAnalysis}`
    });

    showToast(`D${dayNumber}에 실시간 상하이 기후가 반영되었습니다.`);
  };

  const handleExecuteResetAll = () => {
    if (onResetRecords) {
      onResetRecords();
    } else {
      records.forEach((r) => {
        onUpdateRecord(r.day, {
          forecast: '',
          morningTemp: 0,
          afternoonTemp: 0,
          humidity: 0,
          clothingNotes: '',
          studentInvestigation: ''
        });
      });
    }
    setResetConfirmOpen(false);
    showToast('기후 조사 예시 답안이 초기화되었습니다. 직접 작성해보세요!');
  };

  const handleExecuteLoadExamples = () => {
    if (onLoadExampleRecords) {
      onLoadExampleRecords();
    }
    setLoadExamplesConfirmOpen(false);
    showToast('표준 예시 답안을 성공적으로 불러왔습니다.');
  };

  const handleResetSingleDay = (day: number) => {
    onUpdateRecord(day, {
      forecast: '',
      morningTemp: 0,
      afternoonTemp: 0,
      humidity: 0,
      clothingNotes: '',
      studentInvestigation: ''
    });
    showToast(`D${day} 예시 답안이 초기화되었습니다.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Real-time Shanghai Weather Observatory Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-700/40 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>상하이 현지 기상청 위성 실시간 관측소</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
              <span>{liveWeather?.recordedAt || '실시간 기상 데이터 수신 중...'}</span>
            </div>
          </div>

          {/* Real-time Weather Main Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* 1. Real-time Temperature */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" />
                <span>현재 실시간 기온</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {liveWeather ? liveWeather.temperature : '--'}
                </span>
                <span className="text-sm font-bold text-emerald-300">°C</span>
              </div>
              <div className="text-[11px] text-slate-300">
                체감온도: {liveWeather ? liveWeather.apparentTemperature : '--'}°C
              </div>
            </div>

            {/* 2. Weather Condition */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                <span>실시간 하늘 상태</span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-2xl">{liveWeather?.weatherEmoji || '🌤️'}</span>
                <span className="text-lg sm:text-xl font-bold text-white">
                  {liveWeather?.weatherText || '관측 중'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                상하이 푸둥·푸시 일대
              </div>
            </div>

            {/* 3. Humidity */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="text-xs text-teal-300 font-medium flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>상대 습도</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {liveWeather ? liveWeather.humidity : '--'}
                </span>
                <span className="text-sm font-bold text-teal-300">%</span>
              </div>
              <div className="text-[11px] text-slate-300">
                양쯔강 하구 수증기 반영
              </div>
            </div>

            {/* 4. Wind Speed */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="text-xs text-cyan-300 font-medium flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" />
                <span>풍속 (황푸강변)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {liveWeather ? liveWeather.windSpeed : '--'}
                </span>
                <span className="text-sm font-bold text-cyan-300">km/h</span>
              </div>
              <div className="text-[11px] text-slate-300">
                동중국해 연안 해풍
              </div>
            </div>
          </div>

          {/* Live Climate Analysis & Advice Note */}
          {liveWeather && (
            <div className="p-4 rounded-2xl bg-teal-900/40 border border-teal-500/30 text-xs text-teal-100 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-teal-300">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>실시간 과학적 기후 분석 & 현장 복장 가이드</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {liveWeather.climateAnalysis}
              </p>
              <div className="pt-1 text-emerald-200 font-medium flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-amber-400" />
                <span>{liveWeather.clothingAdvice}</span>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>실시간 상하이 기후 데이터를 내 워크북 4일치 항목에 즉시 채워 넣을 수 있습니다.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadLiveWeather}
                disabled={loadingWeather}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
                title="상하이 현지 최신 날씨 다시 불러오기"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin text-emerald-400' : ''}`} />
                <span>실시간 날씨 새로고침</span>
              </button>

              <button
                type="button"
                onClick={handleApplyRealTimeWeather}
                disabled={!liveWeather || applyingLive}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                title="실시간 상하이 기상 관측 데이터를 4일치 워크북에 자동 반영"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{applyingLive ? '워크북 반영 중...' : '실시간 기후 워크북에 자동 반영하기'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Workbook Header Banner */}
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 hover:border-rose-300"
              title="예시 답안을 모두 지우고 직접 작성"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>예시 답안 초기화</span>
            </button>
            <button
              onClick={() => setLoadExamplesConfirmOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              title="교과 추천 표준 예시 답안 불러오기"
            >
              <RefreshCw className="w-4 h-4" />
              <span>표준 예시 답안 불러오기</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>상단의 [실시간 기후 워크북에 자동 반영하기] 버튼을 누르면 최신 상하이 위성 관측치가 자동으로 입력됩니다.</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>실시간 자동 저장 중</span>
          </div>
        </div>
      </div>

      {/* 3. 4 Days Weather Cards Grid */}
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

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={record.forecast}
                  onChange={(e) => onUpdateRecord(record.day, { forecast: e.target.value })}
                  placeholder="예: 맑음 ☀️"
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-900 font-medium text-right focus:outline-none focus:border-emerald-500 w-28"
                />
                <button
                  type="button"
                  onClick={() => handleApplySingleDay(record.day)}
                  className="px-2 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 transition text-[11px] font-bold flex items-center gap-1"
                  title="이 날짜에 실시간 상하이 기후 관측값 반영"
                >
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>실시간 반영</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResetSingleDay(record.day)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="이 날짜 답안 초기화"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
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
                    value={record.morningTemp || ''}
                    onChange={(e) => onUpdateRecord(record.day, { morningTemp: Number(e.target.value) })}
                    placeholder="0"
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
                    value={record.afternoonTemp || ''}
                    onChange={(e) => onUpdateRecord(record.day, { afternoonTemp: Number(e.target.value) })}
                    placeholder="0"
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
                    value={record.humidity || ''}
                    onChange={(e) => onUpdateRecord(record.day, { humidity: Number(e.target.value) })}
                    placeholder="0"
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

      {/* Reset All Modal Confirmation */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">기후 조사 답안 초기화</h3>
                <p className="text-xs text-slate-500">작성한 내용을 비우고 새로 작성합니다.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              4일간의 기후 조사 예시 답안을 초기화하고 빈 양식으로 시작하시겠습니까?
            </p>
            <div className="flex items-center justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs"
              >
                초기화 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Examples Modal Confirmation */}
      {loadExamplesConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white border border-emerald-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">표준 예시 답안 불러오기</h3>
                <p className="text-xs text-slate-500">과학 교과 추천 예시</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              과학 교과 추천 표준 예시 답안(10.13 ~ 10.16 상하이 평년 및 지리적 기후 데이터)을 다시 불러오시겠습니까?
            </p>
            <div className="flex items-center justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setLoadExamplesConfirmOpen(false)}
                className="px-4 py-2 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteLoadExamples}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
              >
                불러오기 확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
