import { Suspense } from 'react';
import { TaihekiLearningOverview } from '@/ui/features/learn/taiheki-learning-overview';

export default function TaihekiLearningPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
      <TaihekiLearningOverview />
    </Suspense>
  );
}