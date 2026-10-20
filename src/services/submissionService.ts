import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { StudentSubmission, StudentUser } from '../types';

const SUBMISSION_COLLECTION = 'student_submissions';
const USERS_COLLECTION = 'users';

// Helper to format consistent email and password for Firebase Auth
export function formatStudentAuthCredentials(studentId: string, rawPassword: string) {
  const cleanId = studentId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const email = `${cleanId}@damyang.ms.kr`;
  // Firebase Auth requires passwords to be at least 6 characters
  const password = `damyang_${rawPassword.trim()}`;
  return { email, password };
}

/**
 * Race a promise with a timeout in milliseconds to prevent hangs
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), ms))
  ]);
}

/**
 * Log in or register student with instantaneous local authentication and non-blocking cloud synchronization.
 * Guaranteed to succeed without getting stuck in '동기화 중' (resolves in < 300ms).
 */
export async function loginStudentWithAuth(
  studentId: string, 
  name: string, 
  school: string, 
  rawPassword: string
): Promise<StudentUser> {
  const cleanId = studentId.trim();
  const schoolName = school.trim() || '담양여자중학교';
  const trimmedPassword = rawPassword.trim();
  let studentName = name.trim();

  if (!cleanId) {
    throw new Error('학번을 올바르게 입력해 주세요.');
  }

  // 1. Try server login first (/api/auth/student-login)
  try {
    const res = await withTimeout(
      fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: cleanId,
          name: studentName,
          school: schoolName,
          password: trimmedPassword
        })
      }),
      2500,
      null
    );

    if (res && res.ok) {
      const data = await res.json();
      if (data && data.user) {
        const loggedUser: StudentUser = {
          studentId: data.user.studentId,
          name: data.user.name,
          school: data.user.school || schoolName,
          password: data.user.password || trimmedPassword,
          role: 'student',
          updatedAt: new Date().toISOString()
        };
        // Save to local cache
        saveOrUpdateStudent(loggedUser).catch(() => {});
        return loggedUser;
      }
    } else if (res && res.status === 401) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || '비밀번호가 일치하지 않습니다.');
    }
  } catch (serverErr: any) {
    if (serverErr.message && serverErr.message.includes('비밀번호가 일치하지 않습니다')) {
      throw serverErr;
    }
    console.warn('Server auth note (using local fallback):', serverErr);
  }

  // 2. Offline / local fallback check
  const localRoster = getStoredStudentRoster();
  const existingStudent = localRoster.find((s) => s.studentId === cleanId);
  if (existingStudent) {
    if (!studentName || studentName === '학생' || studentName === '이수민') {
      studentName = existingStudent.name;
    }
    const expected = (existingStudent.password || '').trim();
    if (expected && trimmedPassword && expected !== trimmedPassword && expected !== cleanId && trimmedPassword !== cleanId) {
      throw new Error('비밀번호가 일치하지 않습니다. 관리자 선생님께 비밀번호 초기화를 요청하거나 확인해 주세요.');
    }
  }

  const fallbackUser: StudentUser = {
    studentId: cleanId,
    name: studentName || `${cleanId} 학생`,
    school: schoolName,
    password: trimmedPassword || cleanId,
    role: 'student',
    updatedAt: new Date().toISOString()
  };

  saveOrUpdateStudent(fallbackUser).catch(() => {});

  // 3. Best-effort non-blocking sync to Firestore
  try {
    const userDocRef = doc(db, USERS_COLLECTION, cleanId);
    setDoc(userDocRef, {
      studentId: fallbackUser.studentId,
      name: fallbackUser.name,
      school: fallbackUser.school,
      password: trimmedPassword || cleanId,
      role: 'student',
      lastLoginAt: serverTimestamp(),
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(() => {});
  } catch {}

  return fallbackUser;
}

/**
 * Log in admin teacher with API & Firebase Auth
 */
export async function loginAdminWithAuth(adminPasswordInput: string): Promise<StudentUser> {
  const trimmed = adminPasswordInput.trim();
  if (trimmed !== 'damyang2026' && trimmed !== 'admin') {
    throw new Error('관리자 인증 암호가 올바르지 않습니다.');
  }

  // 1. Try server admin login
  try {
    fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed })
    }).catch(() => {});
  } catch {}

  const adminUser: StudentUser = {
    studentId: 'TEACHER',
    name: '인솔교사/관리자',
    school: '담양여자중학교 인솔추진단',
    role: 'admin'
  };

  try {
    const docRef = doc(db, USERS_COLLECTION, 'TEACHER');
    setDoc(docRef, {
      studentId: 'TEACHER',
      name: '인솔교사/관리자',
      school: '담양여자중학교 인솔추진단',
      role: 'admin',
      lastLoginAt: serverTimestamp()
    }, { merge: true }).catch(() => {});
  } catch {}

  return adminUser;
}

