export interface StudentUser {
  studentId: string;
  name: string;
  password?: string;
  school: string;
  role: 'student' | 'admin';
}

export interface CurriculumLink {
  subject: string;
  title: string;
  description: string;
  guideQuestion: string;
}

export interface HistoricalEvent {
  title: string;
  desc: string;
}

export interface PlaceInfo {
  id: string;
  name: string;
  chineseName: string;
  location: string;
  day: number;
  dayLabel: string;
  timeSlot: string;
  features: string;
  koreaConnection: string;
  historicalEvents: HistoricalEvent[];
  curriculumLinks: CurriculumLink[];
  stampPhotoRequirement: string;
  image: string;
  emoji: string;
}

export interface WorkbookEntry {
  placeId: string;
  reflectionText: string;
  curriculumResponses: Record<string, string>;
  photoUrl?: string;
  stampAcquired: boolean;
  stampedAt?: string;
}

export interface WeatherRecord {
  day: number;
  date: string;
  city: string;
  forecast: string;
  morningTemp: number;
  afternoonTemp: number;
  humidity: number;
  clothingNotes: string;
  studentInvestigation: string;
}

export interface BookActivity {
  readingSummary: string;
  clockExchangeMeaning: string;
  ifIWereHero: string;
  symbolismReflection: string;
  myPromiseToFuture: string;
}

export interface StudentSubmission {
  id?: string;
  studentId: string;
  studentName: string;
  school: string;
  submittedAt?: string;
  updatedAt: string;
  isCompleted: boolean;
  totalStamps: number;
  workbookEntries: Record<string, WorkbookEntry>;
  weatherRecords: WeatherRecord[];
  bookActivity: BookActivity;
}

export interface PhraseItem {
  id: string;
  category: '공항/입국' | '인사/기본' | '식당/음식' | '길찾기/교통' | '쇼핑/흥정' | '긴급/호텔';
  chinese: string;
  pinyin: string;
  koreanPronunciation: string;
  meaning: string;
  tip?: string;
}

export interface ImmigrationQuestion {
  id: string;
  question: string;
  koreanMeaning: string;
  sampleAnswer: string;
  answerKorean: string;
  tips: string;
  audioText: string;
}
