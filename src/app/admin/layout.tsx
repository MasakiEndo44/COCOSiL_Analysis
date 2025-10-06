import { Suspense } from 'react';
import { AdminProvider } from '@/ui/components/admin/admin-provider';
import { AdminHeader } from '@/ui/components/admin/admin-header';
import { AdminSidebar } from '@/ui/components/admin/admin-sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminProvider>
        {/* Header */}
        <AdminHeader />
        
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 w-full md:ml-64 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </AdminProvider>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-muted-foreground">管理画面を読み込み中...</p>
        </div>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}