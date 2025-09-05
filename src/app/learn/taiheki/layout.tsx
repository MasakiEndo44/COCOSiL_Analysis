import { TaihekiLearningLayout } from '@/ui/features/learn/taiheki-learning-layout';

export default function TaihekiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TaihekiLearningLayout>{children}</TaihekiLearningLayout>;
}