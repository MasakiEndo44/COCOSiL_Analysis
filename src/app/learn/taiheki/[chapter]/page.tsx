import { PageTag } from '@/lib/dev-tag';
import { TaihekiChapterContent } from '@/ui/features/learn/taiheki-chapter-content';

interface TaihekiChapterPageProps {
  params: {
    chapter: string;
  };
}

export default function TaihekiChapterPage({ params }: TaihekiChapterPageProps) {
  return (
    <PageTag route={`/learn/taiheki/${params.chapter}`} description={`体癖理論学習 - 第${params.chapter}章`}>
      <TaihekiChapterContent chapter={params.chapter} />
    </PageTag>
  );
}