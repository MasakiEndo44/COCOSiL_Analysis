'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/lib/zustand/learning-store';
import { BADGE_DEFINITIONS } from '@/domain/learn/motivation-config';
import { getCelebrationConfig } from '@/lib/motivation/motivation-service';

export function CelebrationToast() {
  const { celebrationQueue } = useLearningStore((state) => state.motivation);
  const dismissCelebration = useLearningStore((state) => state.dismissCelebration);

  const currentCelebration = celebrationQueue[0];

  useEffect(() => {
    if (currentCelebration) {
      const config = getCelebrationConfig(currentCelebration.type);
      const timer = setTimeout(() => {
        dismissCelebration();
      }, config.duration);

      return () => clearTimeout(timer);
    }
  }, [currentCelebration, dismissCelebration]);

  if (!currentCelebration) return null;

  const badge = currentCelebration.badgeId
    ? BADGE_DEFINITIONS.find((b) => b.id === currentCelebration.badgeId)
    : null;

  const getMessage = () => {
    switch (currentCelebration.type) {
      case 'chapter-complete':
        return '章を完了しました！';
      case 'perfect-quiz':
        return 'クイズで満点を獲得しました！';
      case 'streak-milestone':
        return `${currentCelebration.metadata?.streak || ''}日連続学習達成！`;
      case 'course-complete':
        return 'コースを完了しました！おめでとうございます！';
      case 'badge-unlock':
        return badge ? `バッジ「${badge.title}」を獲得しました！` : 'バッジを獲得しました！';
      default:
        return '達成おめでとうございます！';
    }
  };

  const getIcon = () => {
    if (badge) return badge.icon;

    switch (currentCelebration.type) {
      case 'chapter-complete':
        return '✅';
      case 'perfect-quiz':
        return '⭐';
      case 'streak-milestone':
        return '🔥';
      case 'course-complete':
        return '🏆';
      default:
        return '🎉';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-brand-500 p-4 flex items-center gap-4 max-w-sm motion-safe:animate-bounce-once">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-bold text-brand-700 mb-1">{getMessage()}</h3>
          {badge && <p className="text-sm text-gray-600">{badge.description}</p>}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={dismissCelebration}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss celebration"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
