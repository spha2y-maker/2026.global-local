import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentSubmission } from '../types';

const COLLECTION_NAME = 'student_submissions';

export async function saveStudentSubmission(submission: StudentSubmission): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, submission.studentId);
    await setDoc(docRef, {
      ...submission,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving submission to Firestore:', error);
    // Fallback to localStorage always
    localStorage.setItem(`submission_${submission.studentId}`, JSON.stringify(submission));
  }
}

export async function loadStudentSubmission(studentId: string): Promise<StudentSubmission | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StudentSubmission;
    }
  } catch (error) {
    console.error('Error reading from Firestore, checking local backup:', error);
  }

  // Check local storage backup
  const local = localStorage.getItem(`submission_${studentId}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
}

export function subscribeAllSubmissions(callback: (submissions: StudentSubmission[]) => void) {
  try {
    const q = query(collection(db, COLLECTION_NAME));
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
