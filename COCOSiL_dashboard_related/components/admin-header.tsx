'use client';

import { useAdminContext } from './admin-provider';
import { Button } from '@/ui/components/ui/button';

export function AdminHeader() {
  const { isAuthenticated, logout } = useAdminContext();

  if (!isAuthenticated) return null;

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-heading text-light-fg">COCOSiL 管理画面</h1>
              <p className="text-xs text-light-fg-muted">診断データ管理システム</p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-light-fg">管理者</p>
              <p className="text-xs text-light-fg-muted">システム管理者</p>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}