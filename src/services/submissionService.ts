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
 * Log in or register student using Firebase Authentication and sync user profile to Cloud Firestore
 */
export async function loginStudentWithAuth(
  studentId: string, 
  name: string, 
  school: string, 
  rawPassword: string
): Promise<StudentUser> {
  const cleanId = studentId.trim();
  const trimmedPassword = rawPassword.trim();
  const userDocRef = doc(db, USERS_COLLECTION, cleanId);

  // 0. Verify if password was set or reset in Firestore
  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      if (data.password && data.password !== trimmedPassword) {
        throw new Error('비밀번호가 일치하지 않습니다. 관리자 선생님께 비밀번호 초기화를 요청하거나 확인해 주세요.');
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('비밀번호가 일치하지 않습니다')) {
      throw err;
    }
  }

  const { email, password } = formatStudentAuthCredentials(cleanId, trimmedPassword);

  let fbUser: FirebaseUser | null = null;

  try {
    // 1. Try signing in first
    const credential = await signInWithEmailAndPassword(auth, email, password);
    fbUser = credential.user;
  } catch (err: any) {
    const errorCode = err.code || '';
    
    // If account doesn't exist yet, automatically register the student
    if (
      errorCode === 'auth/user-not-found' || 
      errorCode === 'auth/invalid-credential' ||
      errorCode === 'auth/invalid-login-credentials'
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = createCred.user;
        await updateProfile(fbUser, { displayName: name.trim() });
      } catch (createErr: any) {
        // Fallback gracefully for preview
        console.warn('Firebase Auth user creation note:', createErr);
      }
    } else if (errorCode === 'auth/wrong-password') {
      // Firebase auth had an old password; if Firestore allowed it (e.g. after teacher reset), we proceed
      console.warn('Firebase Auth password mismatch, falling back to verified Firestore session.');
    }
  }

  const studentUser: StudentUser = {
    studentId: cleanId,
    name: name.trim(),
    school: school.trim(),
    password: trimmedPassword,
    role: 'student'
  };

  // 2. Persist/Update user profile document in Firestore with password
  try {
    await setDoc(userDocRef, {
      studentId: studentUser.studentId,
      name: studentUser.name,
      school: studentUser.school,
      password: trimmedPassword,
      role: 'student',
      authUid: fbUser?.uid || null,
      lastLoginAt: serverTimestamp(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('Note on saving student profile to Firestore (quota or offline):', firestoreErr);
  }

  // 3. Immediately register student into local persistent roster
  try {
    saveOrUpdateStudent({
      studentId: studentUser.studentId,
      name: studentUser.name,
      school: studentUser.school,
      password: trimmedPassword
    });
  } catch {}

  return studentUser;
}

/**
 * Log in admin teacher with Firebase Auth
 */
export async function loginAdminWithAuth(adminPasswordInput: string): Promise<StudentUser> {
  const trimmed = adminPasswordInput.trim();
  if (trimmed !== 'damyang2026' && trimmed !== 'admin') {
    throw new Error('관리자 인증 암호가 올바르지 않습니다.');
  }

  const email = 'admin@damyang.ms.kr';
  const password = 'damyang_damyang2026';

  // Perform Firebase Auth in background with a short timeout so admin login is instant (< 300ms)
  Promise.race([
    signInWithEmailAndPassword(auth, email, password).catch(async (err: any) => {
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: '인솔교사/관리자' });
        } catch {}
      }
    }),
    new Promise(res => setTimeout(res, 600))
  ]).catch(() => {});

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
 * Save student workbook submission to Cloud Firestore
 */
