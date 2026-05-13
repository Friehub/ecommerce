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
 <div className="bg-background min-h-screen py-8">
 <div className="container mx-auto px-4">
 <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse mb-8" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-1">
 <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 h-48 animate-pulse" />
 </div>
 <div className="lg:col-span-2">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="h-32 bg-surface-container-lowest rounded-2xl border border-outline-variant animate-pulse" />
 ))}
 </div>
 </div>
 </div>
 </div>
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
 <div className="bg-background min-h-screen py-8">
 <div className="container mx-auto px-4">
 <h1 className="text-title-lg text-on-surface mb-8 tracking-tight border-b-4 border-primary-container pb-2 w-fit uppercase font-black">
 My Account
 </h1>
 
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* User Overview */}
 <div className="lg:col-span-1">
 <div className="bg-surface-container-lowest rounded-[32px] border border-outline-variant hover:border-outline transition-all duration-300 shadow-soft p-8">
 <div className="flex items-center gap-5 mb-8">
 <div className="w-20 h-20 bg-primary-container text-white border-4 border-primary-container/20 rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-primary-container/10">
 {session.user?.email?.[0].toUpperCase()}
 </div>
 <div>
 <p className="font-black text-xl text-on-surface leading-tight tracking-tighter uppercase">{session.user?.email?.split('@')[0]}</p>
 <p className="text-[10px] font-black text-on-surface-variant mt-1 uppercase tracking-widest opacity-60">{session.user?.email}</p>
 </div>
 </div>
 <div className="border-t border-outline-variant/30 pt-6 space-y-5">
 <div className="flex justify-between text-xs">
 <span className="text-on-surface-variant font-black uppercase tracking-widest opacity-60">Member Since</span>
 <span className="font-black text-on-surface uppercase tracking-tight">April 2024</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-on-surface-variant font-black uppercase tracking-widest opacity-60">Account Type</span>
 <span className="font-black text-primary-container uppercase tracking-tight">{(session.user as any)?.role || 'Buyer'}</span>
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
 className="bg-surface-container-lowest p-6 rounded-[28px] border border-outline-variant hover:border-primary-container hover:shadow-xl transition-all duration-300 flex items-start gap-5 group cursor-pointer shadow-soft"
 >
 <div className="text-primary-container bg-primary-container/5 p-4 rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-all duration-300 flex items-center justify-center group-hover:scale-110 shadow-sm">
 {item.icon}
 </div>
 <div className="flex-1">
 <h3 className="font-black text-on-surface mb-1 flex items-center justify-between group-hover:text-primary-container transition-colors uppercase tracking-tight text-sm">
 {item.label}
 <ChevronRight size={18} className="text-on-surface-variant opacity-20 group-hover:text-primary-container group-hover:translate-x-1 transition-all duration-300" />
 </h3>
 <p className="text-[11px] font-medium text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">{item.desc}</p>
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
