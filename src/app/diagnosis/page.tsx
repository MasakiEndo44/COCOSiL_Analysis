import { PageTag } from '@/lib/dev-tag';
import { BasicInfoStep } from '@/ui/features/diagnosis/basic-info-step';

export default function DiagnosisStartPage() {
  return (
    <PageTag route="/diagnosis" description="診断開始 - 基本情報入力フォーム">
      <BasicInfoStep />
    </PageTag>
  );
}