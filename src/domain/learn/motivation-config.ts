/**
 * Motivation System Configuration
 *
 * Defines badge metadata, streak thresholds, nudge messages, and celebration types
 * for the learning motivation layer.
 */

export type BadgeType =
  | 'first-chapter'
  | 'perfect-score'
  | 'streak-3'
  | 'streak-7'
  | 'streak-30'
  | 'all-chapters'
  | 'quiz-master'
  | 'speed-learner';

export type BadgeTrigger =
  | 'chapter-complete'
  | 'quiz-score'
  | 'streak-milestone'
  | 'course-complete'
  | 'time-milestone';

export interface BadgeMetadata {
  id: BadgeType;
  trigger: BadgeTrigger;
  threshold: number;
  title: string;
  description: string;
  icon: string;
  colorClass: string; // Tailwind color classes
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_DEFINITIONS: BadgeMetadata[] = [
  {
    id: 'first-chapter',
    trigger: 'chapter-complete',
    threshold: 1,
    title: '最初の一歩',
    description: '初めての章を完了しました',
    icon: '🎯',
    colorClass: 'bg-brand-100 text-brand-700',
    rarity: 'common',
  },
  {
    id: 'perfect-score',
    trigger: 'quiz-score',
    threshold: 100,
    title: 'パーフェクト',
    description: 'クイズで満点を獲得しました',
    icon: '⭐',
    colorClass: 'bg-yellow-100 text-yellow-700',
    rarity: 'rare',
  },
  {
    id: 'streak-3',
    trigger: 'streak-milestone',
    threshold: 3,
    title: '3日連続',
    description: '3日連続で学習を継続中',
    icon: '🔥',
    colorClass: 'bg-orange-100 text-orange-700',
    rarity: 'common',
  },
  {
    id: 'streak-7',
    trigger: 'streak-milestone',
    threshold: 7,
    title: '1週間継続',
    description: '7日連続で学習を継続中',
    icon: '🔥🔥',
    colorClass: 'bg-red-100 text-red-700',
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    trigger: 'streak-milestone',
    threshold: 30,
    title: '1ヶ月マスター',
    description: '30日連続で学習を継続中',
    icon: '🔥🔥🔥',
    colorClass: 'bg-purple-100 text-purple-700',
    rarity: 'legendary',
  },
  {
    id: 'all-chapters',
    trigger: 'course-complete',
    threshold: 5,
    title: 'コース完了',
    description: '全5章を完了しました',
    icon: '🏆',
    colorClass: 'bg-green-100 text-green-700',
    rarity: 'epic',
  },
  {
    id: 'quiz-master',
    trigger: 'quiz-score',
    threshold: 5, // 5 perfect scores
    title: 'クイズマスター',
    description: '5回満点を獲得しました',
    icon: '👑',
    colorClass: 'bg-indigo-100 text-indigo-700',
    rarity: 'epic',
  },
  {
    id: 'speed-learner',
    trigger: 'time-milestone',
    threshold: 180, // 3 hours total
    title: 'スピードラーナー',
    description: '3時間以上学習しました',
    icon: '⚡',
    colorClass: 'bg-blue-100 text-blue-700',
    rarity: 'rare',
  },
];

export type NudgeType =
  | 'welcome-back'
  | 'streak-reminder'
  | 'chapter-progress'
  | 'quiz-encouragement'
  | 'completion-nearby';

export interface NudgeMessage {
  id: NudgeType;
  title: string;
  message: string;
  actionText?: string;
  triggerCondition: string; // Human-readable description
}

export const NUDGE_MESSAGES: NudgeMessage[] = [
  {
    id: 'welcome-back',
    title: 'おかえりなさい！',
    message: '前回の続きから学習を再開しましょう',
    actionText: '続きを読む',
    triggerCondition: 'User returns after 24h+ absence',
  },
  {
    id: 'streak-reminder',
    title: 'ストリーク継続中！',
    message: '今日も学習を続けて、連続記録を伸ばしましょう',
    actionText: '学習を開始',
    triggerCondition: 'User has active streak, visited today but no activity yet',
  },
  {
    id: 'chapter-progress',
    title: 'もう少しで完了！',
    message: 'あと少しで章を完了できます',
    actionText: 'クイズに挑戦',
    triggerCondition: 'User completed all sections but not quiz',
  },
  {
    id: 'quiz-encouragement',
    title: '再挑戦してみませんか？',
    message: '前回のクイズで惜しかったですね。もう一度挑戦してみましょう',
    actionText: 'クイズをやり直す',
    triggerCondition: 'User scored below 70% on quiz',
  },
  {
    id: 'completion-nearby',
    title: 'ゴールまであと少し！',
    message: 'あと1章でコース完了です',
    actionText: '最後の章へ',
    triggerCondition: 'User completed 4 out of 5 chapters',
  },
];

export type CelebrationType =
  | 'chapter-complete'
  | 'perfect-quiz'
  | 'streak-milestone'
  | 'course-complete'
  | 'badge-unlock';

export interface CelebrationConfig {
  type: CelebrationType;
  duration: number; // milliseconds
  useConfetti: boolean;
  soundEffect?: string;
  animation: 'bounce' | 'fade' | 'slide' | 'confetti';
}

export const CELEBRATION_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  'chapter-complete': {
    type: 'chapter-complete',
    duration: 2000,
    useConfetti: false,
    animation: 'bounce',
  },
  'perfect-quiz': {
    type: 'perfect-quiz',
    duration: 3000,
    useConfetti: true,
    animation: 'confetti',
  },
  'streak-milestone': {
    type: 'streak-milestone',
    duration: 2500,
    useConfetti: true,
    animation: 'confetti',
  },
  'course-complete': {
    type: 'course-complete',
    duration: 4000,
    useConfetti: true,
    animation: 'confetti',
  },
  'badge-unlock': {
    type: 'badge-unlock',
    duration: 2000,
    useConfetti: false,
    animation: 'slide',
  },
};

export interface StreakThresholds {
  warning: number; // hours before streak expires to show warning
  grace: number; // grace period in hours after 24h
}

export const STREAK_CONFIG: StreakThresholds = {
  warning: 4, // Show warning 4 hours before midnight
  grace: 2, // 2-hour grace period (total 26 hours)
};
