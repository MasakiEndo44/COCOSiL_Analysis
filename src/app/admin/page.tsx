import AdminDashboard from '@/components/admin/admin-dashboard';
import { AdminLogin } from '@/ui/features/admin/admin-login';
import { getServerAdminSession } from '@/lib/admin-session-server';

export default async function AdminPage() {
  // 署名付きJWTを検証してセッションを取得
  const session = await getServerAdminSession();

  return (
      session ? (
        <div className="min-h-screen bg-gray-50">
          <AdminDashboard session={session} />
        </div>
      ) : (
        <AdminLogin />
      )
  );
}