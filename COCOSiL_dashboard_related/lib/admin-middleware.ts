import { NextRequest } from 'next/server';
import { verifySession } from './jwt-session';

export interface AdminSession {
  userId: string;
  username: string;
  role: 'admin' | 'viewer';
  loginTime: string;
}

export async function getAdminSession(request: NextRequest): Promise<AdminSession | null> {
  try {
    const sessionCookie = request.cookies.get('admin-session');
    if (!sessionCookie) return null;

    // JWT署名を検証してセッションを取得
    const session = await verifySession(sessionCookie.value);
    return session;
  } catch (error) {
    console.error('セッション検証エラー:', error);
    return null;
  }
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminSession> {
  const session = await getAdminSession(request);
  if (!session) {
    throw new Error('認証が必要です');
  }
  return session;
}

export async function requireAdminRole(request: NextRequest): Promise<AdminSession> {
  const session = await requireAdminAuth(request);
  if (session.role !== 'admin') {
    throw new Error('管理者権限が必要です');
  }
  return session;
}