import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Building2, 
  Activity, 
  Calculator, 
  GraduationCap,
  Music,
  Palette
} from 'lucide-react';
import { CURRICULUM_TABLE_DATA } from '../data/travelData';
import { CurriculumTableItem } from '../types';

interface CurriculumTableViewProps {
  onSelectPlace?: (placeId: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: '전체 교과 (12)' },
  { id: '인문사회', label: '인문·사회 (국어/도덕/역사/사회)' },
  { id: '수학과학', label: '수학·과학·기술 (수학/과학/기술가정)' },
  { id: '예체능', label: '예체능 (체육/음악/미술)' },
  { id: '외국사진로', label: '외국어·진로 (영어/진로와 직업)' },
];

export const CurriculumTableView: React.FC<CurriculumTableViewProps> = ({ onSelectPlace }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = CURRICULUM_TABLE_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preTrip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.duringTrip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.postTrip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.highlight && item.highlight.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getSubjectIcon = (id: string) => {
    switch (id) {
      case 'math':
        return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'pe':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'career':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'music':
        return <Music className="w-4 h-4 text-pink-600" />;
      case 'art':
        return <Palette className="w-4 h-4 text-rose-600" />;
      case 'history':
      case 'social':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '수학과학':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case '예체능':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case '외국사진로':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case '인문사회':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs border border-white/20">
                2026. 글로컬 죽향 역사문화탐방 교육과정
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 12개 교과 연계
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              사전·현지·사후 교육과정 교과연계표
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 max-w-2xl leading-relaxed">
              담양여자중학교의 특색 교육과정으로 사전 준비(6~10월), 현지 탐방(10월), 사후 심화(10~11월)에 걸쳐 
              수학(건물과 삼각비), 체육(건강과 신체활동), 진로탐색 등 12개 전 교과를 유기적으로 연계 운영합니다.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center shrink-0">
            <div>
              <div className="text-lg sm:text-xl font-mono font-bold text-amber-300">6~10월</div>
              <div className="text-[10px] text-white/80">사전 교육</div>
            </div>
            <div className="border-x border-white/20 px-2">
              <div className="text-lg sm:text-xl font-mono font-bold text-emerald-300">10월</div>
              <div className="text-[10px] text-white/80">현지 체험</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-mono font-bold text-sky-300">10~11월</div>
              <div className="text-[10px] text-white/80">사후 정리</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="교과명, 활동내용, 키워드 검색..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Highlighted Subject Notice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <span>수학 (입체도형과 비례)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 font-mono font-bold">쉬운 탐구</span>
            </div>
            <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
              동방명주의 독특한 11개 구(Sphere)와 기둥, 대칭 구조 및 삼각형 지지대의 안정감 등 쉬운 기하학 도형 탐색
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <span>예술 교과 (음악 & 미술)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-mono font-bold">음악·미술 연계</span>
            </div>
            <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
              디즈니랜드 영상 음악(OST) 감상, 루쉰공원 인물화(초상·조각) 및 예원 전통 조경 조형미 탐구
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <span>체육 교과 (건강과 신체활동)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-mono font-bold">신체활동 측정</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
              상하이 도보 탐방 시 일일 걸음 수 측정(15,000보 이상), 심박수 및 수분 관리, 나의 신체활동 점수 평가
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <span>진로와 직업 (진로탐색)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-mono font-bold">미래직업 탐색</span>
            </div>
            <p className="text-[11px] text-purple-800 mt-1 leading-relaxed">
              상하이 과학기술관 및 미래 신산업 현장 탐방을 통한 유망 직업인 탐색과 바람직한 직업윤리 정립
            </p>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3.5 px-4 w-28 sm:w-36">구분 (교과)</th>
                <th className="py-3.5 px-4 w-1/4">사전 교육과정<br /><span className="text-[11px] font-normal text-slate-500">(6월~10월)</span></th>
                <th className="py-3.5 px-4 w-1/3">현지 교육과정<br /><span className="text-[11px] font-normal text-slate-500">(10월 현장 답사)</span></th>
                <th className="py-3.5 px-4 w-1/4">사후 교육과정<br /><span className="text-[11px] font-normal text-slate-500">(10월~11월)</span></th>
                <th className="py-3.5 px-4 w-32">관련 탐방지</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const isSpecialSubject = row.id === 'math' || row.id === 'pe' || row.id === 'career' || row.id === 'music' || row.id === 'art';
                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-slate-50/80 transition ${
                      isSpecialSubject ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Subject Column */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5">
                        {getSubjectIcon(row.id)}
                        <span className="font-bold text-slate-900">{row.subject}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold border ${getCategoryBadgeClass(row.category)}`}>
                          {row.category}
                        </span>
                      </div>
                      {row.highlight && (
                        <div className="mt-1.5 text-[10px] text-emerald-700 font-medium font-mono">
                          ★ {row.highlight}
                        </div>
                      )}
                    </td>

                    {/* Pre-Trip Column */}
                    <td className="py-4 px-4 align-top text-slate-700 leading-relaxed">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 h-full">
                        {row.preTrip}
                      </div>
                    </td>

                    {/* During-Trip Column */}
                    <td className="py-4 px-4 align-top text-slate-900 leading-relaxed font-medium">
                      <div className={`p-2.5 rounded-xl border h-full ${
                        isSpecialSubject 
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-2xs' 
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}>
                        {row.duringTrip}
                      </div>
                    </td>

                    {/* Post-Trip Column */}
                    <td className="py-4 px-4 align-top text-slate-700 leading-relaxed">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 h-full">
                        {row.postTrip}
                      </div>
                    </td>

                    {/* Related Places */}
                    <td className="py-4 px-4 align-top text-xs">
                      <div className="text-slate-600 font-medium">
                        {row.relatedPlaces || '전 장소'}
                      </div>
                      {row.id === 'math' && onSelectPlace && (
                        <button
                          onClick={() => onSelectPlace('oriental_pearl')}
                          className="mt-2 text-[11px] text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 underline underline-offset-2"
                        >
                          동방명주 워크북 <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {row.id === 'music' && onSelectPlace && (
                        <button
                          onClick={() => onSelectPlace('disneyland')}
                          className="mt-2 text-[11px] text-pink-700 hover:text-pink-800 font-bold flex items-center gap-1 underline underline-offset-2"
                        >
                          디즈니랜드 워크북 <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {row.id === 'art' && onSelectPlace && (
                        <button
                          onClick={() => onSelectPlace('yu_garden')}
                          className="mt-2 text-[11px] text-rose-700 hover:text-rose-800 font-bold flex items-center gap-1 underline underline-offset-2"
                        >
                          예원·루쉰 워크북 <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {row.id === 'career' && onSelectPlace && (
                        <button
                          onClick={() => onSelectPlace('science_tech_museum')}
                          className="mt-2 text-[11px] text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 underline underline-offset-2"
                        >
                          과학기술관 워크북 <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {row.id === 'pe' && onSelectPlace && (
                        <button
                          onClick={() => onSelectPlace('nanjing_road')}
                          className="mt-2 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 underline underline-offset-2"
                        >
                          남경로 워크북 <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
