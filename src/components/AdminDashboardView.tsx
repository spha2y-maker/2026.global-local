import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Bell, 
  Search, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  FileDown, 
  Sparkles,
  School,
  X
} from 'lucide-react';
import { StudentSubmission } from '../types';
import { subscribeAllSubmissions, saveStudentSubmission } from '../services/submissionService';
import { PLACES_DATA, INITIAL_WEATHER_RECORDS } from '../data/travelData';

interface AdminDashboardViewProps {
  onInspectStudent?: (submission: StudentSubmission) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onInspectStudent }) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSchool, setFilterSchool] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  useEffect(() => {
    let initialLoad = true;
    const unsubscribe = subscribeAllSubmissions((list) => {
      setSubmissions(list);
      setLoading(false);

      if (!initialLoad && list.length > 0) {
        // If a newly submitted item detected
        const topItem = list[0];
        if (topItem.isCompleted) {
          setRecentNotification(`🔔 [실시간 알림] ${topItem.school} ${topItem.studentName}(${topItem.studentId}) 학생이 8대 스탬프 워크북을 최종 제출했습니다!`);
          setTimeout(() => setRecentNotification(null), 8000);
        }
      }
      initialLoad = false;
    });

    return () => unsubscribe();
  }, []);

  const totalStudents = submissions.length;
  const completedStudents = submissions.filter(s => s.isCompleted || s.totalStamps === 8).length;

  const filteredSubmissions = submissions.filter((s) => {
    const matchesFilter =
      filterSchool === '전체' ||
      (filterSchool === '완료(8스탬프)' && (s.isCompleted || s.totalStamps === 8)) ||
      (filterSchool === '작성중' && !s.isCompleted && s.totalStamps < 8);
    const matchesSearch = s.studentName.includes(searchTerm) || s.studentId.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleSimulateStudentSubmission = async () => {
    const randomId = `30${Math.floor(Math.random() * 3 + 1)}${String(Math.floor(Math.random() * 25 + 1)).padStart(2, '0')}`;
    const sampleNames = ['박민우', '정지민', '강도현', '윤서아', '최서준', '송다은'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomSchool = '담양여자중학교';

    const mockEntries: Record<string, any> = {};
    PLACES_DATA.forEach(p => {
      mockEntries[p.id] = {
        placeId: p.id,
        photoUrl: p.image,
        stampAcquired: true,
        stampedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        reflectionText: `${p.name} 현장을 직접 보며 깊은 감동과 역사의 무게를 느꼈습니다.`
      };
    });

    const mockSubmission: StudentSubmission = {
      studentId: randomId,
      studentName: randomName,
      school: randomSchool,
      isCompleted: true,
      totalStamps: 8,
      submittedAt: new Date().toLocaleString('ko-KR'),
      updatedAt: new Date().toISOString(),
      workbookEntries: mockEntries,
      weatherRecords: INITIAL_WEATHER_RECORDS,
      bookActivity: {
        readingSummary: '윤봉길 의사의 비장한 결의와 백범의 눈물',
        clockExchangeMeaning: '남은 한 시간을 조국에 바치고 영원한 자유를 염원함',
        ifIWereHero: '두려움 속에서도 역사의 부름에 당당히 응답하겠습니다.',
        symbolismReflection: '등록문화재 시계가 가리키는 시간은 영원한 독립의 시간입니다.',
        myPromiseToFuture: '담양의 푸른 대나무처럼 바르고 곧은 인재로 성장하겠습니다.'
      }
    };

    await saveStudentSubmission(mockSubmission);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Real-time Toast Notification Banner */}
      {recentNotification && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="text-xs sm:text-sm font-bold">{recentNotification}</span>
          </div>
          <button 
            onClick={() => setRecentNotification(null)}
            className="p-1 rounded-lg hover:bg-black/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/20 to-white border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>담양여자중학교 교원 전용 관리자 관제 센터</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              학생 스탬프 인증 & 워크북 실시간 제출 현황
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              학생들이 8개 필수 방문지 스탬프를 찍고 제출하면 실시간으로 알림이 도착합니다. 학생별 인증 사진과 워크북 작성 내용을 즉시 검토하고 출력할 수 있습니다.
            </p>
          </div>

          {/* Quick Simulation Test Button for evaluation */}
          <button
            onClick={handleSimulateStudentSubmission}
            className="self-start md:self-center px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold transition flex items-center gap-2 shadow-xs"
            title="실시간 알림 기능을 즉시 테스트해볼 수 있습니다."
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>+ 학생 실시간 제출 시뮬레이션</span>
          </button>
        </div>

        {/* Metric Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> 총 등록 학생
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalStudents}명</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 8대 스탬프 완주 제출
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">{completedStudents}명</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> 작성 진행 중
            </div>
            <div className="text-2xl font-bold text-amber-700 font-mono mt-1">{totalStudents - completedStudents}명</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-teal-600" /> 제출 완료율
            </div>
            <div className="text-2xl font-bold text-teal-700 font-mono mt-1">
              {totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
            <School className="w-3.5 h-3.5 text-emerald-700" />
            담양여자중학교
          </span>
          {['전체', '완료(8스탬프)', '작성중'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSchool(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterSchool === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="학생 이름 또는 학번 검색..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Submissions List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="p-4 font-semibold">학교</th>
                <th className="p-4 font-semibold">학번</th>
                <th className="p-4 font-semibold">성명</th>
                <th className="p-4 font-semibold">스탬프 획득</th>
                <th className="p-4 font-semibold">제출 상태</th>
                <th className="p-4 font-semibold">제출 시각</th>
                <th className="p-4 font-semibold text-right">상세 검토</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {loading ? '클라우드 데이터 불러오는 중...' : '등록된 학생 제출 내역이 없습니다. (위 시뮬레이션 버튼으로 테스트해 보세요)'}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const stampCount = sub.totalStamps || (Object.values(sub.workbookEntries || {}) as any[]).filter(e => e.stampAcquired).length;
                  const isDone = sub.isCompleted || stampCount === 8;

                  return (
                    <tr key={sub.studentId} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-700 font-medium">{sub.school}</td>
                      <td className="p-4 font-mono text-emerald-700 font-bold">{sub.studentId}</td>
                      <td className="p-4 font-bold text-slate-900 text-sm">{sub.studentName}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                            stampCount === 8
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {stampCount} / 8
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 최종 제출완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            작성 중
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px] font-mono">
                        {sub.submittedAt || sub.updatedAt?.split('T')[0] || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(sub)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>워크북 검토</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 font-mono font-bold">담양여자중학교 학생 워크북 뷰어</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>{selectedStudent.studentName} 학생 워크북</span>
                  <span className="text-xs font-normal text-slate-500">({selectedStudent.school} • {selectedStudent.studentId})</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition border border-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* 8 Places Photos & Stamps Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>8대 방문지 인증 사진 및 현장 스탬프</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PLACES_DATA.map((p) => {
                    const entry = selectedStudent.workbookEntries?.[p.id];
                    return (
                      <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-800 truncate">{p.name}</div>
                        <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-200 relative">
                          {entry?.photoUrl ? (
                            <img src={entry.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                              미등록
                            </div>
                          )}
                          {entry?.stampAcquired && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[8px]">
                              스탬프✓
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate">
                          {entry?.reflectionText || '소감 미작성'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reading Activity & Reflection */}
              {selectedStudent.bookActivity && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900">&lt;맞바꾼 회중시계&gt; 독서 소감 및 다짐</h4>
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-amber-950">회중시계 교환의 의미: </strong>
                    {selectedStudent.bookActivity.clockExchangeMeaning || '내용 없음'}
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-amber-950">미래를 향한 다짐: </strong>
                    {selectedStudent.bookActivity.myPromiseToFuture || '내용 없음'}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">제출일시: {selectedStudent.submittedAt || '진행 중'}</span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition shadow-xs"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
