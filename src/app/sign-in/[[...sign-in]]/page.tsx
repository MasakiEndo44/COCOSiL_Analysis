import { SignIn } from '@clerk/nextjs';

/**
 * Sign In Page
 *
 * Phase 1 Authentication Integration:
 * - Clerk-hosted sign-in flow with Japanese localization
 * - Redirects to /diagnosis after successful sign-in
 * - Supports email/password, OAuth providers (if configured)
 *
 * Environment variables:
 * - NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
 * - NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/diagnosis
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            COCOSiL にサインイン
          </h1>
          <p className="text-sm text-muted-foreground">
            診断結果を保存してアクセスできます
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            },
          }}
        />

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            アカウントを作成することで、
            <a href="/privacy" className="underline hover:text-foreground">
              プライバシーポリシー
            </a>
            に同意したものとみなされます
          </p>
        </div>
      </div>
    </div>
  );
}
