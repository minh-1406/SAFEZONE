export interface ReportMessage {
  sender: "Counselor" | "Student";
  message: string;
  date: string;
}

export interface Report {
  code: string;
  schoolName: string;
  category: string;
  title: string;
  description: string;
  date: string;
  location: string;
  evidenceText?: string;
  evidenceFiles?: { name: string; data: string; type: string }[];
  status: "Đang chờ tiếp nhận" | "Đang xử lý" | "Đang tham vấn" | "Đã giải quyết";
  responses: ReportMessage[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    score: number; // For Silent Exclusion index
  }[];
}

export interface MoodEntry {
  id: string;
  date: string; // Will store "HH:MM - DD/MM/YYYY"
  mood: string;
  note: string;
}

export interface HealingJournal {
  id: string;
  date: string;
  negativeThought: string;
  restructuredThought: string; // Cognitive Behavioral Restructuring output
  emotion: string;
}

export interface SchoolSettings {
  schoolName: string;
  hotline?: string;
  counselingRoom?: string;
  consultationHours?: string;
  principalHotline?: string;
  bannerNotice?: string;
  handoverDate?: string;
  handoverNote?: string;
}

export interface Counselor {
  email: string;
  name: string;
  role: "Admin" | "Co-Admin" | "Counselor";
  school: string;
}
