import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BadgeType, CelebrationType } from '@/domain/learn/motivation-config';

// 診断結果コンテキスト（パーソナライゼーション用）
interface UserDiagnosisContext {
  primaryType: number;        // 主体癖（1-10）
  secondaryType: number;      // 副体癖（1-10）
  diagnosedAt: string;        // 診断日時（ISO string）
}

// モチベーションシステム
interface DailyActivity {
  date: string;  // ISO date (YYYY-MM-DD)
  chaptersRead: string[];
  quizzesTaken: string[];
  timeSpent: number;  // seconds
}

interface MotivationState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;  // ISO date
  dailyLog: Record<string, DailyActivity>;  // keyed by ISO date
  unlockedBadges: BadgeType[];
  celebrationQueue: Array<{
    type: CelebrationType;
    badgeId?: BadgeType;
    metadata?: Record<string, unknown>;
  }>;
  nextNudgeAt: string | null;  // ISO datetime
  missedDays: number;
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
  motivation: MotivationState;
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

  // Motivation actions
  logActivity: (activityType: 'chapter' | 'quiz', chapterId: string, metadata?: Record<string, unknown>) => void;
  unlockBadge: (badgeId: BadgeType) => void;
  queueCelebration: (type: CelebrationType, badgeId?: BadgeType, metadata?: Record<string, unknown>) => void;
  dismissCelebration: () => void;
  updateStreak: () => void;
  getActiveNudge: () => { type: string; message: string } | null;
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

      motivation: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        dailyLog: {},
        unlockedBadges: [],
        celebrationQueue: [],
        nextNudgeAt: null,
        missedDays: 0,
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

      // 🆕 Motivation Actions
      logActivity: (activityType: 'chapter' | 'quiz', chapterId: string, metadata?: Record<string, unknown>) => {
        const today = new Date().toISOString().split('T')[0];

        set((state) => {
          const currentLog = state.motivation.dailyLog[today] || {
            date: today,
            chaptersRead: [],
            quizzesTaken: [],
            timeSpent: 0,
          };

          const updatedLog: DailyActivity = {
            ...currentLog,
            chaptersRead:
              activityType === 'chapter' && !currentLog.chaptersRead.includes(chapterId)
                ? [...currentLog.chaptersRead, chapterId]
                : currentLog.chaptersRead,
            quizzesTaken:
              activityType === 'quiz' && !currentLog.quizzesTaken.includes(chapterId)
                ? [...currentLog.quizzesTaken, chapterId]
                : currentLog.quizzesTaken,
            timeSpent: currentLog.timeSpent + (metadata?.timeSpent as number || 0),
          };

          return {
            motivation: {
              ...state.motivation,
              dailyLog: {
                ...state.motivation.dailyLog,
                [today]: updatedLog,
              },
              lastActivityDate: today,
            },
          };
        });

        // Update streak after logging activity
        get().updateStreak();
      },

      unlockBadge: (badgeId: BadgeType) => {
        set((state) => {
          if (state.motivation.unlockedBadges.includes(badgeId)) {
            return state; // Already unlocked
          }

          return {
            motivation: {
              ...state.motivation,
              unlockedBadges: [...state.motivation.unlockedBadges, badgeId],
            },
          };
        });
      },

      queueCelebration: (type: CelebrationType, badgeId?: BadgeType, metadata?: Record<string, unknown>) => {
        set((state) => ({
          motivation: {
            ...state.motivation,
            celebrationQueue: [
              ...state.motivation.celebrationQueue,
              { type, badgeId, metadata },
            ],
          },
        }));
      },

      dismissCelebration: () => {
        set((state) => ({
          motivation: {
            ...state.motivation,
            celebrationQueue: state.motivation.celebrationQueue.slice(1),
          },
        }));
      },

      updateStreak: () => {
        const { lastActivityDate } = get().motivation;
        const today = new Date().toISOString().split('T')[0];

        if (!lastActivityDate) {
          // First activity ever
          set((state) => ({
            motivation: {
              ...state.motivation,
              currentStreak: 1,
              longestStreak: 1,
            },
          }));
          return;
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const daysSinceLastActivity = Math.floor(
          (new Date(today).getTime() - new Date(lastActivityDate).getTime()) / 86400000
        );

        set((state) => {
          let newStreak = state.motivation.currentStreak;

          if (daysSinceLastActivity === 0) {
            // Activity today - streak continues
            return state;
          } else if (daysSinceLastActivity === 1 || lastActivityDate === yesterday) {
            // Consecutive day - increment streak
            newStreak = state.motivation.currentStreak + 1;
          } else if (daysSinceLastActivity > 1) {
            // Streak broken - reset
            newStreak = 1;
          }

          return {
            motivation: {
              ...state.motivation,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.motivation.longestStreak),
              missedDays: daysSinceLastActivity > 1 ? daysSinceLastActivity - 1 : 0,
            },
          };
        });
      },

      getActiveNudge: () => {
        const { completedChapters, quizScores } = get().progress;
        const { lastActivityDate, currentStreak } = get().motivation;
        const today = new Date().toISOString().split('T')[0];

        // Welcome back nudge (24h+ absence)
        if (lastActivityDate && lastActivityDate !== today) {
          const daysSince = Math.floor(
            (new Date().getTime() - new Date(lastActivityDate).getTime()) / 86400000
          );
          if (daysSince >= 1) {
            return {
              type: 'welcome-back',
              message: '前回の続きから学習を再開しましょう',
            };
          }
        }

        // Streak reminder
        if (currentStreak > 0 && lastActivityDate === today) {
          return {
            type: 'streak-reminder',
            message: `${currentStreak}日連続学習中！この調子で続けましょう`,
          };
        }

        // Completion nearby
        if (completedChapters.length === 4) {
          return {
            type: 'completion-nearby',
            message: 'あと1章でコース完了です',
          };
        }

        // Quiz encouragement (scored below 70%)
        const lowScoreChapters = Object.entries(quizScores).filter(([_, score]) => score < 70);
        if (lowScoreChapters.length > 0) {
          return {
            type: 'quiz-encouragement',
            message: '再挑戦してさらに理解を深めましょう',
          };
        }

        return null;
      },
    }),
    {
      name: 'cocosil-learning-progress',
      partialize: (state) => ({ progress: state.progress, motivation: state.motivation }),
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