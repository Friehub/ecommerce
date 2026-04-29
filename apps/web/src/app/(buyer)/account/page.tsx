'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { User, Package, Heart, MapPin, Settings, ChevronRight, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { label: 'Orders', icon: <Package size={24} />, href: '/account/orders', desc: 'Check your order status and history' },
    { label: 'Saved Items', icon: <Heart size={24} />, href: '/account/saved', desc: 'View items you saved for later' },
    { label: 'Addresses', icon: <MapPin size={24} />, href: '/account/addresses', desc: 'Manage your delivery addresses' },
    { label: 'Payment Methods', icon: <CreditCard size={24} />, href: '/account/payment', desc: 'Manage your saved cards' },
    { label: 'Account Settings', icon: <Settings size={24} />, href: '/account/settings', desc: 'Update your profile and password' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#F68B1E]/10 text-[#F68B1E] rounded-full flex items-center justify-center text-2xl font-bold">
                  {session.user?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{session.user?.email?.split('@')[0]}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              <div className="border-t pt-6 space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Member Since</span>
                   <span className="font-medium">April 2024</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Account Type</span>
                   <span className="font-medium capitalize">{session.user?.role || 'Buyer'}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#F68B1E] transition-all flex items-start gap-4 group"
                >
                  <div className="text-[#F68B1E] bg-[#F68B1E]/5 p-3 rounded-lg group-hover:bg-[#F68B1E] group-hover:text-white transition-colors flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center justify-between">
                      {item.label}
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#F68B1E]" />
                    </h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-1 { gap: 4px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .gap-8 { gap: 32px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .lg\:col-span-1 { grid-column: span 1 / span 1; }
          .lg\:col-span-2 { grid-column: span 2 / span 2; }
        }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-\[\#F68B1E\]\/10 { background-color: rgba(246, 139, 30, 0.1); }
        .bg-\[\#F68B1E\]\/5 { background-color: rgba(246, 139, 30, 0.05); }
        .text-\[\#F68B1E\] { color: #f68b1e; }
        .text-white { color: #ffffff; }
        .text-gray-900 { color: #111827; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-300 { color: #d1d5db; }
        .border { border: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #f3f4f6; }
        .rounded-lg { border-radius: 8px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-8 { margin-bottom: 2rem; }
        .text-lg { font-size: 1.125rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .capitalize { text-transform: capitalize; }
        .transition-all { transition: all 0.2s ease; }
        .transition-colors { transition: background-color 0.2s ease, color 0.2s ease; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
