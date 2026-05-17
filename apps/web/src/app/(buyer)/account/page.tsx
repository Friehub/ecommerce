// apps/web/src/app/(buyer)/account/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, Package, Heart, MapPin, CreditCard, Bell, 
  ChevronRight, LogOut, Ticket, MessageSquare, ShieldCheck, Mail,
  Edit2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';

const sidebarLinks = [
  { label: 'Account', icon: User, href: '/account', active: true },
  { label: 'Orders', icon: Package, href: '/account/orders' },
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
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-j-border border-t-jumia-orange rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase text-j-text-muted">Loading account...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="bg-j-background min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden sticky top-24">
            <nav className="flex flex-col">
              {sidebarLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all border-l-4 ${
                    pathname === link.href 
                    ? 'bg-j-surface-container-low border-jumia-orange text-jumia-orange' 
                    : 'border-transparent text-j-text hover:bg-j-surface-container-low'
                  }`}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="border-t border-j-border mt-2 pt-2">
                <button 
                  className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-wider text-j-error hover:bg-red-50 transition-colors border-l-4 border-transparent"
                  onClick={() => router.push('/api/auth/signout')}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-j-border bg-j-surface-container-low">
              <h1 className="text-xl font-black text-j-text uppercase tracking-tight">Account <span className="text-jumia-orange">Overview</span></h1>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Details */}
              <div className="border border-j-border rounded-sm p-6 flex flex-col gap-4 hover:border-jumia-orange/30 transition-colors group">
                <div className="flex items-center justify-between border-b border-j-border pb-3">
                  <h3 className="text-xs font-black text-j-text uppercase tracking-wider">Account Details</h3>
                  <Link href="/account/settings" className="text-jumia-orange"><Edit2 size={16} /></Link>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-black text-j-text uppercase">{session.user?.name || "Verified Customer"}</p>
                  <p className="text-xs font-bold text-j-text-muted">{session.user?.email}</p>
                </div>
              </div>

              {/* Address Book */}
              <div className="border border-j-border rounded-sm p-6 flex flex-col gap-4 hover:border-jumia-orange/30 transition-colors">
                <div className="flex items-center justify-between border-b border-j-border pb-3">
                  <h3 className="text-xs font-black text-j-text uppercase tracking-wider">Address Book</h3>
                  <Link href="/account/addresses" className="text-jumia-orange"><ChevronRight size={18} /></Link>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-j-text">Your default shipping address:</p>
                  <p className="text-[10px] font-bold text-j-text-muted mt-2 italic">No default address set.</p>
                </div>
              </div>

              {/* Jumia Wallet */}
              <div className="border border-j-border rounded-sm p-6 flex flex-col gap-4 hover:border-jumia-orange/30 transition-colors">
                <h3 className="text-xs font-black text-j-text uppercase tracking-wider border-b border-j-border pb-3">Store Credit</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-jumia-orange/10 rounded flex items-center justify-center text-jumia-orange">
                    <CreditCard size={20} />
                  </div>
                  <p className="text-lg font-black text-j-text">₦ 0.00</p>
                </div>
              </div>

              {/* Newsletter */}
              <div className="border border-j-border rounded-sm p-6 flex flex-col gap-4 hover:border-jumia-orange/30 transition-colors">
                <h3 className="text-xs font-black text-j-text uppercase tracking-wider border-b border-j-border pb-3">Newsletter</h3>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-j-text-muted uppercase leading-relaxed">
                    You are currently not subscribed to any newsletters.
                  </p>
                  <Link href="/account/newsletter" className="text-jumia-orange text-[10px] font-black uppercase hover:underline">
                    Edit Preferences
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
