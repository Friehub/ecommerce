import { redirect } from 'next/navigation';

export default function AdminKYCRedirect({ searchParams }: { searchParams: { sellerId?: string } }) {
  const sellerId = searchParams.sellerId;
  if (sellerId) {
    redirect(`/kyc?sellerId=${sellerId}`);
  }
  redirect('/kyc');
}
