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