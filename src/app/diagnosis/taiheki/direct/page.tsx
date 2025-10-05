'use client';

import { useRouter } from 'next/navigation';
import { TaihekiDirectInput } from '@/ui/features/diagnosis/taiheki-direct-input';

export default function TaihekiDirectInputPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/diagnosis/taiheki');
  };

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TaihekiDirectInput onBack={handleBack} />
      </div>
    </div>
  );
}
