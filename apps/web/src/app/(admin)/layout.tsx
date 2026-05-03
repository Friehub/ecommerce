import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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

  return <>{children}</>;
}
