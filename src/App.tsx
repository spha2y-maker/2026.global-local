import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { HomeView } from './components/HomeView';
import { ScheduleView } from './components/ScheduleView';
import { PlacesWorkbookView } from './components/PlacesWorkbookView';
import { StampTourView } from './components/StampTourView';
import { TravelToolkitView } from './components/TravelToolkitView';
import { ImmigrationEnglishView } from './components/ImmigrationEnglishView';
import { ChinesePhrasesView } from './components/ChinesePhrasesView';
import { WeatherInvestigationView } from './components/WeatherInvestigationView';
import { BookActivityView } from './components/BookActivityView';
import { PresentationExportView } from './components/PresentationExportView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { 
  StudentUser, 
  WorkbookEntry, 
  WeatherRecord, 
  BookActivity, 
  StudentSubmission 
} from './types';
import { 
  PLACES_DATA, 
  INITIAL_WEATHER_RECORDS, 
  BOOK_ACTIVITY_BACKGROUND 
} from './data/travelData';
import { 
  saveStudentSubmission, 
  loadStudentSubmission, 
  subscribeAllSubmissions 
} from './services/submissionService';

export default function App() {
  // Current logged in user (Student or Admin)
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(() => {
    const saved = localStorage.getItem('damyang_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Default initial user for instant preview
    return {
      studentId: '30215',
      name: '이수민',
      school: '담양여자중학교',
      role: 'student'
    };
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(PLACES_DATA[0].id);

  // Workbook entries per place
  const [workbookEntries, setWorkbookEntries] = useState<Record<string, WorkbookEntry>>(() => {
    const initial: Record<string, WorkbookEntry> = {};
    PLACES_DATA.forEach((p) => {
      initial[p.id] = {
        placeId: p.id,
        reflectionText: '',
        curriculumResponses: {},
        stampAcquired: false
      };
    });
    return initial;
  });

  // Weather records (4 days)
  const [weatherRecords, setWeatherRecords] = useState<WeatherRecord[]>(INITIAL_WEATHER_RECORDS);

  // Book activity
  const [bookActivity, setBookActivity] = useState<BookActivity>({
    readingSummary: '',
    clockExchangeMeaning: '',
    ifIWereHero: '',
    symbolismReflection: '',
    myPromiseToFuture: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [adminUnreadCount, setAdminUnreadCount] = useState<number>(0);

  // Load user data on startup or user change
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return;

    loadStudentSubmission(currentUser.studentId).then((sub) => {
      if (sub) {
        if (sub.workbookEntries) {
          setWorkbookEntries((prev) => ({ ...prev, ...sub.workbookEntries }));
        }
        if (sub.weatherRecords && sub.weatherRecords.length) {
          setWeatherRecords(sub.weatherRecords);
        }
        if (sub.bookActivity) {
          setBookActivity(sub.bookActivity);
        }
        if (sub.isCompleted) {
          setIsSubmitted(true);
        }
      }
    });
  }, [currentUser?.studentId]);

  // Real-time listener for submissions count
  useEffect(() => {
    const unsubscribe = subscribeAllSubmissions((list) => {
      const completed = list.filter(s => s.isCompleted);
      setAdminUnreadCount(completed.length);
    });
    return () => unsubscribe();
  }, []);

  // Update workbook entry
  const handleUpdateEntry = (placeId: string, updated: Partial<WorkbookEntry>) => {
    setWorkbookEntries((prev) => {
      const existing = prev[placeId] || {
        placeId,
        reflectionText: '',
        curriculumResponses: {},
        stampAcquired: false
      };
      const nextEntry = { ...existing, ...updated };
      const next = { ...prev, [placeId]: nextEntry };

      // Autosave to Firestore if student logged in
      if (currentUser && currentUser.role === 'student') {
        syncToCloud(currentUser, next, weatherRecords, bookActivity, isSubmitted);
      }
      return next;
    });
  };

  // Update weather record
  const handleUpdateWeather = (day: number, updated: Partial<WeatherRecord>) => {
    setWeatherRecords((prev) => {
      const next = prev.map((w) => (w.day === day ? { ...w, ...updated } : w));
      if (currentUser && currentUser.role === 'student') {
        syncToCloud(currentUser, workbookEntries, next, bookActivity, isSubmitted);
      }
      return next;
    });
  };

  // Update book activity
  const handleUpdateBookActivity = (updated: Partial<BookActivity>) => {
    setBookActivity((prev) => {
      const next = { ...prev, ...updated };
      if (currentUser && currentUser.role === 'student') {
        syncToCloud(currentUser, workbookEntries, weatherRecords, next, isSubmitted);
      }
      return next;
    });
  };

  // Helper to sync to Firestore
  const syncToCloud = async (
    user: StudentUser,
    entries: Record<string, WorkbookEntry>,
    weather: WeatherRecord[],
    book: BookActivity,
    completed: boolean
  ) => {
    const totalStamps = (Object.values(entries) as WorkbookEntry[]).filter(e => e.stampAcquired).length;
    const submission: StudentSubmission = {
      studentId: user.studentId,
      studentName: user.name,
      school: user.school,
      workbookEntries: entries,
      weatherRecords: weather,
      bookActivity: book,
      isCompleted: completed,
      totalStamps,
      updatedAt: new Date().toISOString()
    };
    await saveStudentSubmission(submission);
  };

  // Handle final submission of 8 stamps
  const handleSubmitAllStamps = async () => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const totalStamps = (Object.values(workbookEntries) as WorkbookEntry[]).filter(e => e.stampAcquired).length;
      const submission: StudentSubmission = {
        studentId: currentUser.studentId,
        studentName: currentUser.name,
        school: currentUser.school,
        workbookEntries,
        weatherRecords,
        bookActivity,
        isCompleted: true,
        totalStamps,
        submittedAt: new Date().toLocaleString('ko-KR'),
        updatedAt: new Date().toISOString()
      };
      await saveStudentSubmission(submission);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSuccess = (user: StudentUser) => {
    setCurrentUser(user);
    localStorage.setItem('damyang_user', JSON.stringify(user));
    if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('damyang_user');
    setCurrentUser(null);
    setLoginModalOpen(true);
  };

  const stampsCount = (Object.values(workbookEntries) as WorkbookEntry[]).filter(e => e.stampAcquired).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Bright Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stampsCount={stampsCount}
        totalStamps={PLACES_DATA.length}
        onLogout={handleLogout}
        onOpenLogin={() => setLoginModalOpen(true)}
        adminNewSubmissionsCount={currentUser?.role === 'admin' ? adminUnreadCount : undefined}
      />

      {/* Main Responsive Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            entries={workbookEntries}
            setActiveTab={setActiveTab}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            onNavigateToPlace={(id) => {
              setSelectedPlaceId(id);
              setActiveTab('places');
            }}
          />
        )}

        {activeTab === 'places' && (
          <PlacesWorkbookView
            entries={workbookEntries}
            onUpdateEntry={handleUpdateEntry}
            onNavigateToStamp={(id) => {
              setSelectedPlaceId(id);
              setActiveTab('stamps');
            }}
            selectedPlaceId={selectedPlaceId}
          />
        )}

        {activeTab === 'stamps' && (
          <StampTourView
            currentUser={currentUser}
            entries={workbookEntries}
            onUpdateEntry={handleUpdateEntry}
            onSubmitAllStamps={handleSubmitAllStamps}
            isSubmitting={isSubmitting}
            isSubmitted={isSubmitted}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'toolkit' && <TravelToolkitView />}

        {activeTab === 'immigration' && <ImmigrationEnglishView />}

        {activeTab === 'chinese' && <ChinesePhrasesView />}

        {activeTab === 'weather' && (
          <WeatherInvestigationView
            records={weatherRecords}
            onUpdateRecord={handleUpdateWeather}
          />
        )}

        {activeTab === 'book' && (
          <BookActivityView
            activity={bookActivity}
            onUpdateActivity={handleUpdateBookActivity}
          />
        )}

        {activeTab === 'export' && (
          <PresentationExportView
            currentUser={currentUser}
            entries={workbookEntries}
            weatherRecords={weatherRecords}
            bookActivity={bookActivity}
          />
        )}

        {activeTab === 'admin' && <AdminDashboardView />}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200/80 bg-white/80 py-6 text-center text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span>🎋 2026. 글로컬 죽향 역사문화탐방</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">담양여자중학교 학생 워크북</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            상하이 8대 명소 스탬프 랠리 & 통합 교과연계 워크북
          </div>
        </div>
      </footer>

      {/* Login & Authentication Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
