import { PageTag } from '@/lib/dev-tag';
import { MbtiStep } from '@/ui/features/diagnosis/mbti-step';

export default function MbtiDiagnosisPage() {
  return (
    <PageTag route="/diagnosis/mbti" description="MBTI診断 - 性格タイプ判定">
      <MbtiStep />
    </PageTag>
  );
}