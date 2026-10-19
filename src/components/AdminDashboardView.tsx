import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  BookHeart,
  Calendar,
  CloudSun,
  FileText,
  Upload,
  RotateCcw
} from 'lucide-react';
import { StudentSubmission, StudentUser } from '../types';
import { 
  subscribeAllSubmissions, 
  saveStudentSubmission,
  subscribeAllStudents,
  saveOrUpdateStudent,
  resetStudentPassword,
  deleteStudentUser,
  getCachedStudentRoster,
  restoreDefaultStudentRoster,
  DEFAULT_STUDENT_ROSTER_ITEMS
} from '../services/submissionService';
import { PLACES_DATA, INITIAL_WEATHER_RECORDS } from '../data/travelData';

// Initial default class roster for Damyang Girls' Middle School
const DEFAULT_STUDENT_ROSTER = DEFAULT_STUDENT_ROSTER_ITEMS;

export const AdminDashboardView: React.FC = () => {
  // Main Admin Active Sub-Tab
  const [adminSection, setAdminSection] = useState<'submissions' | 'roster'>('submissions');

  // Submissions State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const cached = localStorage.getItem('damyang_submissions_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [filterSchool, setFilterSchool] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [modalTab, setModalTab] = useState<'workbook' | 'reflections' | 'weather'>('workbook');
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Student Roster & Password Management State - Instant load from cache (0ms)
  const [students, setStudents] = useState<StudentUser[]>(() => getCachedStudentRoster());
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isRefreshingRoster, setIsRefreshingRoster] = useState(false);
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
  const [isBatchPasteModalOpen, setIsBatchPasteModalOpen] = useState(false);
  const [batchPasteText, setBatchPasteText] = useState('');
  const [isBatchParsing, setIsBatchParsing] = useState(false);

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

    // Safety timeout: ensure loading turns off after 1.5s
    const timer = setTimeout(() => {
      setLoadingSubmissions(false);
      setLoadingStudents(false);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // 2. Subscribe to Students Roster
  useEffect(() => {
    const unsubscribe = subscribeAllStudents((list) => {
      setStudents(list);
      setLoadingStudents(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshingRoster(true);
    subscribeAllStudents((list) => {
      setStudents(list);
      setIsRefreshingRoster(false);
      showToast('학생 명단이 최신 상태로 새로고침되었습니다.');
    });
    setTimeout(() => {
      setIsRefreshingRoster(false);
    }, 1200);
  };

  // Merge full student roster with cloud submissions so all enrolled students appear instantly with their current progress
  const mergedSubmissionsList: StudentSubmission[] = useMemo(() => {
    const subMap = new Map<string, StudentSubmission>();
    submissions.forEach((s) => subMap.set(s.studentId, s));

    const result: StudentSubmission[] = [];
    const seen = new Set<string>();

    students.forEach((st) => {
      seen.add(st.studentId);
      const sub = subMap.get(st.studentId);
      if (sub) {
        result.push(sub);
      } else {
        result.push({
          studentId: st.studentId,
          studentName: st.name,
          school: st.school || '담양여자중학교',
          isCompleted: false,
          totalStamps: 0,
          updatedAt: st.createdAt || '',
          workbookEntries: {},
          weatherRecords: [],
          dailyReflections: []
        });
      }
    });

    // Also include any submissions not in student roster
    submissions.forEach((s) => {
      if (!seen.has(s.studentId)) {
        result.push(s);
      }
    });

    return result;
  }, [students, submissions]);

  const totalStudents = mergedSubmissionsList.length;
  const completedStudents = mergedSubmissionsList.filter(s => s.isCompleted || (s.totalStamps || 0) === 8).length;

  const filteredSubmissions = mergedSubmissionsList.filter((s) => {
    const stampCount = s.totalStamps || (Object.values(s.workbookEntries || {}) as any[]).filter(e => e.stampAcquired).length;
    const isDone = s.isCompleted || stampCount === 8;
    const hasStarted = stampCount > 0 || (Object.values(s.workbookEntries || {}) as any[]).some(e => e.reflectionText || Object.keys(e.curriculumResponses || {}).length > 0) || (s.dailyReflections && s.dailyReflections.some(r => r.memorableScene?.trim()));

    const matchesFilter =
      filterSchool === '전체' ||
      (filterSchool === '완료(8스탬프)' && isDone) ||
      (filterSchool === '작성중' && !isDone && hasStarted);
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
        curriculumResponses: {}
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
      weatherRecords: INITIAL_WEATHER_RECORDS
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
    const cleanId = formStudentId.trim();
    const cleanName = formName.trim();
    const cleanSchool = formSchool.trim() || '담양여자중학교';
    const targetPassword = formPassword.trim() || cleanId;

    if (!cleanId || !cleanName) {
      showToast('학번과 학생 이름을 모두 입력해 주세요.', 'error');
      return;
    }

    const success = await saveOrUpdateStudent({
      studentId: cleanId,
      name: cleanName,
      school: cleanSchool,
      password: targetPassword
    });

    if (success) {
      // Optimistic update of students state
      setStudents(prev => {
        const next = [...prev.filter(s => s.studentId !== cleanId), {
          studentId: cleanId,
          name: cleanName,
          school: cleanSchool,
          password: targetPassword,
          role: 'student' as const,
          updatedAt: new Date().toISOString()
        }];
        next.sort((a, b) => a.studentId.localeCompare(b.studentId));
        return next;
      });

      showToast(`[${cleanName} (${cleanId})] 학생 정보가 성공적으로 등록 및 동기화되었습니다.`);
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

    const targetId = passwordTargetStudent.studentId;
    const newPwd = newPasswordInput.trim();
    const success = await resetStudentPassword(targetId, newPwd);

    if (success) {
      setStudents(prev => prev.map(s => s.studentId === targetId ? { ...s, password: newPwd } : s));
      showToast(`${passwordTargetStudent.name}(${targetId}) 학생의 비밀번호가 [${newPwd}]로 재설정되었습니다.`);
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

  // Confirm and Execute Bulk Registration & Restoration
  const handleConfirmBulkRegister = async () => {
    setIsBulkRegistering(true);
    try {
      const restored = await restoreDefaultStudentRoster();
      setStudents(restored);
      showToast(`담양여자중학교 기본 학생 ${restored.length}명이 성공적으로 복원 및 등록되었습니다.`);
    } catch (err) {
      console.error('Bulk register error:', err);
      showToast('일괄 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsBulkRegistering(false);
      setIsBulkConfirmOpen(false);
    }
  };

  // Batch register pasted student list (from Excel or text file)
  const handleBatchPasteRegister = async () => {
    if (!batchPasteText.trim()) {
      showToast('등록할 학생 명단 텍스트를 입력해 주세요.', 'error');
      return;
    }
    setIsBatchParsing(true);
    const lines = batchPasteText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let successCount = 0;
    const addedStudents: StudentUser[] = [];

    for (const line of lines) {
      // Split by tab, comma, or whitespace
      let parts = line.split(/[\t,]+/).map(p => p.trim());
      if (parts.length === 1) {
        parts = line.split(/\s+/).map(p => p.trim());
      }
      if (parts.length >= 2) {
        const sid = parts[0];
        const sname = parts[1];
        const sschool = parts[2] || '담양여자중학교';
        const spassword = parts[3] || sid;

        if (sid && sname) {
          const ok = await saveOrUpdateStudent({
            studentId: sid,
            name: sname,
            school: sschool,
            password: spassword
          });
          if (ok) {
            successCount++;
            addedStudents.push({
              studentId: sid,
              name: sname,
              school: sschool,
              password: spassword,
              role: 'student'
            });
          }
        }
      }
    }

    if (successCount > 0) {
      setStudents(prev => {
        const map = new Map<string, StudentUser>();
        prev.forEach(s => map.set(s.studentId, s));
        addedStudents.forEach(s => map.set(s.studentId, s));
        const list = Array.from(map.values());
        list.sort((a, b) => a.studentId.localeCompare(b.studentId));
        return list;
      });
      showToast(`${successCount}명의 학생이 성공적으로 일괄 등록되었습니다.`);
      setBatchPasteText('');
      setIsBatchPasteModalOpen(false);
    } else {
      showToast('인식 가능한 학생 정보가 없습니다. (형식: "학번 성명" 예: 30101 김하은)', 'error');
    }
    setIsBatchParsing(false);
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
                    <th className="p-4 font-semibold">성찰일지 (4일간)</th>
                    <th className="p-4 font-semibold">제출/작성 상태</th>
                    <th className="p-4 font-semibold">동기화 시각</th>
                    <th className="p-4 font-semibold text-right">상세 검토</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        {loadingSubmissions ? '클라우드 데이터 불러오는 중...' : '등록된 학생 제출 내역이 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const stampCount = sub.totalStamps || (Object.values(sub.workbookEntries || {}) as any[]).filter(e => e.stampAcquired).length;
                      const isDone = sub.isCompleted || stampCount === 8;
                      const reflectionCount = (sub.dailyReflections || []).filter(
                        (r) => r.memorableScene?.trim() || r.biggestEmotion?.trim() || r.newlyLearned?.trim()
                      ).length;

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
                                  : stampCount > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                {stampCount} / 8
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] inline-flex items-center gap-1 ${
                              reflectionCount >= 4
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : reflectionCount > 0
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              <BookHeart className="w-3 h-3 text-purple-600" />
                              {reflectionCount} / 4일
                            </span>
                          </td>
                          <td className="p-4">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 최종 제출완료
                              </span>
                            ) : stampCount > 0 || reflectionCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                작성 중
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                미작성
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-500 text-[11px] font-mono">
                            {sub.submittedAt || sub.updatedAt?.split('T')[0] || '-'}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedStudent(sub);
                                setModalTab('workbook');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>워크북 & 성찰일지 검토</span>
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
          
          {/* Top Actions: Add Student & Bulk Import & Refresh & Search */}
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
                onClick={() => setIsBatchPasteModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                title="엑셀이나 텍스트에서 학생 명단을 복사해 한번에 붙여넣어 일괄 등록합니다."
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>명단 일괄 등록 (엑셀 붙여넣기)</span>
              </button>

              <button
                onClick={handlePromptBulkRegister}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                title="담양여자중학교 3학년 기본 학생 명단(10명)을 복원 및 등록합니다."
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>기본 10명 명단 복원</span>
              </button>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshingRoster}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                title="서버와 로컬에서 학생 명단을 즉시 다시 동기화합니다."
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRoster ? 'animate-spin text-emerald-600' : ''}`} />
                <span>명단 새로고침</span>
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
                <span className="text-xs text-emerald-700 font-mono font-bold">담양여자중학교 학생 워크북 & 성찰일지 뷰어</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>{selectedStudent.studentName} 학생 종합 기록부</span>
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

            {/* Modal Section Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 gap-2">
              <button
                type="button"
                onClick={() => setModalTab('workbook')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  modalTab === 'workbook'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>8대 방문지 워크북 & 스탬프 ({selectedStudent.totalStamps || 0}/8)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('reflections')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  modalTab === 'reflections'
                    ? 'border-purple-600 text-purple-900 bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookHeart className="w-3.5 h-3.5 text-purple-600" />
                <span>오늘의 성찰일지 (4일간)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono font-bold">
                  {(selectedStudent.dailyReflections || []).filter(r => r.memorableScene?.trim()).length}/4
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('weather')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  modalTab === 'weather'
                    ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CloudSun className="w-3.5 h-3.5 text-blue-600" />
                <span>상하이 기후 조사</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* TAB 1: WORKBOOK & STAMPS */}
              {modalTab === 'workbook' && (
                <>
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
                            <div className="font-bold text-slate-800 truncate" title={p.name}>{p.name}</div>
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
                              {entry?.stampAcquired ? `스탬프 완료 (${entry.stampedAt || '인증'})` : '스탬프 미인증'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curriculum Subject Exploration Review */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>8대 방문지 교과연계 탐구 기록 검토</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {PLACES_DATA.map((p) => {
                        const entry = selectedStudent.workbookEntries?.[p.id];
                        return (
                          <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                              <span title={p.name}>{p.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{p.dayLabel}</span>
                            </div>
                            <div className="space-y-1.5">
                              {p.curriculumLinks.map((link, cIdx) => {
                                const respKey = `${link.subject}_${cIdx}`;
                                const ans = entry?.curriculumResponses?.[respKey] || '';
                                return (
                                  <div key={cIdx} className="text-[11px] bg-white p-2 rounded-xl border border-slate-200/60">
                                    <span className="font-bold text-emerald-800">[{link.subject}] {link.title}</span>
                                    <p className="text-slate-700 mt-0.5 leading-relaxed">{ans || '(답변 미작성)'}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: DAILY REFLECTIONS (오늘의 성찰일지 4일간) */}
              {modalTab === 'reflections' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-purple-950 text-sm flex items-center gap-2">
                        <BookHeart className="w-4 h-4 text-purple-600" />
                        <span>학생 일자별 성찰일지 (제1일차 ~ 제4일차) 검토</span>
                      </h4>
                      <p className="text-purple-700 text-[11px] mt-0.5">
                        학생이 상하이 탐방 현장에서 매일 일과를 마친 후 작성한 생각과 느낀 점을 검토합니다.
                      </p>
                    </div>
                  </div>

                  {[1, 2, 3, 4].map((dayNum) => {
                    const dayLabels: Record<number, { date: string; title: string; route: string }> = {
                      1: { date: '2026. 10. 13 (화)', title: '담양 출정 & 상하이 심장부 입성', route: '인천공항 ➔ 상하이 푸둥 ➔ 남경로 보행가 ➔ 마시청 서커스 ➔ 외탄 야경' },
                      2: { date: '2026. 10. 14 (수)', title: '불멸의 독립운동 성지와 역사의 숨결', route: '루쉰공원(매헌기념관) ➔ 상하이 임시정부청사 ➔ 영사관 ➔ 동방명주 ➔ 예원' },
                      3: { date: '2026. 10. 15 (목)', title: '미래 첨단 과학과 글로벌 문화 콘텐츠', route: '상하이 과학기술관 ➔ 상하이 디즈니랜드 매직 킹덤 & 불꽃놀이' },
                      4: { date: '2026. 10. 16 (금)', title: '글로벌 리더의 다짐 & 담양 귀환', route: '상하이 푸둥공항 출국 ➔ 인천공항 ➔ 담양 귀환 및 해단식' }
                    };

                    const dayInfo = dayLabels[dayNum];
                    const ref = (selectedStudent.dailyReflections || []).find(r => r.day === dayNum);
                    const isWritten = !!(ref?.memorableScene?.trim() || ref?.biggestEmotion?.trim() || ref?.newlyLearned?.trim());

                    return (
                      <div key={dayNum} className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-mono font-bold text-xs">
                              DAY {dayNum}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{dayInfo.title}</span>
                            <span className="text-slate-500 text-[11px] font-mono">({dayInfo.date})</span>
                          </div>
                          <div>
                            {isWritten ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 성찰일지 작성완료
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">
                                미작성
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium">
                          📍 주요 여정: {dayInfo.route}
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-1">
                          {/* 1. Memorable Scene */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-purple-900">
                              <span>📸</span>
                              <span>오늘 가장 기억에 남는 장면이나 장소</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap pl-5 text-[11px]">
                              {ref?.memorableScene?.trim() || <span className="text-slate-400 italic">(학생이 아직 내용을 작성하지 않았습니다)</span>}
                            </p>
                          </div>

                          {/* 2. Biggest Emotion */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-rose-900">
                              <span>💖</span>
                              <span>오늘 느낀 가장 큰 감정이나 생각</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap pl-5 text-[11px]">
                              {ref?.biggestEmotion?.trim() || <span className="text-slate-400 italic">(학생이 아직 내용을 작성하지 않았습니다)</span>}
                            </p>
                          </div>

                          {/* 3. Newly Learned */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-amber-900">
                              <span>💡</span>
                              <span>오늘 새롭게 알게 되거나 깨달은 점</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap pl-5 text-[11px]">
                              {ref?.newlyLearned?.trim() || <span className="text-slate-400 italic">(학생이 아직 내용을 작성하지 않았습니다)</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: WEATHER INVESTIGATION */}
              {modalTab === 'weather' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                    <h4 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                      <CloudSun className="w-4 h-4 text-blue-600" />
                      <span>학생 4일간 상하이 기후 및 기상 탐구 기록</span>
                    </h4>
                    <p className="text-blue-700 text-[11px] mt-0.5">
                      탐방 기간 동안 학생이 조사하고 기록한 상하이 날씨, 기온, 습도 및 탐구 내용입니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedStudent.weatherRecords && selectedStudent.weatherRecords.length > 0
                      ? selectedStudent.weatherRecords
                      : INITIAL_WEATHER_RECORDS
                    ).map((w, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-bold text-slate-900">제{w.day}일차 ({w.date})</span>
                          <span className="text-blue-700 font-mono font-bold">{w.city} • {w.forecast || '예보'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block">오전 기온</span>
                            <span className="font-bold text-slate-800">{w.morningTemp}°C</span>
                          </div>
                          <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block">오후 기온</span>
                            <span className="font-bold text-slate-800">{w.afternoonTemp}°C</span>
                          </div>
                          <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block">습도</span>
                            <span className="font-bold text-slate-800">{w.humidity}%</span>
                          </div>
                        </div>
                        {w.clothingNotes && (
                          <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                            <span className="font-bold text-slate-700">추천 복장: </span>
                            <span className="text-slate-600">{w.clothingNotes}</span>
                          </div>
                        )}
                        <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                          <span className="font-bold text-slate-800 block mb-0.5">학생 기후 탐구 관찰 소감:</span>
                          <p className="text-slate-600 leading-relaxed">
                            {w.studentInvestigation || '(학생 탐구 기록 미작성)'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* Modal 6: Batch Paste Roster Modal */}
      {isBatchPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-indigo-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">학생 명단 일괄 등록</h3>
                  <p className="text-xs text-indigo-600 font-semibold">엑셀 / 텍스트 복사 붙여넣기</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchPasteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 leading-relaxed">
                <p className="font-semibold mb-1">📋 입력 안내:</p>
                <p className="text-slate-600 text-[11px]">
                  엑셀(Excel)이나 한글 문서의 학번과 이름 열을 복사하여 아래에 붙여넣으세요. 공백이나 쉼표, 탭 구분자를 자동으로 인식합니다.
                </p>
                <div className="mt-2 font-mono text-[11px] bg-white p-2 rounded-xl border border-indigo-200 text-slate-700">
                  30101 김하은<br />
                  30102 박소율<br />
                  30103 이서연
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  명단 텍스트 붙여넣기 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={batchPasteText}
                  onChange={(e) => setBatchPasteText(e.target.value)}
                  placeholder={`30101 김하은\n30102 박소율\n30103 이서연`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {batchPasteText.split(/\r?\n/).filter(l => l.trim()).length}줄 감지됨
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isBatchParsing}
                  onClick={() => setIsBatchPasteModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={isBatchParsing || !batchPasteText.trim()}
                  onClick={handleBatchPasteRegister}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isBatchParsing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>명단 등록 중...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>명단 일괄 등록하기</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
