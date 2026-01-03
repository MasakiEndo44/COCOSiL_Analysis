import { cookies } from 'next/headers';
import { verifySession } from './jwt-session';
import { AdminSession } from './admin-middleware';

export async function getServerAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session');
    
    if (!sessionCookie) return null;

    // JWT署名を検証してセッションを取得
    const session = await verifySession(sessionCookie.value);
    return session;
  } catch (error) {
    console.error('サーバーサイドセッション検証エラー:', error);
    return null;
  }
}