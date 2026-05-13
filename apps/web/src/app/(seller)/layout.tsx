import { SellerSidebar } from '../../components/seller/SellerSidebar';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';

export default async function SellerLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const session = await auth();

 if (!session) {
 redirect('/seller/login');
 }

 // @ts-expect-error - role exists in session
 const role = session.user?.role;
 if (role !== 'SELLER' && role !== 'ADMIN') {
 redirect('/');
 }

 return (
 <div className="flex min-h-screen bg-background antialiased">
 <SellerSidebar />
 <main className="flex-1 p-8 overflow-y-auto">
 {children}
 </main>
 </div>
 );
}
