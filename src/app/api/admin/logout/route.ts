import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'ログアウトしました' });
    
    // セッションクッキーを削除
    response.cookies.delete('admin-session');
    
    return response;

  } catch (error) {
    console.error('ログアウトAPIエラー:', error);
    return NextResponse.json(
      { success: false, error: 'ログアウト処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}