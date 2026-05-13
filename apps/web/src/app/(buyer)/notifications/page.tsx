'use client';

import React, { useState } from 'react';
import { Bell, Clock, ShoppingBag, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Notification {
 id: string;
 title: string;
 message: string;
 createdAt: string;
 isRead: boolean;
 type: 'ORDER' | 'PROMO' | 'SYSTEM';
 actionLabel?: string;
 actionUrl?: string;
}

const initialNotifications: Notification[] = [
 {
 id: '1',
 title: 'Order Delivered Successfully',
 message: 'Your order #ORD-8829-X has been delivered. We hope you enjoy your purchase!',
 createdAt: '2 hours ago',
 isRead: false,
 type: 'ORDER',
 actionLabel: 'Write a Review',
 actionUrl: '/account/reviews/new?orderId=1'
 },
 {
 id: '2',
 title: 'Flash Sale Starting Soon!',
 message: 'Get ready! The Mega Friday Flash Sale starts in 30 minutes. Up to 70% off.',
 createdAt: '5 hours ago',
 isRead: false,
 type: 'PROMO',
 actionLabel: 'View Deals',
 actionUrl: '/flash-sales'
 },
 {
 id: '3',
 title: 'Account Security Update',
 message: 'Your password was successfully updated. If this was not you, please contact support.',
 createdAt: '1 day ago',
 isRead: true,
 type: 'SYSTEM'
 },
 {
 id: '4',
 title: 'Price Drop on Saved Item',
 message: 'Good news! The "Sony WH-1000XM5" you saved is now 15% off.',
 createdAt: '2 days ago',
 isRead: true,
 type: 'PROMO',
 actionLabel: 'Buy Now',
 actionUrl: '/product/sony-headphones'
 }
];

export default function NotificationsPage() {
 const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

 const markAllAsRead = () => {
 setNotifications(notifications.map(n => ({ ...n, isRead: true })));
 };

 return (
 <div className="bg-background min-h-screen pb-12 select-none">
 <div className="container py-8">
 <div className="flex items-center gap-3 mb-8 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em]">
 <Link href="/" className="hover:text-primary-container transition-colors">Home</Link>
 <ChevronRight size={14} className="opacity-30" />
 <Link href="/account" className="hover:text-primary-container transition-colors">My Account</Link>
 <ChevronRight size={14} className="opacity-30" />
 <span className="text-on-surface">Notifications</span>
 </div>

 <div className="max-w-4xl mx-auto">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden transition-all hover:border-primary-container/20">
 <div className="px-10 py-8 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-primary-container/10 rounded-2xl flex items-center justify-center text-primary-container border-2 border-primary-container/20">
 <Bell size={24} />
 </div>
 <h1 className="text-xl font-black text-on-surface uppercase tracking-tighter">Signal Center</h1>
 </div>
 <button 
 onClick={markAllAsRead}
 className="text-[9px] font-black text-primary-container hover:bg-primary-container hover:text-white px-5 py-2.5 border-2 border-primary-container/20 rounded-xl transition-all uppercase tracking-widest active:scale-95 italic"
 >
 Sync All Feeds
 </button>
 </div>

 <div className="divide-y-4 divide-surface-container-low">
 {notifications.map((notification) => (
 <div key={notification.id} className="group relative p-10 flex items-start gap-8 hover:bg-surface-container-low/20 transition-all duration-500">
 {!notification.isRead && (
 <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary-container rounded-r-full shadow-lg shadow-primary-container/30 animate-pulse" />
 )}
 <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${notification.isRead ? 'bg-surface-container-low text-on-surface-variant/20 border-surface-container-low' : 'bg-primary-container/10 text-primary-container border-primary-container/20 shadow-sm'}`}>
 {notification.type === 'ORDER' ? <ShoppingBag size={20} /> : notification.type === 'PROMO' ? <Zap size={20} /> : <div className="w-2 h-2 bg-current rounded-full" />}
 </div>
 <div className="flex-1">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
 <h3 className={`text-base font-black uppercase tracking-tight transition-colors ${notification.isRead ? 'text-on-surface-variant/40' : 'text-on-surface group-hover:text-primary-container'}`}>
 {notification.title}
 </h3>
 <div className="flex items-center gap-2 text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest italic bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/10">
 <Clock size={12} /> {notification.createdAt}
 </div>
 </div>
 <p className={`text-xs font-bold leading-relaxed mb-6 transition-colors ${notification.isRead ? 'text-on-surface-variant/30 italic' : 'text-on-surface-variant'}`}>
 {notification.message}
 </p>
 {notification.actionLabel && notification.actionUrl && (
 <Link 
 href={notification.actionUrl}
 className="inline-flex items-center gap-3 text-[10px] font-black text-primary-container uppercase tracking-[0.2em] hover:translate-x-2 transition-transform bg-primary-container/5 px-4 py-2 rounded-xl border border-primary-container/10"
 >
 Execute Protocol <ArrowRight size={14} />
 </Link>
 )}
 </div>
 </div>
 ))}
 </div>

 {notifications.length === 0 && (
 <div className="py-40 text-center px-4 animate-in fade-in zoom-in-95 duration-1000">
 <Bell size={64} className="mx-auto text-on-surface-variant/5 mb-8" />
 <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter">Signal Silence</h3>
 <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic">No incoming transmissions detected in this sector.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
