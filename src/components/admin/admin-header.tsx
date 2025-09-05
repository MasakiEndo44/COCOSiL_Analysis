'use client';

import { AdminSession } from '@/lib/admin-middleware';
import { LogOut, Users, BarChart3, Download, Home } from 'lucide-react';

interface AdminHeaderProps {
  session: AdminSession;
  currentView: 'overview' | 'records' | 'stats' | 'export';
  onViewChange: (view: 'overview' | 'records' | 'stats' | 'export') => void;
  onLogout: () => void;
}

export default function AdminHeader({ session, currentView, onViewChange, onLogout }: AdminHeaderProps) {
  const navItems = [
    { key: 'overview' as const, label: '概要', icon: Home },
    { key: 'records' as const, label: '診断記録', icon: Users },
    { key: 'stats' as const, label: '統計', icon: BarChart3 },
    { key: 'export' as const, label: '出力', icon: Download },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-xl font-bold text-brand-600">COCOSiL 管理システム</h1>
            </div>
            
            <nav className="flex space-x-4">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => onViewChange(key)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentView === key
                      ? 'bg-brand-100 text-brand-700 border border-brand-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${session.role === 'admin' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}>
                {session.role === 'admin' ? '管理者' : '閲覧者'}
              </span>
              <span className="ml-2">{session.username}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <LogOut size={16} />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}