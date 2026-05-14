'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ShoppingBag, ChevronRight, Package, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const { data: orders, isLoading } = api.order.listMyOrders.useQuery();

  return (
    <div className="bg-j-background min-h-screen pb-16">
      <div className="max-w-[1184px] mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8 px-2 text-[10px] font-black text-j-text-muted uppercase tracking-widest">
          <Link href="/account" className="hover:text-jumia-orange transition-colors">My Account</Link>
          <ChevronRight size={12} />
          <span className="text-j-text">Orders History</span>
        </div>

        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-j-text uppercase tracking-tight leading-none mb-2">My Orders</h1>
              <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Review your past and current orders</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-sm shadow-sm border border-j-border flex items-center justify-center text-jumia-orange">
              <Package size={28} strokeWidth={2} />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-sm" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <div 
                  key={order.id} 
                  className="bg-white border border-j-border rounded-sm overflow-hidden hover:border-jumia-orange/30 shadow-sm hover:shadow-md transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-j-background border border-j-border rounded-sm flex items-center justify-center flex-shrink-0 text-j-text-muted group-hover:text-jumia-orange transition-all">
                        <Package size={28} strokeWidth={2} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="font-black text-sm text-j-text uppercase tracking-tight">Order #{order.id.substring(0, 8).toUpperCase()}</span>
                          <span className={`text-[9px] px-3 py-1 rounded-sm font-black uppercase shadow-sm border ${
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                            ? 'bg-green-50 text-j-success border-green-100' 
                            : order.status === 'CANCELLED'
                            ? 'bg-red-50 text-j-error border-red-100'
                            : 'bg-orange-50 text-jumia-orange border-orange-100'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-j-text-muted uppercase tracking-tight">
                            <Calendar size={14} />
                            <span>{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-40 italic">Total</span>
                            <span className="font-black text-lg text-j-text">₦ {Number(order.total).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="inline-flex h-12 items-center justify-center gap-3 px-8 bg-j-background group-hover:bg-jumia-orange text-j-text group-hover:text-white rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border border-j-border active:scale-95 shadow-sm"
                    >
                      View Details
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center px-8 bg-white border border-j-border rounded-sm shadow-sm animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-j-background border-2 border-dashed border-j-border rounded-full flex items-center justify-center mx-auto mb-8 text-j-border">
                <ShoppingBag size={40} />
              </div>
              <h3 className="font-black text-2xl text-j-text uppercase tracking-tight mb-2">No orders yet</h3>
              <p className="text-[10px] font-black text-j-text-muted uppercase mb-10 tracking-widest opacity-60">Discover our best deals and start shopping!</p>
              <Link href="/" className="inline-flex items-center gap-4 px-10 py-4 bg-jumia-orange text-white rounded-sm font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all active:scale-95">
                Go to Homepage
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
