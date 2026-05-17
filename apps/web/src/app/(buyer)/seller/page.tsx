import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SellerLandingRedirect() {
  const session = await auth();

  if (session) {
    const role = session.user?.role;
    if (role === 'SELLER' || role === 'ADMIN') {
      redirect('/seller/dashboard');
    }
  }

  redirect('/seller/register');
}
