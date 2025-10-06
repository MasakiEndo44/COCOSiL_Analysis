'use client';

import { useLearningStore } from '@/lib/zustand/learning-store';
import { StreakBadge } from './streak-badge';
import { BadgeGrid } from './badge-grid';
import { getNextBadgeProgress, type MotivationContext } from '@/lib/motivation/motivation-service';

export function MotivationPanel() {
  const { unlockedBadges, currentStreak, longestStreak } = useLearningStore(
    (state) => state.motivation
  );
  const { completedChapters, quizScores } = useLearningStore((state) => state.progress);

  const perfectQuizScores = Object.values(quizScores).filter((score) => score === 100).length;

  const context: MotivationContext = {
    completedChapters: completedChapters.length,
    perfectQuizScores,
    currentStreak,
    totalTimeMinutes: 0, // Would calculate from dailyLog
    unlockedBadges,
  };

  const nextBadge = getNextBadgeProgress(context);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">モチベーション</h2>
        <div className="text-sm text-muted-foreground">
          {unlockedBadges.length} / 8 バッジ獲得
        </div>
      </div>

      {/* Streak Display */}
      <StreakBadge variant="full" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground mb-1">現在の連続記録</div>
          <div className="text-3xl font-bold text-orange-600">
            {currentStreak}
            <span className="text-sm ml-1">日</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground mb-1">最長連続記録</div>
          <div className="text-3xl font-bold text-purple-600">
            {longestStreak}
            <span className="text-sm ml-1">日</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground mb-1">完了章数</div>
          <div className="text-3xl font-bold text-green-600">
            {completedChapters.length}
            <span className="text-sm ml-1">/ 5</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground mb-1">満点クイズ</div>
          <div className="text-3xl font-bold text-yellow-600">
            {perfectQuizScores}
            <span className="text-sm ml-1">回</span>
          </div>
        </div>
      </div>

      {/* Next Badge Progress */}
      {nextBadge && (
        <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg p-4 border border-brand-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{nextBadge.metadata.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-brand-700 mb-1">次のバッジ: {nextBadge.metadata.title}</h3>
              <div className="mb-2">
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all"
                    style={{ width: `${nextBadge.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-brand-600">
                あと {nextBadge.remaining}{' '}
                {nextBadge.metadata.trigger === 'streak-milestone' ? '日' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge Grid */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">獲得バッジ</h3>
        <BadgeGrid showProgress={true} />
      </div>
    </div>
  );
}
