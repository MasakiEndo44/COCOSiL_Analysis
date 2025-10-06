/**
 * Progressive Disclosure Metadata for Taiheki Learning Chapters
 *
 * Defines prerequisites, unlock conditions, and gating logic for chapters.
 * Used by the progressive disclosure system to control content access.
 */

export interface ChapterPrerequisite {
  type: 'chapter_complete' | 'quiz_pass' | 'time_spent' | 'none';
  chapterId?: string;        // Required chapter completion
  quizId?: string;           // Required quiz pass
  minScore?: number;         // Minimum quiz score (0-100)
  minTimeSeconds?: number;   // Minimum time spent in previous chapter
}

export interface ChapterUnlockMetadata {
  chapterId: string;
  order: number;
  isLocked: boolean;         // Default lock state (can be overridden by progress)
  prerequisites: ChapterPrerequisite[];
  unlockMessage?: string;    // Message shown when locked
  estimatedMinutes: number;  // Expected completion time
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Chapter unlock configuration
 *
 * Progressive disclosure strategy:
 * - Chapter 1 (introduction): Always unlocked
 * - Chapter 2 (types): Unlocked after completing Chapter 1
 * - Chapter 3 (application): Unlocked after Chapter 2 quiz pass (≥70%)
 * - Chapter 4 (practice): Unlocked after Chapter 3 + 5min minimum time
 * - Chapter 5 (integration): Unlocked after all previous chapters
 */
export const CHAPTER_UNLOCK_CONFIG: Record<string, ChapterUnlockMetadata> = {
  'introduction': {
    chapterId: 'introduction',
    order: 1,
    isLocked: false,
    prerequisites: [
      { type: 'none' }
    ],
    estimatedMinutes: 3,
    difficulty: 'beginner',
  },

  'types': {
    chapterId: 'types',
    order: 2,
    isLocked: true,
    prerequisites: [
      {
        type: 'chapter_complete',
        chapterId: 'introduction',
      }
    ],
    unlockMessage: '「体癖とは」の章を完了すると解除されます',
    estimatedMinutes: 4,
    difficulty: 'beginner',
  },

  'application': {
    chapterId: 'application',
    order: 3,
    isLocked: true,
    prerequisites: [
      {
        type: 'quiz_pass',
        chapterId: 'types',
        quizId: 'types-quiz',
        minScore: 70,
      }
    ],
    unlockMessage: '「10種の特徴」のクイズに合格すると解除されます（70点以上）',
    estimatedMinutes: 5,
    difficulty: 'intermediate',
  },

  'practice': {
    chapterId: 'practice',
    order: 4,
    isLocked: true,
    prerequisites: [
      {
        type: 'chapter_complete',
        chapterId: 'application',
      },
      {
        type: 'time_spent',
        chapterId: 'application',
        minTimeSeconds: 300, // 5 minutes
      }
    ],
    unlockMessage: '「実生活への活用」を5分以上学習すると解除されます',
    estimatedMinutes: 4,
    difficulty: 'intermediate',
  },

  'integration': {
    chapterId: 'integration',
    order: 5,
    isLocked: true,
    prerequisites: [
      {
        type: 'chapter_complete',
        chapterId: 'practice',
      }
    ],
    unlockMessage: 'すべての章を完了すると解除されます',
    estimatedMinutes: 4,
    difficulty: 'advanced',
  },
};

/**
 * Check if a chapter is unlocked based on user progress
 */
export function isChapterUnlocked(
  chapterId: string,
  progress: {
    completedChapters: string[];
    quizScores: Record<string, number>;
    chapterTimeSpent?: Record<string, number>; // seconds
  }
): { unlocked: boolean; reason?: string } {
  const metadata = CHAPTER_UNLOCK_CONFIG[chapterId];

  if (!metadata) {
    return { unlocked: false, reason: 'Chapter not found' };
  }

  // Always unlocked chapters
  if (!metadata.isLocked) {
    return { unlocked: true };
  }

  // Check all prerequisites
  for (const prereq of metadata.prerequisites) {
    switch (prereq.type) {
      case 'none':
        continue;

      case 'chapter_complete':
        if (!prereq.chapterId || !progress.completedChapters.includes(prereq.chapterId)) {
          return {
            unlocked: false,
            reason: metadata.unlockMessage || `Complete ${prereq.chapterId} first`
          };
        }
        break;

      case 'quiz_pass':
        if (!prereq.quizId || !prereq.minScore) {
          continue;
        }
        const score = progress.quizScores[prereq.quizId] || 0;
        if (score < prereq.minScore) {
          return {
            unlocked: false,
            reason: metadata.unlockMessage || `Pass quiz with ${prereq.minScore}% or higher`
          };
        }
        break;

      case 'time_spent':
        if (!prereq.chapterId || !prereq.minTimeSeconds) {
          continue;
        }
        const timeSpent = progress.chapterTimeSpent?.[prereq.chapterId] || 0;
        if (timeSpent < prereq.minTimeSeconds) {
          const remainingMinutes = Math.ceil((prereq.minTimeSeconds - timeSpent) / 60);
          return {
            unlocked: false,
            reason: metadata.unlockMessage || `Spend ${remainingMinutes} more minutes in ${prereq.chapterId}`
          };
        }
        break;
    }
  }

  return { unlocked: true };
}

/**
 * Get next unlockable chapter for user
 */
export function getNextUnlockableChapter(
  progress: {
    completedChapters: string[];
    quizScores: Record<string, number>;
    chapterTimeSpent?: Record<string, number>;
  }
): { chapterId: string; metadata: ChapterUnlockMetadata; reason: string } | null {
  const allChapters = Object.values(CHAPTER_UNLOCK_CONFIG).sort((a, b) => a.order - b.order);

  for (const metadata of allChapters) {
    const { unlocked } = isChapterUnlocked(metadata.chapterId, progress);

    if (!unlocked) {
      return {
        chapterId: metadata.chapterId,
        metadata,
        reason: metadata.unlockMessage || 'Complete prerequisites to unlock',
      };
    }
  }

  return null; // All chapters unlocked
}

/**
 * Calculate overall learning progress percentage
 */
export function calculateProgressPercentage(
  completedChapters: string[],
  totalChapters: number = 5
): number {
  return Math.round((completedChapters.length / totalChapters) * 100);
}

/**
 * Get chapter difficulty badge color
 */
export function getDifficultyColor(difficulty: ChapterUnlockMetadata['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'advanced':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}
