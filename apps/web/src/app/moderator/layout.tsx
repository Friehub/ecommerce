import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  if (role !== 'MODERATOR' && role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}
