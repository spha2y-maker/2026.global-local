import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Bell, 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Sparkles,
  School,
  X,
  KeyRound,
  UserPlus,
  Trash2,
  Edit2,
  RefreshCw,
  Lock,
  Unlock,
  Check,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { StudentSubmission, StudentUser } from '../types';
import { 
  subscribeAllSubmissions, 
  saveStudentSubmission,
  subscribeAllStudents,
  saveOrUpdateStudent,
  resetStudentPassword,
  deleteStudentUser
} from '../services/submissionService';
import { PLACES_DATA, INITIAL_WEATHER_RECORDS } from '../data/travelData';

// Initial default class roster for Damyang Girls' Middle School
const DEFAULT_STUDENT_ROSTER: Array<{ studentId: string; name: string; school: string }> = [
  { studentId: '30101', name: '김하은', school: '담양여자중학교' },
  { studentId: '30102', name: '박소율', school: '담양여자중학교' },
  { studentId: '30103', name: '이서연', school: '담양여자중학교' },
  { studentId: '30104', name: '최지우', school: '담양여자중학교' },
  { studentId: '30105', name: '정유진', school: '담양여자중학교' },
  { studentId: '30201', name: '강민주', school: '담양여자중학교' },
  { studentId: '30202', name: '윤채원', school: '담양여자중학교' },
  { studentId: '30203', name: '송예린', school: '담양여자중학교' },
  { studentId: '30215', name: '이수민', school: '담양여자중학교' },
  { studentId: '30216', name: '한가은', school: '담양여자중학교' }
];

