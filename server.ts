import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support large payloads (base64 photo uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const SUBMISSIONS_DIR = path.join(DATA_DIR, 'submissions');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SUBMISSIONS_DIR)) fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });

// Initial default class roster
const DEFAULT_STUDENT_ROSTER_ITEMS = [
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

function readUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  // Initialize with default items if file does not exist
  writeUsers(DEFAULT_STUDENT_ROSTER_ITEMS);
  return DEFAULT_STUDENT_ROSTER_ITEMS;
}

function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing users file:', e);
  }
}

// ==========================================
// API ROUTES: CROSS-DEVICE CLOUD SYNC
// ==========================================

// 1. Get submission for a specific student
app.get('/api/submissions/:studentId', (req, res) => {
  const { studentId } = req.params;
  const filePath = path.join(SUBMISSIONS_DIR, `${studentId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json({ success: true, submission: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read submission' });
    }
  }
  return res.status(404).json({ error: 'Submission not found', submission: null });
});

// 2. Save / Sync student submission (Smart merge: never drop photos or reflections)
app.post('/api/submissions/:studentId', (req, res) => {
  const { studentId } = req.params;
  const incoming = req.body;

  if (!studentId || !incoming) {
    return res.status(400).json({ error: 'Missing studentId or payload' });
  }

  const filePath = path.join(SUBMISSIONS_DIR, `${studentId}.json`);
  let merged = incoming;

  if (fs.existsSync(filePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const mergedEntries = { ...(existing.workbookEntries || {}), ...(incoming.workbookEntries || {}) };

      // Preserve photos, responses, and stamps across devices
      Object.entries(existing.workbookEntries || {}).forEach(([pid, oldE]: [string, any]) => {
        const newE = mergedEntries[pid] || {};
        mergedEntries[pid] = {
          ...oldE,
          ...newE,
          photoUrl: newE.photoUrl || oldE.photoUrl,
          stampAcquired: newE.stampAcquired || oldE.stampAcquired,
          stampedAt: newE.stampedAt || oldE.stampedAt,
          curriculumResponses: {
            ...(oldE.curriculumResponses || {}),
            ...(newE.curriculumResponses || {})
          }
        };
      });

      merged = {
        ...existing,
        ...incoming,
        workbookEntries: mergedEntries,
        weatherRecords: (incoming.weatherRecords && incoming.weatherRecords.some((w: any) => w.studentInvestigation?.trim()))
          ? incoming.weatherRecords
          : (existing.weatherRecords || incoming.weatherRecords),
        dailyReflections: (incoming.dailyReflections && incoming.dailyReflections.some((r: any) => r.memorableScene?.trim()))
          ? incoming.dailyReflections
          : (existing.dailyReflections || incoming.dailyReflections),
        bookActivity: incoming.bookActivity || existing.bookActivity,
        totalStamps: Math.max(existing.totalStamps || 0, incoming.totalStamps || 0),
        isCompleted: existing.isCompleted || incoming.isCompleted,
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('Merge note:', err);
    }
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');

    // Also ensure student account is registered in users list
    const users = readUsers();
    const existingUserIndex = users.findIndex((u: any) => u.studentId === studentId);
    if (existingUserIndex === -1) {
      users.push({
        studentId,
        name: incoming.studentName || '학생',
        school: incoming.school || '담양여자중학교',
        password: studentId,
        role: 'student',
        updatedAt: new Date().toISOString()
      });
      writeUsers(users);
    }

    return res.json({ success: true, submission: merged });
  } catch (e) {
    console.error('Error saving submission file:', e);
    return res.status(500).json({ error: 'Failed to write submission' });
  }
});

// 3. Get all submissions (for Admin Dashboard)
app.get('/api/submissions', (_req, res) => {
  try {
    const files = fs.readdirSync(SUBMISSIONS_DIR);
    const list: any[] = [];
    for (const f of files) {
      if (f.endsWith('.json')) {
        try {
          const item = JSON.parse(fs.readFileSync(path.join(SUBMISSIONS_DIR, f), 'utf-8'));
          list.push(item);
        } catch {}
      }
    }
    list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list submissions' });
  }
});

// 4. Delete student submission
app.delete('/api/submissions/:studentId', (req, res) => {
  const { studentId } = req.params;
  const filePath = path.join(SUBMISSIONS_DIR, `${studentId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
  return res.json({ success: true });
});

// 5. Get all registered students
app.get('/api/students', (_req, res) => {
  const users = readUsers();
  return res.json(users);
});

// 6. Save or update student
app.post('/api/students', (req, res) => {
  const student = req.body;
  if (!student || !student.studentId || !student.name) {
    return res.status(400).json({ error: 'Invalid student data' });
  }
  const users = readUsers();
  const idx = users.findIndex((u: any) => u.studentId === student.studentId);
  const updatedUser = {
    ...student,
    role: 'student',
    updatedAt: new Date().toISOString()
  };
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatedUser };
  } else {
    users.push(updatedUser);
  }
  users.sort((a: any, b: any) => a.studentId.localeCompare(b.studentId));
  writeUsers(users);
  return res.json({ success: true, user: updatedUser });
});

