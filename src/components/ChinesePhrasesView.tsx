import React, { useState } from 'react';
import { 
  Volume2, 
  Languages, 
  Search, 
  Sparkles, 
  Bookmark, 
  AlertTriangle,
  Coffee,
  ShoppingBag,
  Compass,
  Smile
} from 'lucide-react';
import { CHINESE_PHRASES } from '../data/travelData';
import { PhraseItem } from '../types';
import { playVoice } from '../utils/speech';

export const ChinesePhrasesView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(0.85);

  const categories = ['전체', '인사/기본', '식당/음식', '길찾기/교통', '쇼핑/흥정', '긴급/호텔'];

  const filteredPhrases = CHINESE_PHRASES.filter((p) => {
    const matchesCategory = activeCategory === '전체' || p.category === activeCategory;
    const matchesSearch = 
      p.chinese.includes(searchQuery) ||
      p.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.koreanPronunciation.includes(searchQuery) ||
      p.meaning.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleSpeak = (phrase: PhraseItem) => {
    setPlayingId(phrase.id);
    playVoice(phrase.chinese, 'zh-CN', rate);
    setTimeout(() => {
      setPlayingId(null);
    }, Math.max(2000, phrase.chinese.length * 350));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-emerald-50/20 to-white border border-rose-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-mono font-bold mb-3">
              <Languages className="w-3.5 h-3.5" />
              <span>담양여자중학교 중국어 회화 워크북</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              중국 상하이 생생 여행 필수 회화
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              중국 현지에서 가장 많이 쓰이는 필수 표현 16선입니다. 
              간체자, 한어병음, 한글 발음, 뜻을 확인하고 음성 듣기 버튼을 눌러 정확한 성조를 따라 해보세요!
            </p>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl self-start md:self-center shadow-xs">
            <span className="text-xs text-slate-600 font-medium pl-1">발음 속도:</span>
            {[0.75, 0.85, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setRate(s)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition ${
                  rate === s
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="표현 또는 한글 검색..."
              className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Phrases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPhrases.map((item) => {
          const isPlaying = playingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-rose-300 transition shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
                    {item.category}
                  </span>

                  <button
                    onClick={() => handleSpeak(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                      isPlaying
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? '발음 중...' : '원어민 발음'}</span>
                  </button>
                </div>

                {/* Main Chinese Character */}
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-wide">
                  {item.chinese}
                </div>

                {/* Pinyin */}
                <div className="text-xs font-mono text-emerald-700 font-semibold mt-1">
                  {item.pinyin}
                </div>

                {/* Korean Pronunciation */}
                <div className="text-sm font-bold text-rose-700 mt-1">
                  [{item.koreanPronunciation}]
                </div>

                {/* Meaning */}
                <div className="text-xs sm:text-sm text-slate-700 mt-2 font-medium">
                  {item.meaning}
                </div>
              </div>

              {/* Tip Box */}
              {item.tip && (
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">Tip:</span>
                  <span>{item.tip}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
