import React, { useState, useEffect } from 'react';
import { 
  Luggage, 
  Coins, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  RotateCcw, 
  AlertCircle, 
  Sparkles, 
  ArrowRightLeft, 
  ShoppingBag, 
  Info, 
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  detail: string;
  required: boolean;
  checked: boolean;
  isCustom?: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // 1. 필수 서류 & 신분증
  {
    id: 'doc-1',
    category: '필수 서류 & 신분증',
    name: '여권 (Passport)',
    detail: '출발일 기준 만료일이 6개월 이상 남아있는지 확인 필수!',
    required: true,
    checked: false
  },
  {
    id: 'doc-2',
    category: '필수 서류 & 신분증',
    name: '학생증 / 청소년증',
    detail: '인적사항 확인 및 공항/현장 확인용 소지',
    required: true,
    checked: false
  },
  {
    id: 'doc-3',
    category: '필수 서류 & 신분증',
    name: '중국 단체비자 사본 & E-티켓',
    detail: '인솔 선생님 지침에 따라 공항 수속 시 제시 준비',
    required: true,
    checked: false
  },
  {
    id: 'doc-4',
    category: '필수 서류 & 신분증',
    name: '비상연락망 & 여행자보험증',
    detail: '학교 인솔교사 연락처 및 비상 연락처 메모 소지',
    required: true,
    checked: false
  },

  // 2. 전자기기 & 학습 도구
  {
    id: 'elec-1',
    category: '전자기기 & 학습 도구',
    name: '보조배터리 (100Wh 이하)',
    detail: '★비행기 기내 탑승 수하물로만 가능 (위탁 수하물/화물칸 절대 금지!)',
    required: true,
    checked: false
  },
  {
    id: 'elec-2',
    category: '전자기기 & 학습 도구',
    name: '스마트폰 및 충전 케이블',
    detail: '사진 인증 및 본 모바일 학생 워크북 앱 활용',
    required: true,
    checked: false
  },
  {
    id: 'elec-3',
    category: '전자기기 & 학습 도구',
    name: '중국용 멀티 어댑터',
    detail: '중국 호텔 콘센트는 220V 2구/3구 호환되나 멀티어댑터 권장',
    required: false,
    checked: false
  },
  {
    id: 'elec-4',
    category: '전자기기 & 학습 도구',
    name: '유선/무선 이어폰',
    detail: '이동 중 영어/중국어 음성 듣기 및 차량/기내 에티켓',
    required: false,
    checked: false
  },
  {
    id: 'elec-5',
    category: '전자기기 & 학습 도구',
    name: '필기도구 및 포켓 수첩',
    detail: '현장 미션 및 생각나는 단상 즉석 메모용',
    required: false,
    checked: false
  },

  // 3. 의류 & 착용품
  {
    id: 'cloth-1',
    category: '의류 & 착용품',
    name: '편안한 운동화',
    detail: '1일 1만보 이상 도보 답사이므로 발이 편하고 익숙한 신발 필수',
    required: true,
    checked: false
  },
  {
    id: 'cloth-2',
    category: '의류 & 착용품',
    name: '가벼운 겉옷 / 바람막이',
    detail: '10월 상하이는 아침/저녁 일교차와 황포강 강바람이 쌀쌀함',
    required: true,
    checked: false
  },
  {
    id: 'cloth-3',
    category: '의류 & 착용품',
    name: '3박 4일 여벌 옷 / 속옷 / 양말',
    detail: '활동성 좋은 단정한 캐주얼 복장 및 잠옷',
    required: true,
    checked: false
  },
  {
    id: 'cloth-4',
    category: '의류 & 착용품',
    name: '접이식 소형 우산 / 양산',
    detail: '갑작스러운 소나기나 햇볕에 대비하여 가방에 상시 휴대',
    required: false,
    checked: false
  },

  // 4. 개인위생 & 세면용품
  {
    id: 'hygiene-1',
    category: '개인위생 & 세면용품',
    name: '개인 칫솔 & 치약',
    detail: '중국 상하이 시내 호텔은 일회용 어메니티 무상 제공 제한 정책 시행',
    required: true,
    checked: false
  },
  {
    id: 'hygiene-2',
    category: '개인위생 & 세면용품',
    name: '세면도구 키트 (샴푸/바디워시/클렌징)',
    detail: '개인 피부에 맞는 여행용 소형 세면용품',
    required: false,
    checked: false
  },
  {
    id: 'hygiene-3',
    category: '개인위생 & 세면용품',
    name: '휴대용 물티슈 & 미니 티슈',
    detail: '야외 식사 및 이동 시 위생 관리용',
    required: true,
    checked: false
  },
  {
    id: 'hygiene-4',
    category: '개인위생 & 세면용품',
    name: '마스크 & 선크림',
    detail: '도심 야외 활동 시 자외선 차단 및 환절기 호흡기 보호',
    required: false,
    checked: false
  },

  // 5. 상비약 & 비상용품
  {
    id: 'med-1',
    category: '상비약 & 비상용품',
    name: '멀미약 (귀밑 스티커/물약)',
    detail: '비행기 및 장시간 전용차량 이동 시 멀미 있는 학생 필수',
    required: false,
    checked: false
  },
  {
    id: 'med-2',
    category: '상비약 & 비상용품',
    name: '소화제 / 지사제 / 해열진통제',
    detail: '현지 향신료 음식 적응 및 비상 두통 대비 (소량)',
    required: false,
    checked: false
  },
  {
    id: 'med-3',
    category: '상비약 & 비상용품',
    name: '밴드 / 소독약 / 연고',
    detail: '가벼운 찰과상 응급 처치용',
    required: false,
    checked: false
  },
  {
    id: 'med-4',
    category: '상비약 & 비상용품',
    name: '개인 정기 복용약',
    detail: '평소 먹는 약이 있는 경우 넉넉하게 처방전과 함께 준비',
    required: false,
    checked: false
  },

  // 6. 기타 유용한 소지품
  {
    id: 'etc-1',
    category: '기타 유용한 소지품',
    name: '크로스백 / 가벼운 에코백',
    detail: '현장 이동 시 여권, 지갑, 물, 휴지 등 필수품을 담을 보조가방',
    required: true,
    checked: false
  },
  {
    id: 'etc-2',
    category: '기타 유용한 소지품',
    name: '중국 위안화(CNY) 소액 용돈',
    detail: '현지 간식 및 디즈니 기념품 구매용 (환전 준비)',
    required: false,
    checked: false
  },
  {
    id: 'etc-3',
    category: '기타 유용한 소지품',
    name: '개인 텀블러 / 보온병',
    detail: '물이나 따뜻한 차를 담아 다니기 유용함',
    required: false,
    checked: false
  },
  {
    id: 'etc-4',
    category: '기타 유용한 소지품',
    name: '지퍼백 / 비닐봉지 (2~3장)',
    detail: '빨랫감 분리 및 젖은 물건 보관용',
    required: false,
    checked: false
  }
];