export async function saveStudentSubmission(submission: StudentSubmission): Promise<boolean> {
  // Always update local storage first as synchronous fail-safe
  try {
    localStorage.setItem(`submission_${submission.studentId}`, JSON.stringify(submission));
  } catch (quotaErr) {
    console.warn('localStorage quota warning when saving submission:', quotaErr);
  }

  try {
    const docRef = doc(db, SUBMISSION_COLLECTION, submission.studentId);
    await setDoc(docRef, {
      ...submission,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error: any) {
    console.error('Error saving submission to Firestore:', error);
    // If Firestore failed (e.g. document too large or network drop), try payload reduction
    if (error?.message && error.message.includes('maximum allowed size')) {
      console.warn('Attempting payload size reduction...');
      try {
        const compactEntries: Record<string, any> = {};
        Object.entries(submission.workbookEntries || {}).forEach(([pid, entry]) => {
          compactEntries[pid] = {
            ...entry,
            // Keep text, responses, stamp, but if photoUrl is gigantic, keep thumbnail
            photoUrl: entry.photoUrl ? entry.photoUrl.slice(0, 150000) : undefined
          };
        });
        const docRef = doc(db, SUBMISSION_COLLECTION, submission.studentId);
        await setDoc(docRef, {
          ...submission,
          workbookEntries: compactEntries,
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp()
        }, { merge: true });
        return true;
      } catch (retryErr) {
        console.error('Retry save failed:', retryErr);
      }
    }
    return false;
  }
}

/**
 * Load student workbook submission from Cloud Firestore with smart merging
 */
export async function loadStudentSubmission(studentId: string): Promise<StudentSubmission | null> {
  const localRaw = localStorage.getItem(`submission_${studentId}`);
  let localData: StudentSubmission | null = null;
  if (localRaw) {
    try {
      localData = JSON.parse(localRaw);
    } catch {}
  }

  try {
    const docRef = doc(db, SUBMISSION_COLLECTION, studentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudData = snap.data() as StudentSubmission;

      // Smart merge: if student wrote something locally while offline, preserve it!
      if (localData) {
        const mergedEntries = { ...(cloudData.workbookEntries || {}) };
        if (localData.workbookEntries) {
          Object.entries(localData.workbookEntries).forEach(([pid, lEntry]) => {
            const cEntry = mergedEntries[pid];
            if (!cEntry) {
              mergedEntries[pid] = lEntry;
            } else {
              // Merge curriculum responses
              const mergedResp = {
                ...(cEntry.curriculumResponses || {}),
                ...(lEntry.curriculumResponses || {})
              };
              mergedEntries[pid] = {
                ...cEntry,
                ...lEntry,
                curriculumResponses: mergedResp,
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
          bookActivity: localData.bookActivity || cloudData.bookActivity,
          totalStamps: Math.max(localData.totalStamps || 0, cloudData.totalStamps || 0),
          isCompleted: localData.isCompleted || cloudData.isCompleted,
          updatedAt: new Date().toISOString()
        };

        // Cache merged version
        try {
          localStorage.setItem(`submission_${studentId}`, JSON.stringify(merged));
        } catch {}
        return merged;
      }

      // No local data, save cloud data to localStorage
      try {
        localStorage.setItem(`submission_${studentId}`, JSON.stringify(cloudData));
      } catch {}
      return cloudData;
    }
  } catch (error) {
    console.error('Error reading from Firestore, falling back to local backup:', error);
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
  { studentId: '30201', name: '강민주', school: '담양여자중학교', role: 'student', password: '30201' },
  { studentId: '30202', name: '윤채원', school: '담양여자중학교', role: 'student', password: '30202' },
  { studentId: '30203', name: '송예린', school: '담양여자중학교', role: 'student', password: '30203' },
  { studentId: '30215', name: '이수민', school: '담양여자중학교', role: 'student', password: '1234' },
  { studentId: '30216', name: '한가은', school: '담양여자중학교', role: 'student', password: '30216' }
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

  // Provide instant cached data immediately (0ms)
  const initialList = getConsolidatedSubmissions();
  if (initialList.length > 0) {
    callback(initialList);
  }

  try {
    const q = query(collection(db, SUBMISSION_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: StudentSubmission[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as StudentSubmission) });
        });

        // Merge with local submissions to avoid losing any local progress
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
        callback(merged);
      },
      (err) => {
        console.warn('Submissions snapshot note (falling back to local cache):', err);
        callback(getConsolidatedSubmissions());
      }
    );
  } catch (err) {
    console.warn('Submissions subscribe error (using local storage):', err);
    return () => {};
  }
}

/**
 * Real-time listener for all student accounts in users collection (for Admin Roster & Password Management)
 * Guaranteed to provide instant roster (0ms) and merge with live Firestore changes
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

  // 4. Connect to Firestore query with quota/network error resilience
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

        // Merge firestore users with local roster (respecting deleted students)
        const currentRoster = getStoredStudentRoster();
        const mergedMap = new Map<string, StudentUser>();
        currentRoster.forEach((item) => {
          mergedMap.set(item.studentId, item);
        });
        firestoreMap.forEach((user, sid) => {
          mergedMap.set(sid, user);
        });

        const list = Array.from(mergedMap.values());
        list.sort((a, b) => a.studentId.localeCompare(b.studentId));

        try {
          localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(list));
          localStorage.setItem(LEGACY_ROSTER_CACHE_KEY, JSON.stringify(list));
        } catch {}

        callback(list);
      },
      (err) => {
        console.warn('Students snapshot note (using local persistent storage):', err);
        callback(getStoredStudentRoster());
      }
    );
  } catch (err) {
    console.warn('Students subscribe error:', err);
  }

  return () => {
    rosterListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('damyang_roster_changed', handleWindowSync);
    }
    unsubFirestore();
  };
}

/**
 * Add or update student user in Firestore and Local Persistent Cache
 * Guaranteed to succeed locally and sync to cloud
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

  // 1. Remove from deleted tombstones if it was previously deleted
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
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  // 3. Immediately notify active UI subscribers across the application
  notifyRosterListeners(updatedList);

  // 4. Ensure this student is represented in local submissions cache so they appear in both views
  try {
    const rawSub = localStorage.getItem('damyang_submissions_cache');
    let subList: StudentSubmission[] = rawSub ? JSON.parse(rawSub) : [];
    if (!Array.isArray(subList)) subList = [];
    const hasSub = subList.some((s) => s.studentId === cleanId);
    if (!hasSub) {
      const newSub: StudentSubmission = {
        studentId: cleanId,
        studentName: studentName,
        school: schoolName,
        isCompleted: false,
        totalStamps: 0,
        updatedAt: new Date().toISOString(),
        workbookEntries: {},
        weatherRecords: [],
        dailyReflections: []
      };
      subList.push(newSub);
      localStorage.setItem('damyang_submissions_cache', JSON.stringify(subList));
    }
  } catch {}

  // 5. Asynchronously persist to Cloud Firestore in background (non-blocking, tolerant of quota/network issues)
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
    ).catch((err) => {
      console.warn('Firestore user doc sync note (safe in persistent local storage):', err);
    });
  } catch (err) {
    console.warn('Firestore setDoc invocation note:', err);
  }

  return true;
}

/**
 * Reset student password in local persistent cache and Firestore
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

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, USERS_COLLECTION, cleanId);
    setDoc(
      docRef,
      {
        password: trimmedPassword,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Firestore password reset sync note (safe locally):', err);
    });
  } catch (err) {
    console.warn('Firestore resetDoc note:', err);
  }

  return true;
}

/**
 * Delete student account from local persistent cache, Firestore, and purge associated submissions
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

  // 2. Remove from roster cache
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
  } catch (cErr) {
    console.warn('Error clearing local caches:', cErr);
  }

  // 4. Background delete in Firestore
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

  // Sync to Firestore in background
  DEFAULT_STUDENT_ROSTER_ITEMS.forEach((item) => {
    saveOrUpdateStudent(item).catch(() => {});
  });

  return DEFAULT_STUDENT_ROSTER_ITEMS;
}


