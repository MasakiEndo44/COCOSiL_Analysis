import { SignJWT, jwtVerify } from 'jose';
import { AdminSession } from './admin-middleware';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only-never-use-in-production'
);

export interface SessionPayload {
  userId: string;
  username: string;
  role: 'admin' | 'viewer';
  iat?: number;
  exp?: number;
}

export async function signSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .setSubject(payload.userId)
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('JWT署名エラー:', error);
    throw new Error('セッショントークンの生成に失敗しました');
  }
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // ペイロードの検証
    if (!payload.userId || !payload.username || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as 'admin' | 'viewer',
      loginTime: new Date((payload.iat as number) * 1000).toISOString(),
    };
  } catch (error) {
    // JWTの検証に失敗した場合（期限切れ、署名不正など）
    if (error instanceof Error) {
      console.warn('JWT検証失敗:', error.message);
    }
    return null;
  }
}

export function getSessionCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 8, // 8時間
    path: '/',
  };
}