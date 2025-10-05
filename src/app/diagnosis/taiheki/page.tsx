'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TaihekiDiagnosisPage() {
  const router = useRouter();

  useEffect(() => {
    // 改善版の体癖診断HTMLにリダイレクト
    window.location.href = '/taiheki_diagnosis.html';
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>体癖診断へ移動中...</h1>
        <p style={{ fontSize: '1rem', opacity: 0.9 }}>
          より詳細な診断ページにリダイレクトしています。
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '2rem', opacity: 0.7 }}>
          自動的に移動しない場合は<a href="/taiheki_diagnosis.html" style={{ color: 'white', textDecoration: 'underline' }}>こちら</a>をクリックしてください。
        </p>
      </div>
    </div>
  );
}