export const AdminDashboardView: React.FC = () => {
  // Main Admin Active Sub-Tab
  const [adminSection, setAdminSection] = useState<'submissions' | 'roster'>('submissions');

  // Submissions State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [filterSchool, setFilterSchool] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Student Roster & Password Management State
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [rosterSearch, setRosterSearch] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [passwordTargetStudent, setPasswordTargetStudent] = useState<StudentUser | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentUser | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isBulkRegistering, setIsBulkRegistering] = useState(false);

  // Form Fields
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formSchool, setFormSchool] = useState('담양여자중학교');
  const [formPassword, setFormPassword] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Toast / Alert Message
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  // 1. Subscribe to Submissions
  useEffect(() => {
    let initialLoad = true;
    const unsubscribe = subscribeAllSubmissions((list) => {
      setSubmissions(list);
      setLoadingSubmissions(false);

      if (!initialLoad && list.length > 0) {
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

  // 2. Subscribe to Students Roster
  useEffect(() => {
    const unsubscribe = subscribeAllStudents((list) => {
      setStudents(list);
      setLoadingStudents(false);
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

  const filteredStudents = students.filter((st) => {
    return st.name.includes(rosterSearch) || st.studentId.includes(rosterSearch);
  });

  // Toggle password visibility for a row
  const togglePasswordVisibility = (studentId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Quick Simulation Test Button for evaluation
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
    await saveOrUpdateStudent({
      studentId: randomId,
      name: randomName,
      school: randomSchool,
      password: randomId
    });
    showToast(`시뮬레이션 학생 [${randomName}(${randomId})] 데이터가 등록되었습니다.`);
  };

  // Open Add Student Modal
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormStudentId('');
    setFormName('');
    setFormSchool('담양여자중학교');
    setFormPassword('');
    setIsAddModalOpen(true);
  };

  // Open Edit Student Modal
  const handleOpenEditModal = (student: StudentUser) => {
    setEditingStudent(student);
    setFormStudentId(student.studentId);
    setFormName(student.name);
    setFormSchool(student.school);
    setFormPassword(student.password || student.studentId);
    setIsAddModalOpen(true);
  };

  // Save Student (Add or Edit)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId.trim() || !formName.trim()) {
      showToast('학번과 학생 이름을 모두 입력해 주세요.', 'error');
      return;
    }

    const targetPassword = formPassword.trim() || formStudentId.trim();
    const success = await saveOrUpdateStudent({
      studentId: formStudentId.trim(),
      name: formName.trim(),
      school: formSchool.trim() || '담양여자중학교',
      password: targetPassword
    });

    if (success) {
      showToast(`${formName}(${formStudentId}) 학생 정보가 저장되었습니다.`);
      setIsAddModalOpen(false);
    } else {
      showToast('학생 정보 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // Open Reset Password Modal
  const handleOpenPasswordModal = (student: StudentUser) => {
    setPasswordTargetStudent(student);
    setNewPasswordInput(student.studentId); // Default suggestion to studentId
  };

  // Execute Password Reset
  const handleExecutePasswordReset = async () => {
    if (!passwordTargetStudent || !newPasswordInput.trim()) {
      showToast('새 비밀번호를 입력해 주세요.', 'error');
      return;
    }

    const success = await resetStudentPassword(passwordTargetStudent.studentId, newPasswordInput.trim());
    if (success) {
      showToast(`${passwordTargetStudent.name}(${passwordTargetStudent.studentId}) 학생의 비밀번호가 [${newPasswordInput.trim()}]로 재설정되었습니다.`);
      setPasswordTargetStudent(null);
    } else {
      showToast('비밀번호 재설정에 실패했습니다.', 'error');
    }
  };

  // Delete Student - Trigger Confirmation Modal
  const handlePromptDeleteStudent = (student: StudentUser) => {
    setStudentToDelete(student);
  };

  // Confirm and Execute Student Deletion
  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    const target = studentToDelete;
    setIsDeletingStudent(true);

    try {
      // Optimistic UI updates
      setStudents(prev => prev.filter(s => s.studentId !== target.studentId));
      setSubmissions(prev => prev.filter(s => s.studentId !== target.studentId));

      const success = await deleteStudentUser(target.studentId);
      if (success) {
        showToast(`[${target.name} (${target.studentId})] 학생 계정과 워크북 데이터가 성공적으로 삭제되었습니다.`);
      } else {
        showToast('학생 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('학생 삭제 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeletingStudent(false);
      setStudentToDelete(null);
    }
  };

  // Bulk register initial default roster - Open Modal
  const handlePromptBulkRegister = () => {
    setIsBulkConfirmOpen(true);
  };

  // Confirm and Execute Bulk Registration
  const handleConfirmBulkRegister = async () => {
    setIsBulkRegistering(true);
    let count = 0;
    try {
      for (const item of DEFAULT_STUDENT_ROSTER) {
        const ok = await saveOrUpdateStudent({
          studentId: item.studentId,
          name: item.name,
          school: item.school,
          password: item.studentId
        });
        if (ok) count++;
      }
      showToast(`담양여자중학교 기본 학생 ${count}명이 성공적으로 등록되었습니다.`);
    } catch (err) {
      console.error('Bulk register error:', err);
      showToast('일괄 등록 중 일부 오류가 발생했습니다.', 'error');
    } finally {
      setIsBulkRegistering(false);
      setIsBulkConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Toast Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-600' 
            : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="p-1 rounded-lg hover:bg-black/20">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              <span>담양여자중학교 인솔교원 전용 관리자 관제 센터</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              학생 명단 관리 및 워크북 실시간 관제
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              학생 명단 등록, 학번별 비밀번호 재설정/초기화, 실시간 8대 방문지 인증 스탬프 제출 현황을 한곳에서 안전하게 관리할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateStudentSubmission}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold transition flex items-center gap-2 shadow-xs"
              title="실시간 알림 기능을 즉시 테스트해볼 수 있습니다."
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>+ 학생 제출 시뮬레이션</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> 등록된 학생 계정
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{students.length}명</div>
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
            <div className="text-2xl font-bold text-amber-700 font-mono mt-1">{Math.max(0, totalStudents - completedStudents)}명</div>
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

      {/* Admin Section Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setAdminSection('submissions')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            adminSection === 'submissions'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>워크북 제출 현황 관제 ({submissions.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('roster')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            adminSection === 'roster'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>학생 명단 및 비밀번호 관리 ({students.length})</span>
        </button>
      </div>

      {/* SECTION 1: WORKBOOK SUBMISSIONS */}
      {adminSection === 'submissions' && (
        <div className="space-y-4">
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
                        {loadingSubmissions ? '클라우드 데이터 불러오는 중...' : '등록된 학생 제출 내역이 없습니다. (위 시뮬레이션 버튼으로 테스트해 보세요)'}
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
        </div>
      )}

      {/* SECTION 2: STUDENT ROSTER & PASSWORD MANAGEMENT */}
      {adminSection === 'roster' && (
        <div className="space-y-4">
          
          {/* Top Actions: Add Student & Bulk Import & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>학생 개별 등록</span>
              </button>

              <button
                onClick={handlePromptBulkRegister}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                title="담양여자중학교 3학년 기본 학생 명단(10명)을 일괄 생성합니다."
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>기본 학생 명단 일괄 등록</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="학번 또는 이름 검색..."
                className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold">학번 (ID)</th>
                    <th className="p-4 font-semibold">학생 성명</th>
                    <th className="p-4 font-semibold">소속 학교</th>
                    <th className="p-4 font-semibold">현재 비밀번호</th>
                    <th className="p-4 font-semibold text-right">비밀번호 관리 & 정보 수정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        {loadingStudents 
                          ? '학생 명단을 불러오는 중...' 
                          : '등록된 학생이 없습니다. 상단의 [기본 학생 명단 일괄 등록] 버튼을 눌러 담양여중 3학년 학생들을 등록해보세요!'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const isPwdVisible = !!showPasswordMap[st.studentId];
                      const pwd = st.password || st.studentId;

                      return (
                        <tr key={st.studentId} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-bold text-emerald-800 text-sm">
                            {st.studentId}
                          </td>
                          <td className="p-4 font-bold text-slate-900 text-sm">
                            {st.name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {st.school}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 text-xs tracking-wider">
                                {isPwdVisible ? pwd : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(st.studentId)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700"
                                title={isPwdVisible ? '비밀번호 가리기' : '비밀번호 보기'}
                              >
                                {isPwdVisible ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenPasswordModal(st)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs"
                                title="비밀번호 재설정"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                                <span>비밀번호 변경</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(st)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition inline-flex items-center gap-1"
                                title="정보 수정"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>수정</span>
                              </button>

                              <button
                                onClick={() => handlePromptDeleteStudent(st)}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition"
                                title="학생 및 워크북 데이터 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add or Edit Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>{editingStudent ? '학생 정보 수정' : '신규 학생 등록'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  학번 (로그인 ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  placeholder="예: 30101"
                  disabled={!!editingStudent}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">5자리 학번 (예: 30101 - 3학년 1반 1번)</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  학생 성명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 김하은"
                  className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">소속 학교</label>
                <input
                  type="text"
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  placeholder="담양여자중학교"
                  className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {editingStudent ? '비밀번호 변경' : '초기 비밀번호 (미입력 시 학번과 동일하게 설정)'}
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={formStudentId || '1234'}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                >
                  {editingStudent ? '정보 저장' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Reset Password Modal */}
      {passwordTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>비밀번호 재설정 / 초기화</span>
              </h3>
              <button
                onClick={() => setPasswordTargetStudent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">대상 학생</span>
                <span className="font-bold text-slate-900 text-sm">
                  {passwordTargetStudent.name} <span className="font-mono text-emerald-700">({passwordTargetStudent.studentId})</span>
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">새 비밀번호 입력</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="새로운 비밀번호"
                  className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput(passwordTargetStudent.studentId)}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold"
                >
                  👉 학번({passwordTargetStudent.studentId})으로 재설정
                </button>
                <button
                  type="button"
                  onClick={() => setNewPasswordInput('1234')}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold"
                >
                  👉 1234 로 재설정
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordTargetStudent(null)}
                  className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleExecutePasswordReset}
                  className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
                >
                  비밀번호 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Student Submission Inspection Modal */}
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

      {/* Modal 4: Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">학생 계정 및 데이터 삭제</h3>
                <p className="text-xs text-rose-600 font-semibold">이 작업은 취소할 수 없습니다.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">대상 학생:</span>
                <span className="font-bold text-slate-900 text-sm">{studentToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">학번 (ID):</span>
                <span className="font-mono font-bold text-emerald-800">{studentToDelete.studentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">소속 학교:</span>
                <span className="text-slate-800">{studentToDelete.school}</span>
              </div>
              <p className="pt-2 border-t border-rose-200/60 text-slate-600 text-[11px] leading-relaxed">
                ⚠️ 해당 학생의 로그인 계정, 8대 방문지 스탬프, 성찰일지 및 제출된 워크북 데이터가 데이터베이스에서 영구적으로 삭제됩니다.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={handleConfirmDeleteStudent}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingStudent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>학생 및 데이터 영구 삭제</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Bulk Register Confirmation Modal */}
      {isBulkConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-emerald-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">담양여중 기본 명단 일괄 등록</h3>
                <p className="text-xs text-emerald-700 font-semibold">3학년 기본 명단 (10명)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="text-slate-700 leading-relaxed">
                담양여자중학교 3학년 기본 학생 명단(10명)을 일괄 생성하여 데이터베이스에 등록합니다.
              </p>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium">
                💡 <strong>초기 비밀번호 안내:</strong> 학생들의 초기 비밀번호는 <strong>각 학생의 학번(예: 30101, 30102 등)</strong>으로 자동 부여됩니다.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={isBulkRegistering}
                onClick={() => setIsBulkConfirmOpen(false)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isBulkRegistering}
                onClick={handleConfirmBulkRegister}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBulkRegistering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>등록 처리 중...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>10명 일괄 등록하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
