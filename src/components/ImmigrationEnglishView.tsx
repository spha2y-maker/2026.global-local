import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Plane, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  MessageSquare,
  Mic,
  RotateCcw
} from 'lucide-react';
import { IMMIGRATION_QUESTIONS } from '../data/travelData';
import { playVoice, stopVoice } from '../utils/speech';

export const ImmigrationEnglishView: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.9);
  const [activeCardId, setActiveCardId] = useState<string>(IMMIGRATION_QUESTIONS[0].id);

  const handleSpeak = (id: string, text: string) => {
    setPlayingId(id);
    playVoice(text, 'en-US', playbackSpeed);
    setTimeout(() => {
      setPlayingId(null);
    }, Math.max(2500, text.length * 90));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <Plane className="w-3.5 h-3.5" />
              <span>담양여자중학교 영어 말하기 워크북</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              공항 출입국 & 입국심사 영어 시뮬레이터
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              중국 입국 심사대에서 심사관이 가장 자주 묻는 핵심 영어 질문과 당당하고 예의 바른 답변을 원어민 음성으로 청취하고 말하기 연습을 진행하세요.
            </p>
          </div>

          {/* Audio Playback Controls */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl self-start md:self-center shadow-xs">
            <span className="text-xs text-slate-600 font-medium pl-1">재생 속도:</span>
            {[0.8, 0.9, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackSpeed(rate)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition ${
                  playbackSpeed === rate
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {IMMIGRATION_QUESTIONS.map((item, idx) => {
          const isPlayingQ = playingId === `${item.id}-q`;
          const isPlayingA = playingId === `${item.id}-a`;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-emerald-300 transition shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Officer Question */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      OFFICER QUESTION Q{idx + 1}
                    </span>
                    <button
                      onClick={() => handleSpeak(`${item.id}-q`, item.question)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        isPlayingQ
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingQ ? '재생 중...' : '질문 듣기'}</span>
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-snug">
                    "{item.question}"
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.koreanMeaning}
                  </div>
                </div>

                {/* Student Answer */}
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      STUDENT ANSWER
                    </span>
                    <button
                      onClick={() => handleSpeak(`${item.id}-a`, item.sampleAnswer)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        isPlayingA
                          ? 'bg-emerald-700 text-white animate-pulse'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingA ? '재생 중...' : '답변 듣기'}</span>
                    </button>
                  </div>
                  <div className="text-sm font-bold text-emerald-950 leading-snug">
                    "{item.sampleAnswer}"
                  </div>
                  <div className="text-xs text-slate-600">
                    {item.answerKorean}
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong className="text-amber-950">입국 꿀팁:</strong> {item.tips}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
