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
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FA]">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { label: 'Orders', icon: <Package size={24} />, href: '/orders', desc: 'Check your order status and history' },
    { label: 'Notifications', icon: <User size={24} />, href: '/notifications', desc: 'View your messages and alerts' },
    { label: 'Saved Items', icon: <Heart size={24} />, href: '/saved', desc: 'View items you saved for later' },
    { label: 'Addresses', icon: <MapPin size={24} />, href: '/account/addresses', desc: 'Manage your delivery addresses' },
    { label: 'Account Settings', icon: <Settings size={24} />, href: '/account/settings', desc: 'Update your profile and password' },
  ];

  return (
    <div className="bg-[#F9F9FA] min-h-screen py-8">
      <div className="container">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight select-none border-b-2 border-[#F68B1E] pb-1 w-fit">
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Overview */}
          <div className="lg:col-span-1 select-none">
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-50 text-[#F68B1E] border border-orange-100 rounded-full flex items-center justify-center text-2xl font-black">
                  {session.user?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-lg text-gray-900 leading-tight">{session.user?.email?.split('@')[0]}</p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">{session.user?.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5 space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500 font-medium">Member Since</span>
                   <span className="font-bold text-gray-800">April 2024</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500 font-medium">Account Type</span>
                   <span className="font-extrabold text-gray-800 capitalize">{(session.user as any)?.role || 'Buyer'}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="lg:col-span-2 select-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {menuItems.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="bg-white p-6 rounded-xl border border-gray-100 hover:border-[#F68B1E] hover:shadow-lg transition-all duration-200 flex items-start gap-4 group cursor-pointer shadow-sm"
                >
                  <div className="text-[#F68B1E] bg-orange-50 border border-orange-100 p-3.5 rounded-xl group-hover:bg-[#F68B1E] group-hover:text-white transition-colors flex items-center justify-center group-hover:scale-105 duration-200">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-800 mb-1 flex items-center justify-between group-hover:text-[#F68B1E] transition-colors">
                      {item.label}
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#F68B1E] group-hover:translate-x-1 transition-all duration-200" />
                    </h3>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors leading-relaxed">{item.desc}</p>
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
        .gap-5 { gap: 20px; }
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
        .rounded-xl { border-radius: 12px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
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
        .font-extrabold { font-weight: 800; }
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
