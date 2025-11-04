import { SignUp } from '@clerk/nextjs';

/**
 * Sign Up Page
 *
 * Phase 1 Authentication Integration:
 * - Clerk-hosted sign-up flow with Japanese localization
 * - Redirects to /diagnosis after successful sign-up
 * - Supports email/password, OAuth providers (if configured)
 * - User data automatically synced to database via webhook (Phase 2)
 *
 * Environment variables:
 * - NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
 * - NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/diagnosis
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            COCOSiL アカウント作成
          </h1>
          <p className="text-sm text-muted-foreground">
            診断結果を保存して、いつでもアクセス
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            },
          }}
        />

        {/* Benefits List */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            アカウント作成のメリット：
          </h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>✅ 診断結果を永久保存</li>
            <li>✅ 診断履歴の閲覧</li>
            <li>✅ パーソナライズされた分析</li>
            <li>✅ デバイス間でのデータ同期</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            アカウントを作成することで、
            <a href="/privacy" className="underline hover:text-foreground">
              プライバシーポリシー
            </a>
            と
            <a href="/terms" className="underline hover:text-foreground">
              利用規約
            </a>
            に同意したものとみなされます
          </p>
        </div>
      </div>
    </div>
  );
}
