'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ShoppingBag, ChevronRight, Package, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
 const { data: orders, isLoading } = api.order.listMyOrders.useQuery();

 return (
 <div className="bg-background min-h-screen pb-12">
 <div className="container mx-auto px-4 py-8">
 <div className="flex items-center gap-3 mb-10 px-2 animate-in fade-in slide-in-from-left-4">
 <Link href="/account" className="text-on-surface-variant hover:text-primary-container transition-colors text-[10px] font-black uppercase tracking-[0.3em] opacity-50">My Account</Link>
 <ChevronRight size={14} className="text-on-surface-variant opacity-20" />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface">Orders History</span>
 </div>

 <div className="max-w-4xl">
 <div className="flex items-center justify-between mb-10 px-2">
 <div>
 <h1 className="text-3xl md:text-4xl font-black text-on-surface uppercase tracking-tighter leading-none mb-2">My Orders</h1>
 <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em] opacity-40">Purchase Intelligence & Tracking</p>
 </div>
 <div className="w-14 h-14 bg-surface-container-lowest rounded-2xl shadow-soft border-2 border-surface-container-low flex items-center justify-center text-primary-container">
 <Package size={28} strokeWidth={1.5} />
 </div>
 </div>

 {isLoading ? (
 <div className="space-y-6">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="h-40 bg-surface-container-low border-2 border-surface-container-lowest rounded-[28px] animate-pulse" />
 ))}
 </div>
 ) : orders && orders.length > 0 ? (
 <div className="space-y-6">
 {orders.map((order, idx) => (
 <div 
 key={order.id} 
 className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[32px] overflow-hidden hover:border-primary-container/20 hover:shadow-2xl transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4"
 style={{ animationDelay: `${idx * 100}ms` }}
 >
 <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
 <div className="flex items-start gap-6">
 <div className="w-20 h-20 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl flex items-center justify-center flex-shrink-0 text-on-surface-variant group-hover:text-primary-container group-hover:bg-primary-container/5 transition-all">
 <Package size={32} strokeWidth={1.5} />
 </div>
 <div className="space-y-3">
 <div className="flex flex-wrap items-center gap-4">
 <span className="font-black text-lg text-on-surface uppercase tracking-tighter">#{order.id.substring(0, 8).toUpperCase()}</span>
 <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-sm border ${
 order.status === 'DELIVERED' || order.status === 'COMPLETED' 
 ? 'bg-success-container/10 text-success border-success/10' 
 : order.status === 'CANCELLED'
 ? 'bg-error-container/10 text-error border-error/10'
 : 'bg-primary-container/10 text-primary-container border-primary-container/10'
 }`}>
 {order.status.replace('_', ' ')}
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
 <div className="flex items-center gap-3 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">
 <Calendar size={16} strokeWidth={1.5} />
 <span>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40 italic">Transaction Total</span>
 <span className="font-black text-lg text-on-surface">₦ {Number(order.total).toLocaleString()}</span>
 </div>
 </div>
 </div>
 </div>
 
 <Link 
 href={`/account/orders/${order.id}`}
 className="inline-flex h-14 items-center justify-center gap-3 px-10 bg-surface-container-low group-hover:bg-on-surface text-on-surface group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border-2 border-surface-container-lowest active:scale-95 shadow-sm"
 >
 Audit Details
 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="py-24 text-center px-8 bg-surface-container-lowest border-4 border-surface-container-low rounded-[48px] shadow-soft animate-in fade-in zoom-in-95">
 <div className="w-28 h-28 bg-surface-container-low border-2 border-surface-container-lowest rounded-[40px] flex items-center justify-center mx-auto mb-8 text-on-surface-variant opacity-20">
 <ShoppingBag size={48} strokeWidth={1} />
 </div>
 <h3 className="font-black text-3xl text-on-surface tracking-tighter uppercase mb-2">History is Empty</h3>
 <p className="text-[10px] font-black text-on-surface-variant uppercase mb-10 tracking-[0.3em] opacity-40">No recorded acquisitions detected</p>
 <Link href="/" className="inline-flex items-center gap-4 px-12 py-5 bg-on-surface text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
 Access Marketplace
 <ArrowRight size={18} />
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
