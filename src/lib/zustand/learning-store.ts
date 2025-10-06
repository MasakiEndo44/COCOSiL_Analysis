import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 診断結果コンテキスト（パーソナライゼーション用）
interface UserDiagnosisContext {
  primaryType: number;        // 主体癖（1-10）
  secondaryType: number;      // 副体癖（1-10）
  diagnosedAt: string;        // 診断日時（ISO string）
}

interface LearningProgress {
  completedChapters: string[];
  currentChapter: string | null;
  quizScores: Record<string, number>;
  lastVisited?: string;
  startedAt?: Date;
  userContext?: UserDiagnosisContext;  // 診断結果パーソナライゼーション
  chapterTimeSpent?: Record<string, number>;  // 各章の滞在時間（秒）
  chapterStartTime?: number;  // 現在の章の開始時刻（ms）
}

interface LearningState {
  progress: LearningProgress;
}

interface LearningActions {
  markChapterComplete: (chapterId: string) => void;
  setCurrentChapter: (chapterId: string) => void;
  setQuizScore: (chapterId: string, score: number) => void;
  resetProgress: () => void;
  getProgress: () => number;
  isChapterCompleted: (chapterId: string) => boolean;
  setUserContext: (primaryType: number, secondaryType: number) => void;  // 診断結果連携
  clearUserContext: () => void;  // コンテキストクリア
  startChapterTimer: (chapterId: string) => void;  // 章の時間トラッキング開始
  stopChapterTimer: () => void;  // 章の時間トラッキング停止
  getChapterTimeSpent: (chapterId: string) => number;  // 章の滞在時間取得
}

type LearningStore = LearningState & LearningActions;

const CHAPTERS = ['introduction', 'types', 'primary-secondary', 'applications', 'significance'];

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      progress: {
        completedChapters: [],
        currentChapter: null,
        quizScores: {},
        startedAt: undefined,
      },

      // アクション
      markChapterComplete: (chapterId: string) => {
        set((state) => {
          const completedChapters = state.progress.completedChapters.includes(chapterId)
            ? state.progress.completedChapters
            : [...state.progress.completedChapters, chapterId];
          
          return {
            progress: {
              ...state.progress,
              completedChapters,
              lastVisited: new Date().toISOString(),
            },
          };
        });
      },

      setCurrentChapter: (chapterId: string) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentChapter: chapterId,
            lastVisited: new Date().toISOString(),
            startedAt: state.progress.startedAt || new Date(),
          },
        }));
      },

      setQuizScore: (chapterId: string, score: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            quizScores: {
              ...state.progress.quizScores,
              [chapterId]: score,
            },
          },
        }));
      },

      resetProgress: () => {
        set({
          progress: {
            completedChapters: [],
            currentChapter: null,
            quizScores: {},
            startedAt: undefined,
          },
        });
      },

      getProgress: () => {
        const { completedChapters } = get().progress;
        return Math.round((completedChapters.length / CHAPTERS.length) * 100);
      },

      isChapterCompleted: (chapterId: string) => {
        const { completedChapters } = get().progress;
        return completedChapters.includes(chapterId);
      },

      setUserContext: (primaryType: number, secondaryType: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            userContext: {
              primaryType,
              secondaryType,
              diagnosedAt: new Date().toISOString(),
            },
          },
        }));
      },

      clearUserContext: () => {
        set((state) => ({
          progress: {
            ...state.progress,
            userContext: undefined,
          },
        }));
      },

      // 🆕 Progressive Disclosure: Chapter time tracking
      startChapterTimer: (chapterId: string) => {
        set((state) => ({
          progress: {
            ...state.progress,
            chapterStartTime: Date.now(),
            currentChapter: chapterId,
          },
        }));
      },

      stopChapterTimer: () => {
        set((state) => {
          const { chapterStartTime, currentChapter, chapterTimeSpent = {} } = state.progress;

          if (!chapterStartTime || !currentChapter) {
            return state;
          }

          const elapsedSeconds = Math.floor((Date.now() - chapterStartTime) / 1000);
          const previousTime = chapterTimeSpent[currentChapter] || 0;

          return {
            progress: {
              ...state.progress,
              chapterTimeSpent: {
                ...chapterTimeSpent,
                [currentChapter]: previousTime + elapsedSeconds,
              },
              chapterStartTime: undefined,
            },
          };
        });
      },

      getChapterTimeSpent: (chapterId: string) => {
        const { chapterTimeSpent = {} } = get().progress;
        return chapterTimeSpent[chapterId] || 0;
      },
    }),
    {
      name: 'cocosil-learning-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);

export const CHAPTER_INFO = {
  'introduction': {
    title: '体癖とは',
    description: '野口整体における位置づけと基本概念',
    estimatedTime: 5,
    order: 1,
  },
  'types': {
    title: '10種類の体癖',
    description: '各タイプの基本概念と特徴',
    estimatedTime: 15,
    order: 2,
  },
  'primary-secondary': {
    title: '主体癖・副体癖',
    description: '組み合わせの考え方と複合的解釈',
    estimatedTime: 8,
    order: 3,
  },
  'applications': {
    title: '体癖の活用法',
    description: '日常生活での応用方法',
    estimatedTime: 10,
    order: 4,
  },
  'significance': {
    title: '診断の意義',
    description: '自己理解の深化について',
    estimatedTime: 7,
    order: 5,
  },
} as const;