import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/jwt-session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 管理者エリアの保護
  if (pathname.startsWith('/api/admin')) {
    // APIルート保護は各ルートで個別に実装済みなのでここではスキップ
    return NextResponse.next();
  }

  // 管理画面の初期チェック（ページレベルでも再チェックするが、ここで基本的な検証）
  if (pathname === '/admin') {
    const sessionCookie = request.cookies.get('admin-session');
    
    if (sessionCookie) {
      try {
        const session = await verifySession(sessionCookie.value);
        if (session) {
          // 有効なセッションがある場合はそのまま進む
          return NextResponse.next();
        }
      } catch (error) {
        // JWT検証に失敗した場合は無効なクッキーを削除
        const response = NextResponse.next();
        response.cookies.delete('admin-session');
        return response;
      }
    }
    
    // セッションがない場合もページ内でログインフォームを表示するのでそのまま進む
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ]
};