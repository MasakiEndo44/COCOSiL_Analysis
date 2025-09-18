import { PrivacyPolicyContent } from '@/ui/features/privacy/privacy-policy-content';

export const metadata = {
  title: 'プライバシーポリシー | COCOSiL',
  description: 'COCOSiLにおける個人情報の取り扱いについて詳しくご説明します。',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <PrivacyPolicyContent />
      </div>
    </div>
  );
}