/**
 * Motivation Service
 *
 * Pure utility functions for motivation system calculations:
 * - Badge unlock evaluation
 * - Streak calculations
 * - Nudge message selection
 * - Celebration payload generation
 */

import {
  BadgeType,
  BadgeMetadata,
  BADGE_DEFINITIONS,
  CelebrationType,
  CELEBRATION_CONFIGS,
} from '@/domain/learn/motivation-config';

export interface BadgeUnlockResult {
  badgeId: BadgeType;
  justUnlocked: boolean;
  metadata: BadgeMetadata;
}

export interface MotivationContext {
  completedChapters: number;
  perfectQuizScores: number;
  currentStreak: number;
  totalTimeMinutes: number;
  unlockedBadges: BadgeType[];
}

/**
 * Evaluate which badges should be unlocked based on current context
 * Returns array of badges with unlock status
 */
export function evaluateBadgeUnlocks(context: MotivationContext): BadgeUnlockResult[] {
  const results: BadgeUnlockResult[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    const alreadyUnlocked = context.unlockedBadges.includes(badge.id);
    let shouldUnlock = false;

    switch (badge.trigger) {
      case 'chapter-complete':
        shouldUnlock = context.completedChapters >= badge.threshold;
        break;

      case 'quiz-score':
        if (badge.id === 'quiz-master') {
          // Special case: count perfect scores
          shouldUnlock = context.perfectQuizScores >= badge.threshold;
        } else if (badge.id === 'perfect-score') {
          // Single perfect score
          shouldUnlock = context.perfectQuizScores >= 1;
        }
        break;

      case 'streak-milestone':
        shouldUnlock = context.currentStreak >= badge.threshold;
        break;

      case 'course-complete':
        shouldUnlock = context.completedChapters >= 5; // All chapters
        break;

      case 'time-milestone':
        shouldUnlock = context.totalTimeMinutes >= badge.threshold;
        break;
    }

    results.push({
      badgeId: badge.id,
      justUnlocked: shouldUnlock && !alreadyUnlocked,
      metadata: badge,
    });
  }

  return results.filter((result) => result.justUnlocked);
}

/**
 * Calculate streak status with grace period consideration
 */
export function calculateStreakStatus(
  lastActivityDate: string | null,
  _currentStreak: number
): {
  isActive: boolean;
  shouldReset: boolean;
  gracePeriodRemaining: number | null; // hours
} {
  if (!lastActivityDate) {
    return {
      isActive: false,
      shouldReset: false,
      gracePeriodRemaining: null,
    };
  }

  const now = new Date();
  const lastActivity = new Date(lastActivityDate);
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  const GRACE_PERIOD_HOURS = 26; // 24h + 2h grace period

  if (hoursSinceActivity < 24) {
    // Active today
    return {
      isActive: true,
      shouldReset: false,
      gracePeriodRemaining: null,
    };
  } else if (hoursSinceActivity < GRACE_PERIOD_HOURS) {
    // In grace period
    const remaining = GRACE_PERIOD_HOURS - hoursSinceActivity;
    return {
      isActive: true,
      shouldReset: false,
      gracePeriodRemaining: remaining,
    };
  } else {
    // Grace period expired
    return {
      isActive: false,
      shouldReset: true,
      gracePeriodRemaining: null,
    };
  }
}

/**
 * Generate celebration payload for newly unlocked badges
 */
export function generateCelebrationPayload(
  badgeId: BadgeType
): {
  type: CelebrationType;
  badgeId: BadgeType;
  config: typeof CELEBRATION_CONFIGS[CelebrationType];
} {
  return {
    type: 'badge-unlock',
    badgeId,
    config: CELEBRATION_CONFIGS['badge-unlock'],
  };
}

/**
 * Get celebration config for specific event type
 */
export function getCelebrationConfig(type: CelebrationType) {
  return CELEBRATION_CONFIGS[type];
}

/**
 * Format time duration for display
 */
export function formatTimeDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${remainingMinutes}分`;
}

/**
 * Get progress percentage towards next badge
 */
export function getNextBadgeProgress(context: MotivationContext): {
  badgeId: BadgeType;
  progress: number; // 0-100
  remaining: number;
  metadata: BadgeMetadata;
} | null {
  // Find next unachieved badge
  const nextBadge = BADGE_DEFINITIONS.find((badge) => {
    if (context.unlockedBadges.includes(badge.id)) return false;

    switch (badge.trigger) {
      case 'chapter-complete':
        return context.completedChapters < badge.threshold;
      case 'streak-milestone':
        return context.currentStreak < badge.threshold;
      case 'quiz-score':
        if (badge.id === 'quiz-master') {
          return context.perfectQuizScores < badge.threshold;
        }
        return context.perfectQuizScores < 1;
      case 'course-complete':
        return context.completedChapters < 5;
      case 'time-milestone':
        return context.totalTimeMinutes < badge.threshold;
      default:
        return false;
    }
  });

  if (!nextBadge) return null;

  let current = 0;
  let target = nextBadge.threshold;

  switch (nextBadge.trigger) {
    case 'chapter-complete':
      current = context.completedChapters;
      break;
    case 'streak-milestone':
      current = context.currentStreak;
      break;
    case 'quiz-score':
      current = context.perfectQuizScores;
      break;
    case 'course-complete':
      current = context.completedChapters;
      target = 5;
      break;
    case 'time-milestone':
      current = context.totalTimeMinutes;
      break;
  }

  const progress = Math.min(100, (current / target) * 100);
  const remaining = Math.max(0, target - current);

  return {
    badgeId: nextBadge.id,
    progress,
    remaining,
    metadata: nextBadge,
  };
}
