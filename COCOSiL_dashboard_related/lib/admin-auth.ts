import bcrypt from 'bcryptjs';
import { adminDb } from './admin-db';
import type { AdminUser } from '@/types/admin';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

export class AdminAuthService {
  static async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { username, password } = credentials;

      // ユーザー検索
      const user = await adminDb.adminUser.findUnique({
        where: { username },
      });

      // タイミング攻撃を防ぐため、ユーザーが存在しない場合でもbcrypt.compareを実行
      const hashToCompare = user?.password || '$2b$12$dummyHashToPreventTimingAttackDummyValue.DummyHashToPreventEnumeration';
      const isValidPassword = await bcrypt.compare(password, hashToCompare);

      // ユーザーが存在しない場合、または、パスワードが間違っている場合
      if (!user || !isValidPassword) {
        return { success: false, error: '認証に失敗しました' };
      }

      // ログイン時刻更新
      await adminDb.adminUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role as 'admin' | 'viewer',
          lastLogin: user.lastLogin || undefined,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error('認証エラー:', error);
      return { success: false, error: '認証処理でエラーが発生しました' };
    }
  }

  static async createAdminUser(
    username: string, 
    password: string, 
    role: 'admin' | 'viewer' = 'viewer'
  ): Promise<AuthResult> {
    try {
      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await adminDb.adminUser.create({
        data: {
          username,
          password: hashedPassword,
          role,
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role as 'admin' | 'viewer',
          lastLogin: user.lastLogin || undefined,
          createdAt: user.createdAt,
        },
      };
    } catch (error: any) {
      console.error('ユーザー作成エラー:', error);
      
      if (error.code === 'P2002') {
        return { success: false, error: 'このユーザー名は既に使用されています' };
      }
      
      return { success: false, error: 'ユーザー作成でエラーが発生しました' };
    }
  }

  static async updateUserRole(userId: string, role: 'admin' | 'viewer'): Promise<AuthResult> {
    try {
      const user = await adminDb.adminUser.update({
        where: { id: userId },
        data: { role },
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role as 'admin' | 'viewer',
          lastLogin: user.lastLogin || undefined,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      return { success: false, error: 'ユーザー更新でエラーが発生しました' };
    }
  }

  static async listUsers(): Promise<AdminUser[]> {
    try {
      const users = await adminDb.adminUser.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role as 'admin' | 'viewer',
        lastLogin: user.lastLogin || undefined,
        createdAt: user.createdAt,
      }));
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error);
      return [];
    }
  }

  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await adminDb.adminUser.delete({
        where: { id: userId },
      });

      return { success: true };
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      return { success: false, error: 'ユーザー削除でエラーが発生しました' };
    }
  }
}