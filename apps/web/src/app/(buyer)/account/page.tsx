// apps/web/src/app/(buyer)/account/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, Package, Heart, MapPin, CreditCard, Bell, 
  ChevronRight, LogOut, Ticket, MessageSquare, ShieldCheck, Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';

const sidebarLinks = [
  { label: 'Account', icon: User, href: '/account', active: true },
  { label: 'Orders', icon: Package, href: '/account/orders' },
  { label: 'Inbox', icon: Mail, href: '/account/inbox' },
  { label: 'Pending Reviews', icon: MessageSquare, href: '/account/reviews' },
  { label: 'Vouchers', icon: Ticket, href: '/account/vouchers' },
  { label: 'Saved Items', icon: Heart, href: '/wishlist' },
  { label: 'Personal Information', icon: User, href: '/account/settings' },
  { label: 'Address Book', icon: MapPin, href: '/account/addresses' },
  { label: 'Newsletter Preferences', icon: Bell, href: '/account/newsletter' },
];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="max-w-container-max mx-auto px-margin-desktop py-8">
        <div className="flex gap-gutter">
          <Skeleton className="w-[240px] h-[500px]" />
          <div className="flex-1 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="bg-j-background min-h-screen pb-12">
      <div className="max-w-container-max mx-auto px-margin-desktop py-4 flex flex-col md:flex-row gap-gutter">
        {/* Sidebar */}
        <aside className="w-full md:w-[240px] flex flex-col gap-2">
          <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
            <nav className="flex flex-col">
              {sidebarLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 p-3 text-body-sm font-medium transition-all border-l-4 ${
                    pathname === link.href 
                    ? 'bg-j-surface-container-low border-jumia-orange text-jumia-orange' 
                    : 'border-transparent text-j-text hover:bg-j-surface-container-lowest'
                  }`}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              <button 
                className="flex items-center gap-3 p-3 text-body-sm font-medium text-j-text hover:bg-j-surface-container-lowest border-l-4 border-transparent mt-4 border-t border-j-outline-variant"
                onClick={() => router.push('/api/auth/signout')}
              >
                <LogOut size={18} className="text-jumia-orange" />
                <span className="text-jumia-orange uppercase">Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-gutter">
          <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
            <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
              <h1 className="text-label-bold font-bold uppercase">Account Overview</h1>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="border border-j-outline-variant rounded p-4 flex flex-col gap-4">
                <h3 className="text-label-bold font-bold uppercase border-b border-j-outline-variant pb-2">Account Details</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-body-md font-bold uppercase">{session.user?.name || "Verified Member"}</p>
                  <p className="text-body-sm text-j-text-muted">{session.user?.email}</p>
                </div>
              </div>

              {/* Address Book */}
              <div className="border border-j-outline-variant rounded p-4 flex flex-col gap-4">
                <h3 className="text-label-bold font-bold uppercase border-b border-j-outline-variant pb-2 flex justify-between items-center">
                  Address Book
                  <Link href="/account/addresses" className="text-jumia-orange"><ChevronRight size={16} /></Link>
                </h3>
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm text-j-text font-medium">Your default shipping address:</p>
                  <p className="text-body-sm text-j-text-muted mt-1 italic">No default address set.</p>
                </div>
              </div>

              {/* Jumia Wallet */}
              <div className="border border-j-outline-variant rounded p-4 flex flex-col gap-4">
                <h3 className="text-label-bold font-bold uppercase border-b border-j-outline-variant pb-2">Jumia Store Credit</h3>
                <div className="flex items-center gap-3">
                  <CreditCard className="text-jumia-orange" size={24} />
                  <p className="text-body-md font-bold text-j-text">₦ 0.00</p>
                </div>
              </div>

              {/* Newsletter */}
              <div className="border border-j-outline-variant rounded p-4 flex flex-col gap-4">
                <h3 className="text-label-bold font-bold uppercase border-b border-j-outline-variant pb-2">Newsletter Preferences</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm text-j-text">You are currently not subscribed to any newsletters.</p>
                  <Link href="/account/newsletter" className="text-jumia-orange text-body-sm font-bold uppercase mt-2">Edit Preferences</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
