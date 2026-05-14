import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  if (role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-j-background antialiased">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