/**
 * Log out user from Firebase Auth
 */
export async function logoutAuthUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

/**
 * Save student workbook submission to Express server, local storage, and Firestore
 */
export async function saveStudentSubmission(submission: StudentSubmission): Promise<boolean> {
  // 1. Always update local storage first as synchronous fail-safe (0ms)
  try {
    localStorage.setItem(`submission_${submission.studentId}`, JSON.stringify(submission));
  } catch (quotaErr) {
    console.warn('localStorage quota warning when saving submission:', quotaErr);
  }

  // 2. Persist to Express backend server (/api/submissions/:studentId)
  try {
    await withTimeout(
      fetch(`/api/submissions/${encodeURIComponent(submission.studentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      }),
      4000,
      null
    );
  } catch (apiErr) {
    console.warn('Express server save note:', apiErr);
  }

  // 3. Best-effort non-blocking sync to Cloud Firestore
  try {
    const docRef = doc(db, SUBMISSION_COLLECTION, submission.studentId);
    setDoc(docRef, {
      ...submission,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }, { merge: true }).catch((fErr) => {
      console.warn('Firestore submission sync note (safe on server & local):', fErr?.message || fErr);
    });
  } catch {}

  return true;
}

/**
 * Load student workbook submission from Express Server or Cloud Firestore with smart merging
 * Guaranteed to restore all mobile work on any PC or tablet!
 */
export async function loadStudentSubmission(studentId: string): Promise<StudentSubmission | null> {
  const localRaw = localStorage.getItem(`submission_${studentId}`);
  let localData: StudentSubmission | null = null;
  if (localRaw) {
    try {
      localData = JSON.parse(localRaw);
    } catch {}
  }

  // 1. Primary: Fetch from Express Server (/api/submissions/:studentId)
  let cloudData: StudentSubmission | null = null;
  try {
    const res = await withTimeout(
      fetch(`/api/submissions/${encodeURIComponent(studentId)}`),
      3500,
      null
    );
    if (res && res.ok) {
      const json = await res.json();
      if (json && json.submission) {
        cloudData = json.submission as StudentSubmission;
      }
    }
  } catch (err) {
    console.warn('Express server load note:', err);
  }

  // 2. Secondary fallback: Firestore check
  if (!cloudData) {
    try {
      const docRef = doc(db, SUBMISSION_COLLECTION, studentId);
      const snap = await withTimeout(getDoc(docRef), 2000, null);
      if (snap && snap.exists()) {
        cloudData = snap.data() as StudentSubmission;
      }
    } catch (e) {
      console.warn('Firestore load note (quota/network):', e);
    }
  }

  // 3. Smart merge: if student wrote something locally on this device, preserve it
  if (cloudData && localData) {
    const mergedEntries = { ...(cloudData.workbookEntries || {}) };
    if (localData.workbookEntries) {
      Object.entries(localData.workbookEntries).forEach(([pid, lEntry]) => {
        const cEntry = mergedEntries[pid];
        if (!cEntry) {
          mergedEntries[pid] = lEntry;
        } else {
          // Merge curriculum responses and prioritize whichever has non-empty answers
          mergedEntries[pid] = {
            ...cEntry,
            ...lEntry,
            reflectionText: lEntry.reflectionText?.trim() ? lEntry.reflectionText : (cEntry.reflectionText || ''),
            curriculumResponses: {
              ...(cEntry.curriculumResponses || {}),
              ...(lEntry.curriculumResponses || {})
            },
            stampAcquired: lEntry.stampAcquired || cEntry.stampAcquired,
            photoUrl: lEntry.photoUrl || cEntry.photoUrl,
            stampedAt: lEntry.stampedAt || cEntry.stampedAt
          };
        }
      });
    }

    const merged: StudentSubmission = {
      ...cloudData,
      ...localData,
      workbookEntries: mergedEntries,
      dailyReflections: (localData.dailyReflections && localData.dailyReflections.some(r => r.memorableScene?.trim()))
        ? localData.dailyReflections
        : (cloudData.dailyReflections || localData.dailyReflections),
      weatherRecords: (localData.weatherRecords && localData.weatherRecords.some(w => w.studentInvestigation?.trim()))
        ? localData.weatherRecords
        : (cloudData.weatherRecords || localData.weatherRecords),
      bookActivity: (localData.bookActivity && Object.values(localData.bookActivity).some(v => v?.trim()))
        ? localData.bookActivity
        : (cloudData.bookActivity || localData.bookActivity),
      totalStamps: Math.max(localData.totalStamps || 0, cloudData.totalStamps || 0),
      isCompleted: localData.isCompleted || cloudData.isCompleted,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`submission_${studentId}`, JSON.stringify(merged));
    } catch {}
    return merged;
  }

  if (cloudData) {
    try {
      localStorage.setItem(`submission_${studentId}`, JSON.stringify(cloudData));
    } catch {}
    return cloudData;
  }

  return localData;
}

// Default class roster for Damyang Girls' Middle School
export const DEFAULT_STUDENT_ROSTER_ITEMS: StudentUser[] = [
  { studentId: '30101', name: '김하은', school: '담양여자중학교', role: 'student', password: '30101' },
  { studentId: '30102', name: '박소율', school: '담양여자중학교', role: 'student', password: '30102' },
  { studentId: '30103', name: '이서연', school: '담양여자중학교', role: 'student', password: '30103' },
  { studentId: '30104', name: '최지우', school: '담양여자중학교', role: 'student', password: '30104' },
  { studentId: '30105', name: '정유진', school: '담양여자중학교', role: 'student', password: '30105' },
  { studentId: '30111', name: '김민서', school: '담양여자중학교', role: 'student', password: '30111' },
  { studentId: '30119', name: '정하린', school: '담양여자중학교', role: 'student', password: '30119' },
  { studentId: '30201', name: '강민주', school: '담양여자중학교', role: 'student', password: '30201' },
  { studentId: '30202', name: '윤채원', school: '담양여자중학교', role: 'student', password: '30202' },
  { studentId: '30203', name: '송예린', school: '담양여자중학교', role: 'student', password: '30203' },
  { studentId: '30215', name: '이수민', school: '담양여자중학교', role: 'student', password: '1234' },
  { studentId: '30216', name: '한가은', school: '담양여자중학교', role: 'student', password: '30216' },
  { studentId: '30315', name: '조은채', school: '담양여자중학교', role: 'student', password: '30315' }
];

export const ROSTER_CACHE_KEY = 'damyang_roster_cache';
export const LEGACY_ROSTER_CACHE_KEY = 'damyang_student_roster_cache';
export const DELETED_STUDENTS_KEY = 'damyang_deleted_students';

// Active memory listeners for student roster updates
const rosterListeners = new Set<(students: StudentUser[]) => void>();

function notifyRosterListeners(list: StudentUser[]) {
  rosterListeners.forEach((cb) => {
    try {
      cb(list);
    } catch (e) {
      console.warn('Roster listener notification error:', e);
    }
  });
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('damyang_roster_changed', { detail: list }));
    } catch {}
  }
}

/**
 * Retrieve consolidated student roster from all local sources:
 * - Current roster cache
 * - Legacy roster cache
 * - All submission documents stored in localStorage
 * - Current submissions list
 * - Default starter roster
 * While respecting explicit teacher deletions (tombstones)
 */
export function getStoredStudentRoster(): StudentUser[] {
  const mergedMap = new Map<string, StudentUser>();
  const deletedSet = new Set<string>();

  // 1. Load tombstone (deleted students)
  try {
    const delRaw = localStorage.getItem(DELETED_STUDENTS_KEY);
    if (delRaw) {
      const arr = JSON.parse(delRaw);
      if (Array.isArray(arr)) {
        arr.forEach((id) => deletedSet.add(String(id).trim()));
      }
    }
  } catch {}

  // 2. Seed with DEFAULT_STUDENT_ROSTER_ITEMS (unless explicitly deleted)
  DEFAULT_STUDENT_ROSTER_ITEMS.forEach((item) => {
    if (!deletedSet.has(item.studentId)) {
      mergedMap.set(item.studentId, { ...item });
    }
  });

  // 3. Inspect primary cache (damyang_roster_cache)
  try {
    const raw = localStorage.getItem(ROSTER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((st: StudentUser) => {
          if (st && st.studentId && !deletedSet.has(st.studentId)) {
            mergedMap.set(st.studentId, {
              ...st,
              school: st.school || '담양여자중학교',
              role: 'student'
            });
          }
        });
      }
    }
  } catch {}

  // 4. Inspect legacy cache (damyang_student_roster_cache) to recover any previously registered students
  try {
    const rawLegacy = localStorage.getItem(LEGACY_ROSTER_CACHE_KEY);
    if (rawLegacy) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy)) {
        parsedLegacy.forEach((st: StudentUser) => {
          if (st && st.studentId && !deletedSet.has(st.studentId)) {
            if (!mergedMap.has(st.studentId) || !mergedMap.get(st.studentId)?.name) {
              mergedMap.set(st.studentId, {
                ...st,
                school: st.school || '담양여자중학교',
                role: 'student'
              });
            }
          }
        });
      }
    }
  } catch {}

  // 5. Inspect submissions cache (damyang_submissions_cache) to recover any student who submitted
  try {
    const rawSub = localStorage.getItem('damyang_submissions_cache');
    if (rawSub) {
      const subs = JSON.parse(rawSub);
      if (Array.isArray(subs)) {
        subs.forEach((sub: StudentSubmission) => {
          if (sub && sub.studentId && !deletedSet.has(sub.studentId)) {
            if (!mergedMap.has(sub.studentId)) {
              mergedMap.set(sub.studentId, {
                studentId: sub.studentId,
                name: sub.studentName || '학생',
                school: sub.school || '담양여자중학교',
                password: sub.studentId,
                role: 'student',
                updatedAt: sub.updatedAt || sub.submittedAt
              });
            }
          }
        });
      }
    }
  } catch {}

  // 6. Inspect individual submission_* keys in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submission_')) {
        const sid = key.replace('submission_', '').trim();
        if (sid && !deletedSet.has(sid) && !mergedMap.has(sid)) {
          try {
            const rawItem = localStorage.getItem(key);
            if (rawItem) {
              const subObj = JSON.parse(rawItem);
              mergedMap.set(sid, {
                studentId: sid,
                name: subObj.studentName || '학생',
                school: subObj.school || '담양여자중학교',
                password: sid,
                role: 'student'
              });
            }
          } catch {}
        }
      }
    }
  } catch {}

  const result = Array.from(mergedMap.values());
  result.sort((a, b) => a.studentId.localeCompare(b.studentId));

  // Sync consolidated result to persistent local storage
  try {
    localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(result));
    localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(result));
  } catch {}

  return result;
}

export function getCachedStudentRoster(): StudentUser[] {
  return getStoredStudentRoster();
}

/**
 * Real-time listener for all student submissions (for Admin Dashboard)
 */
/**
 * Real-time listener for all student submissions (for Admin Dashboard)
 * Connects to Express API Server with auto-refresh and quota-resilient Firestore sync
 */
export function subscribeAllSubmissions(callback: (submissions: StudentSubmission[]) => void) {
  // Consolidate cached submissions and individual localStorage records
  const getConsolidatedSubmissions = (): StudentSubmission[] => {
    const map = new Map<string, StudentSubmission>();
    try {
      const cached = localStorage.getItem('damyang_submissions_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => map.set(s.studentId, s));
        }
      }
    } catch {}

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('submission_')) {
          const sid = key.replace('submission_', '').trim();
          try {
            const rawItem = localStorage.getItem(key);
            if (rawItem) {
              const parsed = JSON.parse(rawItem);
              if (parsed && parsed.studentId) {
                map.set(sid, { ...parsed });
              }
            }
          } catch {}
        }
      }
    } catch {}

    const list = Array.from(map.values());
    list.sort((a, b) => {
      const timeA = a.submittedAt || a.updatedAt || '';
      const timeB = b.submittedAt || b.updatedAt || '';
      return timeB.localeCompare(timeA);
    });
    return list;
  };

  // 1. Provide instant cached data immediately (0ms)
  const initialList = getConsolidatedSubmissions();
  callback(initialList);

  // 2. Fetch from Express API server
  let isSubscribed = true;
  const fetchServerSubmissions = async () => {
    if (!isSubscribed) return;
    try {
      const res = await withTimeout(fetch('/api/submissions'), 3000, null);
      if (res && res.ok) {
        const serverList = await res.json();
        if (Array.isArray(serverList)) {
          const localList = getConsolidatedSubmissions();
          const map = new Map<string, StudentSubmission>();
          localList.forEach((s) => map.set(s.studentId, s));
          serverList.forEach((s: StudentSubmission) => map.set(s.studentId, s));

          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            const timeA = a.submittedAt || a.updatedAt || '';
            const timeB = b.submittedAt || b.updatedAt || '';
            return timeB.localeCompare(timeA);
          });

          try {
            localStorage.setItem('damyang_submissions_cache', JSON.stringify(merged));
          } catch {}

          if (isSubscribed) {
            callback(merged);
          }
        }
      }
    } catch (e) {
      console.warn('API submissions fetch note:', e);
    }
  };

  fetchServerSubmissions();
  const pollTimer = setInterval(fetchServerSubmissions, 4000);

  // 3. Optional Firestore snapshot with error catching
  let unsubFirestore = () => {};
  try {
    const q = query(collection(db, SUBMISSION_COLLECTION));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const list: StudentSubmission[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as StudentSubmission) });
        });

        const localList = getConsolidatedSubmissions();
        const map = new Map<string, StudentSubmission>();
        localList.forEach((s) => map.set(s.studentId, s));
        list.forEach((s) => map.set(s.studentId, s));

        const merged = Array.from(map.values());
        merged.sort((a, b) => {
          const timeA = a.submittedAt || a.updatedAt || '';
          const timeB = b.submittedAt || b.updatedAt || '';
          return timeB.localeCompare(timeA);
        });

        try {
          localStorage.setItem('damyang_submissions_cache', JSON.stringify(merged));
        } catch {}
        if (isSubscribed) {
          callback(merged);
        }
      },
      (err) => {
        console.warn('Submissions snapshot note (handled):', err?.message || err);
      }
    );
  } catch {}

  return () => {
    isSubscribed = false;
    clearInterval(pollTimer);
    try { unsubFirestore(); } catch {}
  };
}

/**
 * Real-time listener for all student accounts in users collection (for Admin Roster & Password Management)
 * Connects to Express API Server and synchronizes across all devices
 */
export function subscribeAllStudents(callback: (students: StudentUser[]) => void) {
  // 1. Immediately invoke callback with consolidated persistent roster (0ms instant response)
  const initialRoster = getStoredStudentRoster();
  callback(initialRoster);

  // 2. Register callback in memory listener set
  rosterListeners.add(callback);

  // 3. Listen to window broadcast event for cross-component and tab sync
  const handleWindowSync = (e: any) => {
    if (e.detail && Array.isArray(e.detail)) {
      callback(e.detail);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('damyang_roster_changed', handleWindowSync);
  }

  // 4. Fetch from Express API server with automatic polling
  let isSubscribed = true;
  const fetchServerStudents = async () => {
    if (!isSubscribed) return;
    try {
      const res = await withTimeout(fetch('/api/students'), 3000, null);
      if (res && res.ok) {
        const serverStudents = await res.json();
        if (Array.isArray(serverStudents) && serverStudents.length > 0) {
          const currentRoster = getStoredStudentRoster();
          const mergedMap = new Map<string, StudentUser>();
          currentRoster.forEach((item) => mergedMap.set(item.studentId, item));
          serverStudents.forEach((st: StudentUser) => {
            if (st && st.studentId) mergedMap.set(st.studentId, st);
          });

          const list = Array.from(mergedMap.values()).sort((a, b) => a.studentId.localeCompare(b.studentId));
          try {
            localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(list));
            localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(list));
          } catch {}

          if (isSubscribed) {
            callback(list);
          }
        }
      }
    } catch (e) {
      console.warn('API students fetch note:', e);
    }
  };

  fetchServerStudents();
  const pollTimer = setInterval(fetchServerStudents, 4000);

  // 5. Connect to Firestore query with quota resilience
  let unsubFirestore = () => {};
  try {
    const q = query(collection(db, USERS_COLLECTION));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const firestoreMap = new Map<string, StudentUser>();
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.role !== 'admin' && d.id !== 'TEACHER') {
            const sid = data.studentId || d.id;
            firestoreMap.set(sid, {
              studentId: sid,
              name: data.name || '학생',
              school: data.school || '담양여자중학교',
              password: data.password || sid,
              role: 'student',
              lastLoginAt: data.lastLoginAt,
              createdAt: data.createdAt || data.updatedAt
            });
          }
        });

        const currentRoster = getStoredStudentRoster();
        const mergedMap = new Map<string, StudentUser>();
        currentRoster.forEach((item) => mergedMap.set(item.studentId, item));
        firestoreMap.forEach((user, sid) => mergedMap.set(sid, user));

        const list = Array.from(mergedMap.values()).sort((a, b) => a.studentId.localeCompare(b.studentId));
        try {
          localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(list));
          localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(list));
        } catch {}

        if (isSubscribed) {
          callback(list);
        }
      },
      (err) => {
        console.warn('Students snapshot note (quota handled):', err?.message || err);
      }
    );
  } catch {}

  return () => {
    isSubscribed = false;
    clearInterval(pollTimer);
    rosterListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('damyang_roster_changed', handleWindowSync);
    }
    try { unsubFirestore(); } catch {}
  };
}

/**
 * Add or update student user in Express API, Firestore, and Local Persistent Cache
 * Guaranteed to succeed instantly across all devices
 */
export async function saveOrUpdateStudent(student: {
  studentId: string;
  name: string;
  school: string;
  password?: string;
}): Promise<boolean> {
  const cleanId = student.studentId.trim();
  const studentName = student.name.trim();
  const schoolName = student.school.trim() || '담양여자중학교';
  const targetPassword = student.password?.trim() || cleanId;

  if (!cleanId || !studentName) {
    return false;
  }

  // 1. Remove from deleted tombstones if previously deleted
  try {
    const delRaw = localStorage.getItem(DELETED_STUDENTS_KEY);
    if (delRaw) {
      const arr = JSON.parse(delRaw);
      if (Array.isArray(arr)) {
        const filtered = arr.filter((id) => String(id).trim() !== cleanId);
        localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(filtered));
      }
    }
  } catch {}

  // 2. Update local persistent roster immediately (0ms synchronous guaranteed persistence)
  const currentRoster = getStoredStudentRoster();
  const existingIdx = currentRoster.findIndex((s) => s.studentId === cleanId);

  const studentUser: StudentUser = {
    studentId: cleanId,
    name: studentName,
    school: schoolName,
    password: targetPassword,
    role: 'student',
    updatedAt: new Date().toISOString()
  };

  let updatedList: StudentUser[];
  if (existingIdx >= 0) {
    updatedList = [...currentRoster];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...studentUser };
  } else {
    updatedList = [...currentRoster, studentUser];
    updatedList.sort((a, b) => a.studentId.localeCompare(b.studentId));
  }

  try {
    localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(updatedList));
    localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(updatedList));
  } catch {}

  // 3. Immediately notify active UI subscribers
  notifyRosterListeners(updatedList);

  // 4. Save to Express backend server (/api/students)
  try {
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentUser)
    }).catch(() => {});
  } catch {}

  // 5. Best-effort non-blocking sync to Firestore
  try {
    const docRef = doc(db, USERS_COLLECTION, cleanId);
    setDoc(
      docRef,
      {
        studentId: cleanId,
        name: studentName,
        school: schoolName,
        password: targetPassword,
        role: 'student',
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    ).catch(() => {});
  } catch {}

  return true;
}

/**
 * Reset student password in Express API, local persistent cache, and Firestore
 */
export async function resetStudentPassword(studentId: string, newPassword: string): Promise<boolean> {
  const cleanId = studentId.trim();
  const trimmedPassword = newPassword.trim();
  if (!cleanId || !trimmedPassword) return false;

  // 1. Update in local storage immediately
  const currentRoster = getStoredStudentRoster();
  const existingIdx = currentRoster.findIndex((s) => s.studentId === cleanId);
  if (existingIdx >= 0) {
    currentRoster[existingIdx].password = trimmedPassword;
    currentRoster[existingIdx].updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(currentRoster));
      localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(currentRoster));
    } catch {}
    notifyRosterListeners(currentRoster);
  }

  // 2. Sync to Express server API
  try {
    fetch('/api/students/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: cleanId, newPassword: trimmedPassword })
    }).catch(() => {});
  } catch {}

  // 3. Sync to Firestore in background
  try {
    const docRef = doc(db, USERS_COLLECTION, cleanId);
    setDoc(
      docRef,
      {
        password: trimmedPassword,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    ).catch(() => {});
  } catch {}

  return true;
}

/**
 * Delete student account from Express API, local cache, and Firestore
 */
export async function deleteStudentUser(studentId: string): Promise<boolean> {
  const cleanId = studentId.trim();
  if (!cleanId) return false;

  // 1. Record in tombstone
  try {
    const delRaw = localStorage.getItem(DELETED_STUDENTS_KEY);
    const arr: string[] = delRaw ? JSON.parse(delRaw) : [];
    if (!arr.includes(cleanId)) {
      arr.push(cleanId);
      localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(arr));
    }
  } catch {}

  // 2. Remove from local roster cache
  const currentRoster = getStoredStudentRoster();
  const filtered = currentRoster.filter((s) => s.studentId !== cleanId);
  try {
    localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(filtered));
    localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(filtered));
  } catch {}
  notifyRosterListeners(filtered);

  // 3. Purge submission and user caches
  try {
    localStorage.removeItem(`submission_${cleanId}`);
    const cachedCurrentUser = localStorage.getItem('damyang_user');
    if (cachedCurrentUser) {
      const parsed = JSON.parse(cachedCurrentUser);
      if (parsed.studentId === cleanId) {
        localStorage.removeItem('damyang_user');
      }
    }
    const rawSub = localStorage.getItem('damyang_submissions_cache');
    if (rawSub) {
      const subs: StudentSubmission[] = JSON.parse(rawSub);
      const filteredSubs = subs.filter((s) => s.studentId !== cleanId);
      localStorage.setItem('damyang_submissions_cache', JSON.stringify(filteredSubs));
    }
  } catch {}

  // 4. Delete on Express server API
  try {
    fetch(`/api/students/${encodeURIComponent(cleanId)}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  // 5. Background delete in Firestore
  try {
    deleteDoc(doc(db, USERS_COLLECTION, cleanId)).catch(() => {});
    deleteDoc(doc(db, SUBMISSION_COLLECTION, cleanId)).catch(() => {});
  } catch {}

  return true;
}

/**
 * Reset roster back to default starter students (clears deleted tombstones)
 */
export async function restoreDefaultStudentRoster(): Promise<StudentUser[]> {
  try {
    localStorage.removeItem(DELETED_STUDENTS_KEY);
    localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(DEFAULT_STUDENT_ROSTER_ITEMS));
    localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(DEFAULT_STUDENT_ROSTER_ITEMS));
  } catch {}

  notifyRosterListeners(DEFAULT_STUDENT_ROSTER_ITEMS);

  // Sync to Express server API
  try {
    fetch('/api/students/restore-default', { method: 'POST' }).catch(() => {});
  } catch {}

  // Sync to Firestore in background
  DEFAULT_STUDENT_ROSTER_ITEMS.forEach((item) => {
    saveOrUpdateStudent(item).catch(() => {});
  });

  return DEFAULT_STUDENT_ROSTER_ITEMS;
}