// 7. Delete student user
app.delete('/api/students/:studentId', (req, res) => {
  const { studentId } = req.params;
  const users = readUsers().filter((u: any) => u.studentId !== studentId);
  writeUsers(users);

  // Also remove submission if exists
  const subFile = path.join(SUBMISSIONS_DIR, `${studentId}.json`);
  if (fs.existsSync(subFile)) {
    try { fs.unlinkSync(subFile); } catch {}
  }
  return res.json({ success: true });
});

// 8. Bulk save or update students
app.post('/api/students/bulk', (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Students array required' });
  }

  const users = readUsers();
  const map = new Map<string, any>();
  users.forEach(u => map.set(u.studentId, u));

  students.forEach((st: any) => {
    if (st && st.studentId && st.name) {
      const existing = map.get(st.studentId) || {};
      map.set(st.studentId, {
        ...existing,
        ...st,
        school: st.school || existing.school || '담양여자중학교',
        role: 'student',
        updatedAt: new Date().toISOString()
      });
    }
  });

  const updatedList = Array.from(map.values()).sort((a, b) => a.studentId.localeCompare(b.studentId));
  writeUsers(updatedList);
  return res.json({ success: true, count: students.length, students: updatedList });
});

// 9. Reset student password
app.post('/api/students/reset-password', (req, res) => {
  const { studentId, newPassword } = req.body;
  if (!studentId || !newPassword) {
    return res.status(400).json({ error: 'Missing studentId or newPassword' });
  }

  const users = readUsers();
  const student = users.find((u: any) => u.studentId === studentId);
  if (student) {
    student.password = newPassword.trim();
    student.updatedAt = new Date().toISOString();
    writeUsers(users);
    return res.json({ success: true, student });
  }
  return res.status(404).json({ error: 'Student not found' });
});

// 10. Restore default roster
app.post('/api/students/restore-default', (_req, res) => {
  const users = readUsers();
  const map = new Map<string, any>();
  DEFAULT_STUDENT_ROSTER_ITEMS.forEach(d => map.set(d.studentId, { ...d }));
  users.forEach(u => map.set(u.studentId, u));

  const merged = Array.from(map.values()).sort((a, b) => a.studentId.localeCompare(b.studentId));
  writeUsers(merged);
  return res.json({ success: true, students: merged });
});

// 11. Student Login authentication
app.post('/api/auth/student-login', (req, res) => {
  const { studentId, name, school, password } = req.body;
  const cleanId = String(studentId || '').trim();
  const studentName = String(name || '').trim();
  const schoolName = String(school || '').trim() || '담양여자중학교';
  const trimmedPassword = String(password || '').trim();

  if (!cleanId) {
    return res.status(400).json({ error: '학번을 입력해 주세요.' });
  }

  const users = readUsers();
  let user = users.find((u: any) => u.studentId === cleanId);

  if (user) {
    const expected = (user.password || '').trim();
    // Allow if matches registered password, or if matches studentId (default fallback)
    if (expected && trimmedPassword && expected !== trimmedPassword && expected !== cleanId && trimmedPassword !== cleanId) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다. 관리자 선생님께 비밀번호 초기화를 요청해 주세요.' });
    }

    if (studentName && (!user.name || user.name === '학생')) {
      user.name = studentName;
    }
    user.lastLoginAt = new Date().toISOString();
    writeUsers(users);
    return res.json({ success: true, user });
  }

  // If user does not exist in roster yet, automatically register them!
  const newUser = {
    studentId: cleanId,
    name: studentName || `${cleanId} 학생`,
    school: schoolName,
    password: trimmedPassword || cleanId,
    role: 'student',
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  users.sort((a: any, b: any) => a.studentId.localeCompare(b.studentId));
  writeUsers(users);

  return res.json({ success: true, user: newUser });
});

// 12. Admin Teacher Login authentication
app.post('/api/auth/admin-login', (req, res) => {
  const { password } = req.body;
  const trimmed = String(password || '').trim();
  if (trimmed !== 'damyang2026' && trimmed !== 'admin') {
    return res.status(401).json({ error: '관리자 인증 암호가 올바르지 않습니다.' });
  }

  const adminUser = {
    studentId: 'TEACHER',
    name: '인솔교사/관리자',
    school: '담양여자중학교 인솔추진단',
    role: 'admin',
    lastLoginAt: new Date().toISOString()
  };

  return res.json({ success: true, user: adminUser });
});

// ==========================================
// VITE MIDDLEWARE (DEV) / STATIC SERVE (PROD)
// ==========================================
async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

start().catch(console.error);