export const TravelToolkitView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'checklist' | 'currency'>('checklist');

  // Checklist State (localStorage synced)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('damyang_packing_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CHECKLIST;
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('기타 유용한 소지품');

  useEffect(() => {
    localStorage.setItem('damyang_packing_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Currency Converter State
  const [exchangeRate, setExchangeRate] = useState<number>(195.0); // 1 CNY = 195 KRW
  const [cnyInput, setCnyInput] = useState<string>('100');
  const [krwInput, setKrwInput] = useState<string>('19500');

  // Sync CNY to KRW
  const handleCnyChange = (val: string) => {
    setCnyInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setKrwInput(Math.round(num * exchangeRate).toString());
    } else {
      setKrwInput('');
    }
  };

  // Sync KRW to CNY
  const handleKrwChange = (val: string) => {
    setKrwInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && exchangeRate > 0) {
      setCnyInput((num / exchangeRate).toFixed(2));
    } else {
      setCnyInput('');
    }
  };

  const handleRateChange = (newRate: number) => {
    setExchangeRate(newRate);
    const num = parseFloat(cnyInput);
    if (!isNaN(num)) {
      setKrwInput(Math.round(num * newRate).toString());
    }
  };

  // Checklist helpers
  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const checkAll = () => {
    setChecklist(prev => prev.map(item => ({ ...item, checked: true })));
  };

  const uncheckAll = () => {
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const resetToDefault = () => {
    if (window.confirm('체크리스트를 기본 항목으로 초기화하시겠습니까?')) {
      setChecklist(DEFAULT_CHECKLIST);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      detail: '학생 직접 추가 준비물',
      required: false,
      checked: true,
      isCustom: true
    };

    setChecklist(prev => [...prev, newItem]);
    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = checklist.length;
  const checkedItems = checklist.filter(i => i.checked).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Group by category
  const categories = Array.from(new Set(checklist.map(i => i.category)));

  // Shanghai Student Price Guide Data
  const priceGuide = [
    { name: '편의점 생수 (농푸산천 550ml)', cny: '2 ~ 3 위안', krw: '약 400 ~ 600원', emoji: '💧' },
    { name: '인기 밀크티 (이디엔디엔/나이차)', cny: '12 ~ 18 위안', krw: '약 2,300 ~ 3,500원', emoji: '🧋' },
    { name: '과일 탕후루 1꼬치 (딸기/산사나무)', cny: '10 ~ 15 위안', krw: '약 1,950 ~ 2,900원', emoji: '🍓' },
    { name: '상하이 명물 샤오롱바오 만두 (1판)', cny: '18 ~ 28 위안', krw: '약 3,500 ~ 5,500원', emoji: '🥟' },
    { name: '상하이 지하철 1회권 승차권', cny: '3 ~ 5 위안', krw: '약 600 ~ 1,000원', emoji: '🚇' },
    { name: '예원 옛거리 전통 기념품 책갈피/엽서', cny: '15 ~ 30 위안', krw: '약 3,000 ~ 5,850원', emoji: '🎋' },
    { name: '디즈니랜드 미키/미니 캐릭터 머리띠', cny: '99 ~ 129 위안', krw: '약 19,300 ~ 25,000원', emoji: '🎀' },
    { name: '디즈니랜드 캐릭터 팝콘 버킷 세트', cny: '45 ~ 65 위안', krw: '약 8,800 ~ 12,700원', emoji: '🍿' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Travel Toolkit for Damyang Students</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🧳 탐방 여행 툴킷</span>
              <span className="text-base sm:text-lg font-normal text-slate-400 font-sans">
                (준비물 체크리스트 & 환율 계산기)
              </span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              성공적인 상하이 탐방을 위한 필수 준비물을 빠짐없이 챙기고, 중국 위안화(CNY) 환율 계산과 현지 물가 상식을 익혀 똑똑한 탐방을 준비해 보세요.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveSubTab('checklist')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSubTab === 'checklist'
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Luggage className="w-4 h-4 text-emerald-600" />
              <span>준비물 체크리스트</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                {checkedItems}/{totalItems}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('currency')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSubTab === 'currency'
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>환율 & 물가 계산기</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono">
                ¥ CNY
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6">
          
          {/* Progress Card */}
          <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-md border border-emerald-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>짐 싸기 진행률</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {checkedItems === totalItems ? '🎉 모든 짐 챙기기 완료!' : `${checkedItems}개 완료 / ${totalItems}개 전체 항목`}
              </h2>
              <p className="text-xs text-emerald-100/90">
                선택한 체크 상태는 자동으로 브라우저에 저장되어 앱을 껐다 켜도 유지됩니다.
              </p>
            </div>

            <div className="w-full md:w-72 space-y-2">
              <div className="flex justify-between text-xs font-bold text-emerald-100">
                <span>달성도</span>
                <span className="font-mono text-base text-emerald-300">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-emerald-600/40">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-200">
                <button
                  onClick={checkAll}
                  className="hover:underline flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3" /> 전체 완료
                </button>
                <button
                  onClick={uncheckAll}
                  className="hover:underline flex items-center gap-1"
                >
                  <Square className="w-3 h-3" /> 전체 해제
                </button>
                <button
                  onClick={resetToDefault}
                  className="hover:underline text-emerald-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> 초기화
                </button>
              </div>
            </div>
          </div>

          {/* Airport Aviation Security Warning Banner */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-amber-900 flex items-center gap-2">
                <span>항공기 탑승 및 수하물 위탁 시 학생 주의사항 (필독!)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs sm:text-xs">
                <li><strong className="text-rose-700">보조배터리는 절대로 부치는 짐(캐리어/위탁 수하물)에 넣으시면 안 됩니다!</strong> 반드시 비행기 안으로 직접 들고 타는 배낭(기내 수하물)에 소지해야 합니다. (용량 표기 필수, 100Wh 이하)</li>
                <li>액체류(스킨, 로션, 선크림 등)는 기내 반입 시 100ml 이하 용기에 담겨야 하므로, 100ml가 넘는 큰 화장품이나 액체류는 반드시 부치는 캐리어에 넣어야 합니다.</li>
                <li>칼, 가위, 손톱깎이 등 날카로운 물품은 기내 반입이 불가하므로 캐리어(위탁 수하물)에 넣어 부치세요.</li>
              </ul>
            </div>
          </div>

          {/* Category Checklist Sections */}
          <div className="space-y-6">
            {categories.map((category) => {
              const items = checklist.filter(i => i.category === category);
              const catCompleted = items.filter(i => i.checked).length;

              return (
                <div key={category} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  
                  {/* Category Header */}
                  <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900">{category}</h3>
                      <span className="text-xs font-mono font-medium text-slate-500">
                        ({catCompleted}/{items.length})
                      </span>
                    </div>
                    {catCompleted === items.length && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        준비 완료 ✓
                      </span>
                    )}
                  </div>

                  {/* Item List */}
                  <div className="divide-y divide-slate-100 p-2 sm:p-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-start justify-between p-3.5 sm:p-4 rounded-2xl cursor-pointer transition select-none ${
                          item.checked
                            ? 'bg-emerald-50/40 text-slate-500'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="mt-0.5 shrink-0">
                            {item.checked ? (
                              <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-lg border-2 border-slate-300 hover:border-emerald-500 transition" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm sm:text-base font-bold ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {item.name}
                              </span>
                              {item.required && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  필수
                                </span>
                              )}
                              {item.isCustom && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[10px] font-medium">
                                  직접추가
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {item.detail}
                            </p>
                          </div>
                        </div>

                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Add Custom Item Form */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>나만의 준비물 직접 추가하기</span>
            </h3>
            <form onSubmit={handleAddCustomItem} className="flex flex-col sm:flex-row gap-3">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-emerald-600"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="예: 휴대용 미니 선풍기, 안대, 좋아하는 간식 등"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-emerald-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>추가하기</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: CURRENCY CONVERTER */}
      {activeSubTab === 'currency' && (
        <div className="space-y-6">
          
          {/* Main Dual Converter Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            
            {/* Header with Base Rate Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <Coins className="w-4 h-4" />
                  <span>CNY ⇄ KRW Currency Calculator</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  중국 위안화(CNY) ⇄ 한국 원화(KRW) 양방향 계산기
                </h2>
              </div>

              {/* Exchange Rate Adjustment Setting */}
              <div className="flex items-center gap-2 bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">적용 기준환율:</span>
                <span className="font-mono font-bold text-amber-800">1 CNY =</span>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg border border-amber-300 bg-white font-mono font-bold text-center text-slate-900 text-xs"
                />
                <span className="font-bold">원</span>
                <button
                  onClick={() => handleRateChange(195.0)}
                  title="기본 환율(195원)로 리셋"
                  className="p-1 hover:bg-amber-200 rounded-lg text-amber-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Bidirectional Input Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Chinese Yuan (CNY) Box */}
              <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-3 focus-within:border-emerald-500 focus-within:bg-emerald-50/20 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇨🇳</span>
                    <div>
                      <div className="text-xs font-bold text-slate-500">중국 화폐 (인민폐)</div>
                      <div className="text-sm font-black text-slate-900">위안 (CNY / 元)</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                    ¥ 위안
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 font-mono">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={cnyInput}
                    onChange={(e) => handleCnyChange(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3.5 text-2xl sm:text-3xl font-mono font-black text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-emerald-600 shadow-xs"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 self-center mr-1">빠른입력:</span>
                  {[5, 10, 20, 50, 100, 200, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => handleCnyChange(val.toString())}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 text-slate-700 text-xs font-mono font-bold transition active:scale-95"
                    >
                      ¥{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Korean Won (KRW) Box */}
              <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-3 focus-within:border-emerald-500 focus-within:bg-emerald-50/20 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇰🇷</span>
                    <div>
                      <div className="text-xs font-bold text-slate-500">대한민국 화폐</div>
                      <div className="text-sm font-black text-slate-900">원화 (KRW / ₩)</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                    ₩ 원
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 font-mono">
                    ₩
                  </span>
                  <input
                    type="number"
                    value={krwInput}
                    onChange={(e) => handleKrwChange(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3.5 text-2xl sm:text-3xl font-mono font-black text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-emerald-600 shadow-xs"
                  />
                </div>

                {/* Preset Chips for KRW */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 self-center mr-1">빠른입력:</span>
                  {[5000, 10000, 20000, 50000, 100000].map(val => (
                    <button
                      key={val}
                      onClick={() => handleKrwChange(val.toString())}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-100 hover:text-blue-900 border border-slate-200 text-slate-700 text-xs font-mono font-bold transition active:scale-95"
                    >
                      {val.toLocaleString()}원
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick Summary Pill */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs sm:text-sm text-emerald-900">
              <span className="font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>계산 결과:</span>
                <span className="font-mono text-base font-black text-emerald-700">
                  ¥ {cnyInput || '0'} 위안
                </span>
                <span>은(는) 한국 돈으로</span>
                <span className="font-mono text-base font-black text-emerald-700">
                  약 {Number(krwInput || 0).toLocaleString()} 원
                </span>
                <span>입니다.</span>
              </span>
            </div>

          </div>

          {/* Shanghai Student Price Guide */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shanghai Price Estimation</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  상하이 현지 물가 감각 익히기 (학생 맞춤 가이드)
                </h3>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                * 현지 상점 및 환율에 따라 다소 차이가 있을 수 있습니다.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {priceGuide.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                      {item.name}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <div className="text-emerald-700 font-mono font-black text-sm">
                      {item.cny}
                    </div>
                    <div className="text-slate-500 text-xs font-medium mt-0.5">
                      {item.krw}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chinese RMB Currency Knowledge Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-700" />
              <span>중국 화폐(인민폐 RMB) 알아두면 좋은 상식</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
              <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/70 space-y-1.5">
                <span className="font-bold text-amber-900 block">1. 호칭의 차이 (위안 vs 콰이)</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  공식 화폐 단위는 <strong>위안(元, Yuan)</strong>이지만, 현지 시장이나 가게에서 말할 때는 일상 구어체로 <strong>'콰이(块, Kuai)'</strong>라고 부릅니다. (예: 10위안 = 스 콰이)
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/70 space-y-1.5">
                <span className="font-bold text-amber-900 block">2. 주요 지폐 권종 색상</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>100위안(빨간색, 약 2만원)</strong>, 50위안(녹색), 20위안(갈색), 10위안(파란색), 5위안(보라색), 1위안(올리브색)입니다. 학생 용돈은 10~50위안 잔돈을 많이 준비하는 것이 편리합니다.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/70 space-y-1.5">
                <span className="font-bold text-amber-900 block">3. 현금 사용 시 주의사항</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  중국은 모바일 페이(알리페이)가 일상화되어 있어 작은 노점에서는 간혹 거스름돈이 부족할 수 있습니다. 100위안 고액권보다는 10~20위안 소액 지폐를 활용하세요.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
