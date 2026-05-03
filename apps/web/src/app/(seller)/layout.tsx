import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  if (role !== 'SELLER' && role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <SellerSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

