'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';

interface AdminLoginFormData {
  password: string;
}

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminLoginFormData>();

  const onSubmit = async (data: AdminLoginFormData) => {
    setError('');
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: data.password }),
      });

      const result = await response.json();

      if (result.success) {
        // サーバーコンポーネントのセッション判定を反映するため、完全なページリロード
        window.location.href = '/admin';
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ネットワークエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-card p-8 shadow-z2">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-h2-mobile font-heading text-light-fg mb-2">
              管理者ログイン
            </h2>
            <p className="text-body-m-mobile text-light-fg-muted">
              COCOSiL診断システム管理画面
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              type="password"
              label="管理者パスワード"
              placeholder="パスワードを入力"
              {...register('password', { required: 'パスワードは必須です' })}
              error={errors.password?.message}
              required
            />
            
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              ログイン
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-light-fg-muted">
              認証情報をお忘れの場合は、<br />
              システム管理者にお問い合わせください
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-light-fg-muted hover:text-light-fg transition-colors"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}