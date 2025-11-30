import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/jwt-session';

// ============================================================
// Route Matchers
// ============================================================

// Public routes - no authentication required
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/learn/taiheki(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/fortune-calc-v2(.*)',
  '/api/public(.*)',
]);

// Admin routes - use existing JWT authentication (独立したレルム)
const isAdminRoute = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
};

// Diagnosis routes - Clerk auth recommended but not required (匿名診断継続)
const isDiagnosisRoute = createRouteMatcher([
  '/diagnosis(.*)',
  '/api/diagnosis(.*)',
  '/api/ai/chat(.*)',
  '/api/ai/intelligent-summary(.*)',
]);

// ============================================================
// Admin JWT Authentication Helper
// ============================================================

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // API routes - delegate to individual route handlers
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Admin page - verify JWT session
  if (pathname === '/admin') {
    const sessionCookie = request.cookies.get('admin-session');

    if (sessionCookie) {
      try {
        const session = await verifySession(sessionCookie.value);
        if (session) {
          // Valid session - proceed
          return NextResponse.next();
        }
      } catch (error) {
        // JWT verification failed - remove invalid cookie
        const response = NextResponse.next();
        response.cookies.delete('admin-session');
        return response;
      }
    }

    // No session - show login form on page
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ============================================================
// Middleware Function
// ============================================================

export default clerkMiddleware(async (auth, request) => {
  // ========================================
  // Admin Authentication Realm (JWT)
  // ========================================
  // 管理者ルートは既存のJWT認証を使用（Clerkとは完全独立）
  if (isAdminRoute(request)) {
    return handleAdminRoute(request);
  }

  // ========================================
  // User Authentication Realm (Clerk)
  // ========================================

  // Public routes - no authentication required
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Diagnosis routes - authentication recommended but not required
  // 匿名診断フローを継続サポート
  if (isDiagnosisRoute(request)) {
    // Check if user is authenticated
    const { userId } = await auth();

    if (userId) {
      // Authenticated user - proceed normally
      return NextResponse.next();
    }

    // Anonymous user - allow access (localStorage-based diagnosis)
    // クライアント側で認証選択画面を表示
    return NextResponse.next();
  }

  // All other protected routes - require authentication
  await auth.protect();
  return NextResponse.next();
});

// ============================================================
// Matcher Configuration
// ============================================================
// Match all routes except static files, Next.js internals, and images
export const config = {
  matcher: [
    // Include all routes
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API and TRPC routes
    '/(api|trpc)(.*)',
  ],
};
