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
    console.error('Error saving student profile to Firestore:', firestoreErr);
  }

  return studentUser;
}

/**
 * Log in admin teacher with Firebase Auth
 */
export async function loginAdminWithAuth(adminPasswordInput: string): Promise<StudentUser> {
  if (adminPasswordInput !== 'damyang2026' && adminPasswordInput !== 'admin') {
    throw new Error('관리자 인증 암호가 올바르지 않습니다.');
  }

  const email = 'admin@damyang.ms.kr';
  const password = 'damyang_damyang2026';

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
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
  }

  const adminUser: StudentUser = {
    studentId: 'TEACHER',
    name: '인솔교사/관리자',
    school: '담양여자중학교 인솔추진단',
    role: 'admin'
  };

  try {
    const docRef = doc(db, USERS_COLLECTION, 'TEACHER');
    await setDoc(docRef, {
      studentId: 'TEACHER',
      name: '인솔교사/관리자',
      school: '담양여자중학교 인솔추진단',
      role: 'admin',
      lastLoginAt: serverTimestamp()
    }, { merge: true });
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
  try {
    const docRef = doc(db, SUBMISSION_COLLECTION, submission.studentId);
    await setDoc(docRef, {
      ...submission,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }, { merge: true });

    // Also update local storage as instant backup
    localStorage.setItem(`submission_${submission.studentId}`, JSON.stringify(submission));
    return true;
  } catch (error) {
    console.error('Error saving submission to Firestore:', error);
    localStorage.setItem(`submission_${submission.studentId}`, JSON.stringify(submission));
    return false;
  }
}

/**
 * Load student workbook submission from Cloud Firestore
 */
export async function loadStudentSubmission(studentId: string): Promise<StudentSubmission | null> {
  try {
    const docRef = doc(db, SUBMISSION_COLLECTION, studentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StudentSubmission;
      // Sync to local storage
      localStorage.setItem(`submission_${studentId}`, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.error('Error reading from Firestore, checking local backup:', error);
  }

  // Check local storage backup
  const local = localStorage.getItem(`submission_${studentId}`);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      // Migrate local to Firestore in background
      saveStudentSubmission(parsed).catch(() => {});
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Real-time listener for all student submissions (for Admin Dashboard)
 */
export function subscribeAllSubmissions(callback: (submissions: StudentSubmission[]) => void) {
  try {
    const q = query(collection(db, SUBMISSION_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const list: StudentSubmission[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as StudentSubmission) });
      });
      // Sort by updatedAt or submittedAt desc
      list.sort((a, b) => {
        const timeA = a.submittedAt || a.updatedAt || '';
        const timeB = b.submittedAt || b.updatedAt || '';
        return timeB.localeCompare(timeA);
      });
      callback(list);
    }, (err) => {
      console.error('Snapshot error:', err);
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return () => {};
  }
}

/**
 * Real-time listener for all student accounts in users collection (for Admin Roster & Password Management)
 */
export function subscribeAllStudents(callback: (students: StudentUser[]) => void) {
  try {
    const q = query(collection(db, USERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const list: StudentUser[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.role !== 'admin' && d.id !== 'TEACHER') {
          list.push({
            studentId: data.studentId || d.id,
            name: data.name || '학생',
            school: data.school || '담양여자중학교',
            password: data.password || '1234',
            role: 'student',
            lastLoginAt: data.lastLoginAt,
            createdAt: data.createdAt || data.updatedAt
          });
        }
      });
      // Sort by studentId asc
      list.sort((a, b) => a.studentId.localeCompare(b.studentId));
      callback(list);
    }, (err) => {
      console.error('Students snapshot error:', err);
    });
  } catch (err) {
    console.error('Students subscribe error:', err);
    return () => {};
  }
}

/**
 * Add or update student user in Firestore
 */
export async function saveOrUpdateStudent(student: {
  studentId: string;
  name: string;
  school: string;
  password?: string;
}): Promise<boolean> {
  try {
    const cleanId = student.studentId.trim();
    const docRef = doc(db, USERS_COLLECTION, cleanId);
    await setDoc(docRef, {
      studentId: cleanId,
      name: student.name.trim(),
      school: student.school.trim(),
      password: student.password?.trim() || '1234',
      role: 'student',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving student to Firestore:', error);
    return false;
  }
}

/**
 * Reset student password in Firestore
 */
export async function resetStudentPassword(studentId: string, newPassword: string): Promise<boolean> {
  try {
    const cleanId = studentId.trim();
    const docRef = doc(db, USERS_COLLECTION, cleanId);
    await setDoc(docRef, {
      password: newPassword.trim(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error resetting student password:', error);
    return false;
  }
}

/**
 * Delete student account from Firestore and purge associated submissions
 */
export async function deleteStudentUser(studentId: string): Promise<boolean> {
  try {
    const cleanId = studentId.trim();
    
    // 1. Delete user profile doc from USERS_COLLECTION
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, cleanId));
    } catch (uErr) {
      console.warn('Error deleting from USERS_COLLECTION:', uErr);
    }

    // 2. Delete submission doc from SUBMISSION_COLLECTION
    try {
      await deleteDoc(doc(db, SUBMISSION_COLLECTION, cleanId));
    } catch (sErr) {
      console.warn('Error deleting from SUBMISSION_COLLECTION:', sErr);
    }

    // 3. Clean up query matches in case studentId was stored under different ID
    try {
      const snap = await getDocs(query(collection(db, SUBMISSION_COLLECTION)));
      for (const d of snap.docs) {
        if (d.data().studentId === cleanId) {
          await deleteDoc(d.ref);
        }
      }
    } catch (qErr) {
      console.warn('Error querying extra submission docs for cleanup:', qErr);
    }

    // 4. Purge client-side caches
    try {
      localStorage.removeItem(`submission_${cleanId}`);
      const cachedCurrentUser = localStorage.getItem('damyang_student_user');
      if (cachedCurrentUser) {
        const parsed = JSON.parse(cachedCurrentUser);
        if (parsed.studentId === cleanId) {
          localStorage.removeItem('damyang_student_user');
        }
      }
      const localRoster = localStorage.getItem('damyang_student_roster_cache');
      if (localRoster) {
        const parsed = JSON.parse(localRoster);
        const filtered = parsed.filter((s: any) => s.studentId !== cleanId);
        localStorage.setItem('damyang_student_roster_cache', JSON.stringify(filtered));
      }
    } catch (cErr) {
      console.warn('Error clearing local caches:', cErr);
    }

    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    return false;
  }
}

