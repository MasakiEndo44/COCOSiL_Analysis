'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface AuthChoiceScreenProps {
  onProceed: () => void;
}

/**
 * Authentication Choice Screen
 *
 * Displays 3 authentication options for users starting diagnosis:
 * 1. Create Account - Redirects to Clerk sign-up
 * 2. Sign In - Redirects to Clerk sign-in
 * 3. Continue Anonymously - Proceeds to diagnosis with localStorage
 *
 * Per UI/UX Spec: Vertical 3-button layout, max-width 480px, centered
 */
export function AuthChoiceScreen({ onProceed }: AuthChoiceScreenProps) {
  const { isLoaded, userId } = useAuth();

  // If user is already authenticated, invoke onProceed callback
  useEffect(() => {
    if (isLoaded && userId) {
      onProceed();
    }
  }, [isLoaded, userId, onProceed]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-pulse text-lg text-muted-foreground">
          読み込み中...
        </div>
      </div>
    );
  }

  // Show auth choice screen only for unauthenticated users
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div
        className="w-full max-w-[480px] animate-fade-in space-y-4"
        style={{
          animation: 'fadeIn 400ms ease-out'
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            診断を始める
          </h1>
          <p className="text-sm text-muted-foreground">
            診断方法を選択してください
          </p>
        </div>

        {/* Button 1: Create Account */}
        <Link
          href="/sign-up"
          className="group flex w-full items-center gap-4 rounded-lg bg-accent-500 px-4 py-4 text-white shadow-md transition-all duration-150 hover:bg-accent-600 active:bg-accent-600/90"
          aria-label="アカウントを作成して診断を始める"
        >
          <span className="text-2xl" aria-hidden="true">🔐</span>
          <div className="flex-1 text-left">
            <div className="text-base font-bold">
              アカウントを作成して始める
            </div>
            <div className="text-xs opacity-90">
              → 診断結果を保存・履歴閲覧可能
            </div>
          </div>
        </Link>

        {/* Button 2: Sign In */}
        <Link
          href="/sign-in"
          className="group flex w-full items-center gap-4 rounded-lg bg-foreground px-4 py-4 text-white shadow-md transition-all duration-150 hover:bg-foreground/90"
          aria-label="サインインして診断を始める"
        >
          <span className="text-2xl" aria-hidden="true">✅</span>
          <div className="flex-1 text-left">
            <div className="text-base font-bold">
              サインインして始める
            </div>
            <div className="text-xs opacity-90">
              → 既存アカウントで続ける
            </div>
          </div>
        </Link>

        {/* Button 3: Continue Anonymously */}
        <button
          onClick={onProceed}
          className="group flex w-full items-center gap-4 rounded-lg border-2 border-border bg-surface px-4 py-4 text-foreground shadow-sm transition-all duration-150 hover:bg-surface/80"
          aria-label="匿名で診断を続ける"
        >
          <span className="text-2xl" aria-hidden="true">👤</span>
          <div className="flex-1 text-left">
            <div className="text-base font-bold">
              匿名で続ける
            </div>
            <div className="text-xs text-muted-foreground">
              → 30日間ブラウザに保存
            </div>
          </div>
        </button>

        {/* Privacy Notice */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            匿名診断の場合、診断データはブラウザのローカルストレージに保存され、
            30日後に自動削除されます。
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
