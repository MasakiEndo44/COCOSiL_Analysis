'use client';

import { Lock, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { CHAPTER_UNLOCK_CONFIG, getDifficultyColor } from '@/lib/data/taiheki-chapter-metadata';

interface ChapterLockOverlayProps {
  chapterId: string;
  unlockReason: string;
  onNavigateToPrerequisite?: () => void;
}

/**
 * Chapter Lock Overlay Component
 *
 * Displays when a chapter is locked, showing:
 * - Lock icon and status
 * - Unlock requirements
 * - Navigation to prerequisite chapter
 * - Motivational messaging
 */
export function ChapterLockOverlay({
  chapterId,
  unlockReason,
  onNavigateToPrerequisite,
}: ChapterLockOverlayProps) {
  const metadata = CHAPTER_UNLOCK_CONFIG[chapterId];

  if (!metadata) {
    return null;
  }

  const difficultyColorClass = getDifficultyColor(metadata.difficulty);

  return (
    <div className="relative min-h-[400px] flex items-center justify-center p-8">
      {/* Blurred background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-90 backdrop-blur-sm rounded-lg" />

      {/* Lock content */}
      <div className="relative z-10 max-w-md text-center space-y-6">
        {/* Lock icon */}
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-gray-600" />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {metadata.chapterId === 'types' && '10種の特徴'}
            {metadata.chapterId === 'application' && '実生活への活用'}
            {metadata.chapterId === 'practice' && '観察とワーク'}
            {metadata.chapterId === 'integration' && '統合と深化'}
            {!['types', 'application', 'practice', 'integration'].includes(metadata.chapterId) && 'この章'}
            はまだロックされています
          </h3>
          <p className="text-sm text-gray-600">
            Chapter {metadata.order} • {metadata.estimatedMinutes}分 •{' '}
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${difficultyColorClass}`}>
              {metadata.difficulty === 'beginner' && '初級'}
              {metadata.difficulty === 'intermediate' && '中級'}
              {metadata.difficulty === 'advanced' && '上級'}
            </span>
          </p>
        </div>

        {/* Unlock requirements */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            解除条件
          </h4>
          <p className="text-sm text-gray-700">{unlockReason}</p>

          {/* Prerequisite details */}
          {metadata.prerequisites.length > 0 && (
            <div className="mt-4 space-y-2">
              {metadata.prerequisites.map((prereq, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                  {prereq.type === 'chapter_complete' && (
                    <>
                      <CheckCircle className="w-3 h-3 mt-0.5 text-gray-400" />
                      <span>前の章を完了する</span>
                    </>
                  )}
                  {prereq.type === 'quiz_pass' && (
                    <>
                      <Trophy className="w-3 h-3 mt-0.5 text-yellow-600" />
                      <span>クイズに合格する（{prereq.minScore}点以上）</span>
                    </>
                  )}
                  {prereq.type === 'time_spent' && (
                    <>
                      <Clock className="w-3 h-3 mt-0.5 text-blue-600" />
                      <span>{Math.ceil((prereq.minTimeSeconds || 0) / 60)}分以上学習する</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action button */}
        {onNavigateToPrerequisite && (
          <Button
            variant="primary"
            onClick={onNavigateToPrerequisite}
            className="w-full"
          >
            前の章に戻る
          </Button>
        )}

        {/* Motivational message */}
        <p className="text-xs text-gray-500">
          💡 一歩ずつ進めることで、より深く理解できます
        </p>
      </div>
    </div>
  );
}
