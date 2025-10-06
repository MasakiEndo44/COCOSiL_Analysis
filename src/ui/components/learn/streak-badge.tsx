'use client';

import { useLearningStore } from '@/lib/zustand/learning-store';
import { calculateStreakStatus } from '@/lib/motivation/motivation-service';

interface StreakBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function StreakBadge({ variant = 'compact', className = '' }: StreakBadgeProps) {
  const { currentStreak, longestStreak, lastActivityDate } = useLearningStore(
    (state) => state.motivation
  );

  const streakStatus = calculateStreakStatus(lastActivityDate, currentStreak);

  if (currentStreak === 0 && variant === 'compact') {
    return null; // Hide compact badge when no streak
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-3 border border-orange-200 ${className}`}
    >
      {/* Fire Icon */}
      <div className="flex items-center justify-center">
        <span className="text-2xl" role="img" aria-label="Streak fire">
          🔥
        </span>
      </div>

      {/* Streak Info */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-orange-700">{currentStreak}</span>
          <span className="text-sm text-orange-600">日連続</span>
        </div>

        {variant === 'full' && (
          <div className="text-xs text-orange-500">
            {streakStatus.isActive ? (
              <span>連続学習中</span>
            ) : (
              <span>新しい連続記録を始めましょう</span>
            )}
          </div>
        )}
      </div>

      {/* Grace Period Warning */}
      {streakStatus.gracePeriodRemaining !== null && (
        <div className="ml-auto text-xs text-orange-600 flex items-center gap-1">
          <span>⏰</span>
          <span>{Math.ceil(streakStatus.gracePeriodRemaining)}時間以内に学習</span>
        </div>
      )}

      {/* Longest Streak (full variant only) */}
      {variant === 'full' && longestStreak > currentStreak && (
        <div className="ml-auto text-xs text-gray-500">
          最長: {longestStreak}日
        </div>
      )}
    </div>
  );
}
