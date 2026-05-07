'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { User, Package, Heart, MapPin, Settings, ChevronRight, CreditCard, Loader2, Bell } from 'lucide-react';
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
    { label: 'Orders', icon: <Package size={24} />, href: '/account/orders', desc: 'Check your order status and history' },
    { label: 'Notifications', icon: <Bell size={24} />, href: '/notifications', desc: 'View your messages and alerts' },
    { label: 'Saved Items', icon: <Heart size={24} />, href: '/wishlist', desc: 'View items you saved for later' },
    { label: 'Jumia Wallet', icon: <CreditCard size={24} />, href: '/account/wallet', desc: 'Check balance and fund your account' },
    { label: 'Addresses', icon: <MapPin size={24} />, href: '/account/addresses', desc: 'Manage your delivery addresses' },
    { label: 'Account Settings', icon: <Settings size={24} />, href: '/account/settings', desc: 'Update your profile and password' },
  ];

  return (
    <div className="bg-[#F9F9FA] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight border-b-2 border-[#F68B1E] pb-1 w-fit">
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Overview */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-2">
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
    </div>
  );
}
