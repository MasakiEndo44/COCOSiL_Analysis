// 管理者用データベース型定義

export interface DiagnosisRecord {
  id: number;
  date: string;
  name: string;
  birthDate: string;
  age: number;
  gender: 'male' | 'female' | 'no_answer';
  zodiac: string;
  animal: string;
  orientation: 'people_oriented' | 'castle_oriented' | 'big_vision_oriented';
  color: string;
  mbti: string;
  mainTaiheki: number;
  subTaiheki: number | null;
  sixStar: string;
  theme: string; // カンマ区切りのタグ
  advice: string;
  satisfaction: 1 | 2 | 3 | 4 | 5;
  duration: string; // "45分"等
  feedback: string;
  reportUrl?: string;
  interviewScheduled?: string;
  interviewDone?: string;
  interviewNotes?: string;
  memo?: string;
  // 統合診断専用フィールド
  integratedKeywords?: string; // JSON配列形式
  aiSummary?: string;
  fortuneColor?: string;
  reportVersion?: string;
  isIntegratedReport?: boolean;
  markdownContent?: string | null;
  markdownVersion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagnosisStats {
  totalRecords: number;
  genderDistribution: Record<string, number>;
  ageGroups: Record<string, number>;
  animalDistribution: Record<string, number>;
  orientationDistribution: Record<string, number>;
  satisfactionDistribution: Record<string, number>;
  themeDistribution: Record<string, number>;
  mbtiDistribution: Record<string, number>;
  taihekiDistribution: Record<string, number>;
  sixStarDistribution: Record<string, number>;
  averageSatisfaction: number;
  averageDuration: number;
}


export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  lastLogin?: Date | null;
  createdAt: Date;
}

export interface ExportOptions {
  format: 'excel' | 'csv';
  includeStats: boolean;
  includeMasterData: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}