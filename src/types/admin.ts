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
  subTaiheki: number;
  sixStar: string;
  theme: string; // カンマ区切りのタグ
  advice: string;
  satisfaction: 1 | 2 | 3 | 4 | 5;
  duration: string; // "45分"等
  feedback: string;
  reportUrl?: string;
  interviewScheduled?: string;
  interviewDone?: string;
  memo?: string;
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

export interface MasterData {
  animals: AnimalMaster[];
  zodiac: ZodiacMaster[];
  mbti: MbtiMaster[];
  taiheki: TaihekiMaster[];
  sixStar: SixStarMaster[];
}

export interface AnimalMaster {
  animal: string;
  orientation: string;
  trait: string;
  strength: string;
  caution: string;
}

export interface ZodiacMaster {
  zodiac: string;
  period: string;
  element: string;
  nature: string;
  ruler: string;
}

export interface MbtiMaster {
  type: string;
  nickname: string;
  trait: string;
  strength: string;
  caution: string;
}

export interface TaihekiMaster {
  number: string;
  type: string;
  trait: string;
  pattern: string;
  career: string;
}

export interface SixStarMaster {
  star: string;
  plusminus: '+' | '-';
  trait: string;
  career: string;
  caution: string;
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