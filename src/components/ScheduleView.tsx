import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Utensils, 
  Compass, 
  Calendar, 
  BookOpenCheck,
  ChevronRight,
  Bus,
  Plane,
  Building2,
  Sparkles
} from 'lucide-react';

import { ShanghaiRouteMap } from './ShanghaiRouteMap';

export const ScheduleView: React.FC<{ onNavigateToPlace?: (id: string) => void }> = ({ onNavigateToPlace }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [showCurriculumMatrix, setShowCurriculumMatrix] = useState(false);

  const itineraryDays = [
    {
      day: 1,
      date: '10.13 (화)',
      title: '제1일차 : 담양 출정 & 상하이 심장부 입성',
      summary: '담양 집결 ➔ 인천공항 ➔ 상하이 푸둥공항 ➔ 남경로 보행가 ➔ 황포강 유람 & 외탄 야경',
      meals: {
        breakfast: '국내식 (출발 도시락)',
        lunch: '기내식 (국제선 항공)',
        dinner: '르네상스 호텔 샤브샤브 특식'
      },
      schedule: [
        { time: '07:00', type: 'move', title: '담양 집결 후 전용차량으로 인천공항 이동 (07:00 출발)', desc: '담양 출발(07:00), 단체 인원 점검 및 안전 교육' },
        { time: '11:00', type: 'airport', title: '인천 국제공항(제2여객터미널) 도착 & 출국 수속', desc: '항공권 발권, 수하물 위탁, 출국 심사' },
        { time: '14:00', type: 'flight', title: '인천 출발 / 상하이 푸둥공항 향발', desc: '비행 소요시간 약 2시간, 기내식 제공' },
        { time: '15:00', type: 'arrive', title: '상하이 푸둥공항 도착 후 입국수속', desc: '시차: 한국보다 1시간 느림 (-1시간), 입국심사대 영어/중국어 실습' },
        { time: '15:30', type: 'guide', title: '현지 안내원 미팅 & 전용차량 탑승', desc: '상하이 도심으로 이동하며 오리엔테이션' },
        { 
          time: '17:30', 
          type: 'spot', 
          title: '상하이 최고의 번화가 남경로 (난징둥루)', 
          desc: '100년 전 독립운동가들의 비밀 거점(영안백화점, 목은당) 탐방',
          placeId: 'nanjing_road'
        },
        { time: '18:30', type: 'meal', title: '석식 (르네상스 호텔 샤브샤브)', desc: '현지 식문화 체험 및 위생 수칙 준수' },
        { 
          time: '19:30', 
          type: 'spot', 
          title: '황포강 유람선 & 외탄(와이탄) 야경 감상', 
          desc: '근대 서양 건축군과 건너편 푸둥 마천루 감상, 1922 황포탄 의열단 투쟁 현장 고찰',
          placeId: 'waitan'
        },
        { time: '21:30', type: 'hotel', title: '호텔 투숙 & 일일 워크북 점검 및 휴식', desc: '르네상스 상하이 푸퉈 호텔' },
      ]
    },
    {
      day: 2,
      date: '10.14 (수)',
      title: '제2일차 : 불멸의 독립운동 성지와 역사의 숨결',
      summary: '루쉰공원(매헌기념관) ➔ 임시정부청사 ➔ 영사관 특강 ➔ 동방명주 ➔ 예원 옛거리',
      meals: {
        breakfast: '호텔 조식 뷔페',
        lunch: '금미로 식당 (광동요리)',
        dinner: '해녀제주식당 (한식 삼겹살)'
      },
      schedule: [
        { time: '07:00', type: 'hotel', title: '호텔 기상 및 든든한 조식', desc: '도보 탐방 복장 및 워크북 지참' },
        { 
          time: '08:00', 
          type: 'spot', 
          title: '루쉰공원 (윤봉길 의사 매헌 기념관)', 
          desc: '1932년 홍커우 공원 의거 현장 참배, <맞바꾼 회중시계> 배경지 탐구 및 추모문 작성',
          placeId: 'luxun_park'
        },
        { 
          time: '10:30', 
          type: 'spot', 
          title: '상하이 대한민국 임시정부청사 (마당로)', 
          desc: '1926~1932년 김구 선생 집무실 보존지, 헌법 법통의 성지 견학',
          placeId: 'prov_gov'
        },
        { time: '12:00', type: 'meal', title: '중식 (금미로 식당 광동요리)', desc: '중국 4대 요리 중 하나인 광동 음식 문화 체험' },
        { time: '13:30', type: 'lecture', title: '주상하이 대한민국 총영사관 외교관 특별 강연', desc: '한·중 관계의 역사와 미래, 글로벌 외교 진로 탐색' },
        { 
          time: '16:00', 
          type: 'spot', 
          title: '동방명주 타워 & 도시계획전시관', 
          desc: '468m 초고층 타워 유리전망대, 2050 미래 스마트 시티 디오라마 관람',
          placeId: 'oriental_pearl'
        },
        { time: '18:00', type: 'meal', title: '석식 (해녀제주식당 한식)', desc: '고향의 맛 삼겹살 특식' },
        { 
          time: '19:00', 
          type: 'spot', 
          title: '예원 (豫园) 및 예원 옛거리 야경 투어', 
          desc: '18년 걸쳐 부모 위해 지은 명·청 강남 정원, 담양 소쇄원 조경 철학과 비교',
          placeId: 'yu_garden'
        },
        { time: '22:00', type: 'hotel', title: '호텔 복귀 및 취침', desc: '일일 스탬프 인증 및 워크북 작성 완료' },
      ]
    },
    {
      day: 3,
      date: '10.15 (목)',
      title: '제3일차 : 미래 첨단 과학과 글로벌 문화 콘텐츠',
      summary: '상하이 과학기술관 ➔ 디즈니랜드 매직 킹덤 & 야간 일루미네이션 쇼',
      meals: {
        breakfast: '호텔 조식 뷔페',
        lunch: '하랑한식당',
        dinner: '디즈니 테마 밀쿠폰 자유식'
      },
      schedule: [
        { time: '07:00', type: 'hotel', title: '호텔 조식 후 출발 준비', desc: '활동성 높은 편안한 복장 착용' },
        { 
          time: '08:00', 
          type: 'spot', 
          title: '상하이 과학기술관 (푸둥 센추리)', 
          desc: '로봇 세상, AI 인공지능, 생명의 계곡, 기초 물리학 원리 실험',
          placeId: 'science_tech_museum'
        },
        { time: '12:00', type: 'meal', title: '중식 (하랑한식당)', desc: '오후 디즈니랜드 모둠별 미션 대비 충전' },
        { 
          time: '13:00', 
          type: 'spot', 
          title: '상하이 디즈니랜드 (Shanghai Disneyland)', 
          desc: '세계 최대 마법의 성, 트론 라이트사이클 공학 탐구, K-컬처와 글로벌 콘텐츠 현지화 비교',
          placeId: 'disneyland'
        },
        { time: '18:30', type: 'meal', title: '석식 (디즈니 테마 밀쿠폰)', desc: '테마파크 내 각 레스토랑에서 모둠별 자율 식사' },
        { time: '20:30', type: 'spot', title: '마법의 성 야간 불꽃놀이 & 미디어 프로젝션 쇼', desc: '환상적인 빛과 음악의 스토리텔링 감상' },
        { time: '22:00', type: 'hotel', title: '호텔 투숙 및 휴식', desc: '귀국 짐 정리 및 최종 워크북 완성' },
      ]
    },
    {
      day: 4,
      date: '10.16 (금)',
      title: '제4일차 : 상하이에서 담양으로, 미래를 향한 귀환',
      summary: '상하이 푸둥공항 ➔ 인천공항 ➔ 담양 도착 & 해단식',
      meals: {
        breakfast: '호텔 조식',
        lunch: '기내식 (항공기 내)',
        dinner: '담양 도착 후 국내식'
      },
      schedule: [
        { time: '07:00', type: 'hotel', title: '호텔 조식 후 체크아웃', desc: '개인 짐 및 여권, 귀중품 점검' },
        { time: '08:00', type: 'move', title: '상하이 푸둥 국제공항으로 이동', desc: '전용차량 이동' },
        { time: '09:00', type: 'airport', title: '공항 도착 후 출국 수속 및 면세점 관람', desc: '출국 심사, 탑승 게이트 이동' },
        { time: '11:35', type: 'flight', title: '상하이 푸둥공항 출발 / 인천 향발', desc: '비행 소요시간 약 1시간 55분' },
        { time: '14:30', type: 'arrive', title: '인천 국제공항 도착 후 입국 수속', desc: '수하물 수령 후 전용차량 탑승' },
        { time: '16:00', type: 'move', title: '담양으로 이동 (전용 리무진)', desc: '휴게소 경유' },
        { time: '19:30', type: 'finish', title: '담양 도착, 해단식 및 귀가', desc: '석식(국내식) 후 학부모님 인계, 탐방 종료' },
      ]
    }
  ];

  const curriculumMatrix = [
    { subject: '국어', pre: 'AI 도구 활용 상하이 방문지 웹자료 제작', field: '여행지 소개 발표 자료 수집(미션 수행)', post: '다양한 매체 자료로 여행지 발표 제작' },
    { subject: '도덕', pre: '문화를 바라보는 다양한 관점 탐구', field: '문화 상대주의적 태도로 중국 문화 체험', post: '보편 규범에 근거한 타문화·자문화 성찰' },
    { subject: '역사', pre: '상하이 독립운동의 발자취 사전 조사', field: '임시정부청사, 뤼순/루쉰공원 답사', post: '독립운동의 숭고함과 애국심 소감문' },
    { subject: '사회', pre: '상하이 경제·문화·역사적 세계 도시 특성', field: '세계적 매력 도시의 인프라·도시 구조 관찰', post: '세계 도시의 매력 요소(규모, 다양성, 역사) 정리' },
    { subject: '수학', pre: '황금비의 뜻과 생활 속 황금비 발견', field: '랜드마크 기하학적 구조 및 건축물 속 황금비', post: '황금 사각형을 이용한 나만의 명함 제작' },
    { subject: '과학', pre: '상하이 계절별 일기도 해석 및 날씨 예측', field: '탐방 기간 일자별 기온·습도·날씨 기록', post: '수질 환경과 중국 수권 특성 조사 보고서' },
    { subject: '기술가정', pre: '기후와 자연환경에 따른 주생활 문화', field: '건축물 견학 후 환경 요인 분석', post: '기후 분석 보고서 작성 및 발표' },
    { subject: '체육', pre: '건강과 신체활동 계획 세우기', field: '규칙적 걷기와 체력 관리', post: '나의 신체활동 걸음 수/점수 분석' },
    { subject: '음악', pre: '우리 음악(K-POP)이 세계에 미친 영향', field: '상하이 중심 중국 대중음악 변천 탐구', post: '음악 문화 체험기 및 소감 나누기' },
    { subject: '미술', pre: '인물화와 역사의 만남 (역사적 인물)', field: '매헌기념관 방명록 및 공간 스케치', post: '미술의 사회적 역할 살펴보기' },
    { subject: '영어', pre: '공항 및 현지 필수 영어 표현 익히기', field: '영어 입국심사 실습 및 사진 일기 쓰기', post: '영문 사후 소감문 및 에세이 작성' },
    { subject: '진로·직업', pre: '바람직한 직업 윤리 탐구', field: '글로벌 직업 세계 알아보기, 나의 각오', post: '미래 직업 윤리 토론' }
  ];

  const currentItinerary = itineraryDays.find(d => d.day === activeDay) || itineraryDays[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white border border-emerald-200/80 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <span>🎋 담양여자중학교 탐방 일정표</span>
              <span>•</span>
              <span>3박 4일 (2026. 10. 13 ~ 10. 16)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              2026. 글로컬 죽향 역사문화탐방 일정표
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
              담양의 대나무 기개와 상하이의 100년 독립운동 역사, 그리고 미래 첨단 스마트 도시를 연결하는 융합 탐방 여정입니다.
            </p>
          </div>

          <button
            onClick={() => setShowCurriculumMatrix(!showCurriculumMatrix)}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <BookOpenCheck className="w-4 h-4 text-emerald-600" />
            <span>{showCurriculumMatrix ? '일정표 보기' : '12개 교과 연계표 확인'}</span>
          </button>
        </div>

        {/* Day Selector Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
          {itineraryDays.map((d) => {
            const isSelected = activeDay === d.day;
            return (
              <button
                key={d.day}
                onClick={() => { setActiveDay(d.day); setShowCurriculumMatrix(false); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400'
                    : 'bg-white/90 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-emerald-100' : 'text-emerald-700'}`}>DAY {d.day}</span>
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{d.date}</span>
                </div>
                <div className={`text-xs sm:text-sm font-bold mt-1.5 truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {d.title.split(':')[1]?.trim() || d.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {!showCurriculumMatrix ? (
        <div className="space-y-6">
          {/* Visual Route Map */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-700 font-bold">ROUTE MAP</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">상하이 8대 탐방지 경로 지도</h3>
                <p className="text-xs text-slate-500 mt-1">지도의 핀을 클릭하면 해당 장소의 교과연계 탐구 워크북으로 바로 이동합니다.</p>
              </div>
              <MapPin className="w-6 h-6 text-emerald-600 opacity-80" />
            </div>
            <ShanghaiRouteMap onNavigateToPlace={onNavigateToPlace} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline Column (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs font-mono text-emerald-700 font-bold">DAY {currentItinerary.day} SCHEDULE</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{currentItinerary.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{currentItinerary.summary}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-700">
                  {currentItinerary.date}
                </span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-400 before:to-slate-300">
                {currentItinerary.schedule.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Dot */}
                    <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-transform group-hover:scale-125 shadow-xs ${
                      item.placeId
                        ? 'bg-emerald-600 ring-4 ring-emerald-100'
                        : item.type === 'flight' || item.type === 'airport'
                        ? 'bg-amber-500'
                        : item.type === 'meal'
                        ? 'bg-teal-500'
                        : 'bg-slate-400'
                    }`} />

                    <div className="bg-slate-50/60 hover:bg-white border border-slate-200 rounded-2xl p-4 hover:border-emerald-400 transition shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                            {item.time}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                            {item.title}
                          </h4>
                        </div>

                        {item.placeId && (
                          <button
                            onClick={() => onNavigateToPlace?.(item.placeId!)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition"
                          >
                            <span>워크북 & 스탬프</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: Meals & Highlights & Guide */}
          <div className="space-y-6">
            
            {/* Meal Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-mono font-bold uppercase tracking-wider mb-4">
                <Utensils className="w-4 h-4" />
                <span>MEAL PLAN (일자별 식단)</span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold">조식 (Breakfast)</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{currentItinerary.meals.breakfast}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold">중식 (Lunch)</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{currentItinerary.meals.lunch}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold">석식 (Dinner)</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{currentItinerary.meals.dinner}</div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <span>⚠️ 알레르기 식품이 있는 학생은 인솔 선생님께 사전 공유해 주세요.</span>
              </div>
            </div>

            {/* Travel Essentials */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Compass className="w-4 h-4" />
                <span>EXPEDITION RULES (탐방 수칙)</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">1.</span>
                  <span><strong>안전 제일:</strong> 모둠원(4~5인) 단위로 이동하며 개별 이탈 절대 금지</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">2.</span>
                  <span><strong>시차 적응:</strong> 상하이는 한국보다 1시간 느립니다. (휴대폰 자동 시각 동기화)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">3.</span>
                  <span><strong>스탬프 인증:</strong> 8대 장소마다 본인 얼굴이 포함된 사진을 촬영해 워크북에 등록</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">4.</span>
                  <span><strong>예의와 품격:</strong> 대한민국과 담양의 청소년으로서 글로벌 에티켓 실천</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
        </div>
      ) : (
        /* 12 Subjects Curriculum Cross-Matrix View */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div>
              <span className="text-xs font-mono text-emerald-700 font-bold">CROSS-CURRICULAR MATRIX</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">상하이 역사문화 탐방 교과연계 교육과정</h3>
              <p className="text-xs text-slate-500 mt-1">
                사전 교육과정(6~10월) ➔ 현지 교육과정(10월) ➔ 사후 교육과정(10~11월)으로 이어지는 체계적 12개 교과 연계
              </p>
            </div>
            <button
              onClick={() => setShowCurriculumMatrix(false)}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition font-medium"
            >
              닫기
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-3.5 font-bold text-emerald-800 w-24">교과</th>
                  <th className="p-3.5 font-bold text-slate-700">사전 교육과정 (6~10월)</th>
                  <th className="p-3.5 font-bold text-emerald-700">현지 교육과정 (10월)</th>
                  <th className="p-3.5 font-bold text-slate-700">사후 교육과정 (10~11월)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {curriculumMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{item.subject}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 leading-relaxed">{item.pre}</td>
                    <td className="p-3.5 text-emerald-800 font-medium leading-relaxed bg-emerald-50/50">{item.field}</td>
                    <td className="p-3.5 text-slate-500 leading-relaxed">{item.post}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
