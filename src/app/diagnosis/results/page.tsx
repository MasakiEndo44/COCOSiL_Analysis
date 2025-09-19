import { PageTag } from '@/lib/dev-tag';
import DiagnosisResults from '@/ui/features/diagnosis/results';

export default function ResultsPage() {
  return (
    <PageTag route="/diagnosis/results" description="診断結果 - 統合分析結果表示">
      <DiagnosisResults />
    </PageTag>
  );
}