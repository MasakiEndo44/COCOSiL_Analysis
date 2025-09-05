import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/admin-auth';
import { signSession, getSessionCookieOptions } from '@/lib/jwt-session';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    }

    const result = await AdminAuthService.authenticateUser({ username, password });

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    if (!result.user) {
      return NextResponse.json(
        { success: false, error: '認証データが不正です' },
        { status: 500 }
      );
    }

    // 署名付きJWTトークンを生成
    const sessionToken = await signSession({
      userId: result.user.id,
      username: result.user.username,
      role: result.user.role,
    });

    // 認証成功時は署名付きクッキーを設定
    const response = NextResponse.json(result);
    
    response.cookies.set(
      'admin-session', 
      sessionToken, 
      getSessionCookieOptions()
    );

    return response;

  } catch (error) {
    console.error('ログインAPIエラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}