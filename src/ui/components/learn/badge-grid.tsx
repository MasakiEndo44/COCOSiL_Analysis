'use client';

import { useLearningStore } from '@/lib/zustand/learning-store';
import { BADGE_DEFINITIONS, BadgeMetadata } from '@/domain/learn/motivation-config';
import { getNextBadgeProgress, type MotivationContext } from '@/lib/motivation/motivation-service';

interface BadgeCardProps {
  badge: BadgeMetadata;
  isUnlocked: boolean;
  progress?: number;
}

function BadgeCard({ badge, isUnlocked, progress }: BadgeCardProps) {
  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50',
  };

  return (
    <div
      className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
        isUnlocked
          ? `${badge.colorClass} border-opacity-100 opacity-100`
          : `${rarityColors[badge.rarity]} opacity-40 grayscale`
      }`}
    >
      {/* Icon */}
      <div className="text-4xl mb-2">{badge.icon}</div>

      {/* Badge Title */}
      <h4 className="font-bold text-sm text-center mb-1">{badge.title}</h4>

      {/* Description */}
      <p className="text-xs text-center text-gray-600 mb-2">{badge.description}</p>

      {/* Progress Bar (for locked badges with progress) */}
      {!isUnlocked && progress !== undefined && progress > 0 && (
        <div className="w-full mt-2">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}

      {/* Rarity Badge */}
      <div className="absolute top-1 right-1">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            badge.rarity === 'legendary'
              ? 'bg-yellow-200 text-yellow-800'
              : badge.rarity === 'epic'
                ? 'bg-purple-200 text-purple-800'
                : badge.rarity === 'rare'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-600'
          }`}
        >
          {badge.rarity === 'legendary' ? '⭐' : badge.rarity === 'epic' ? '💎' : badge.rarity === 'rare' ? '🔹' : ''}
        </span>
      </div>

      {/* Unlocked Checkmark */}
      {isUnlocked && (
        <div className="absolute top-1 left-1">
          <span className="text-lg">✅</span>
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  showProgress?: boolean;
  className?: string;
}

export function BadgeGrid({ showProgress = true, className = '' }: BadgeGridProps) {
  const { unlockedBadges } = useLearningStore((state) => state.motivation);
  const { completedChapters, quizScores } = useLearningStore((state) => state.progress);

  // Calculate perfect quiz scores
  const perfectQuizScores = Object.values(quizScores).filter((score) => score === 100).length;

  // Calculate total time (would need to sum from dailyLog in real impl)
  const totalTimeMinutes = 0; // Placeholder

  const context: MotivationContext = {
    completedChapters: completedChapters.length,
    perfectQuizScores,
    currentStreak: useLearningStore.getState().motivation.currentStreak,
    totalTimeMinutes,
    unlockedBadges,
  };

  const nextBadgeProgress = showProgress ? getNextBadgeProgress(context) : null;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`}>
      {BADGE_DEFINITIONS.map((badge) => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        const progress =
          nextBadgeProgress && nextBadgeProgress.badgeId === badge.id
            ? nextBadgeProgress.progress
            : undefined;

        return <BadgeCard key={badge.id} badge={badge} isUnlocked={isUnlocked} progress={progress} />;
      })}
    </div>
  );
}
