import { PageTag } from '@/lib/dev-tag';
import { TaihekiLearningOverview } from '@/ui/features/learn/taiheki-learning-overview';

export default function TaihekiLearningPage() {
  return (
    <PageTag route="/learn/taiheki" description="体癖理論学習 - 野口整体理論の学習サイト">
      <TaihekiLearningOverview />
    </PageTag>
  );
}