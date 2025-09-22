import { TaihekiChapterContent } from '@/ui/features/learn/taiheki-chapter-content';

interface TaihekiChapterPageProps {
  params: {
    chapter: string;
  };
}

export default function TaihekiChapterPage({ params }: TaihekiChapterPageProps) {
  return <TaihekiChapterContent chapter={params.chapter} />;
}