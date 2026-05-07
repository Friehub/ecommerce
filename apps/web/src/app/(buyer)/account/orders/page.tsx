'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ShoppingBag, ChevronRight, Package, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { data: orders, isLoading } = api.order.listMyOrders.useQuery();

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-gray-400 hover:text-[#F68B1E] transition-colors text-[10px] font-black uppercase tracking-widest">My Account</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Orders History</span>
        </div>

        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-tight">Track and manage your recent purchases</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#F68B1E]">
              <Package size={24} />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white border border-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white border border-gray-100 rounded-[28px] overflow-hidden hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/[0.03] transition-all duration-300 group"
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-[#F68B1E] group-hover:bg-orange-50 transition-colors">
                        <Package size={28} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-black text-sm text-gray-900 uppercase tracking-tight">#{order.id.substring(0, 8).toUpperCase()}</span>
                          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : order.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-orange-50 text-[#F68B1E] border border-orange-100'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Calendar size={14} className="text-gray-300" />
                            <span>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total:</span>
                            <span className="font-black text-sm text-gray-900">₦ {Number(order.total).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 group-hover:bg-[#F68B1E] text-gray-900 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                      Order Details
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center px-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
              <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <h3 className="font-black text-2xl text-gray-900 tracking-tight uppercase">No orders found</h3>
              <p className="text-xs font-bold text-gray-400 uppercase mt-2 mb-8 tracking-widest">Looks like you haven&apos;t placed any orders yet</p>
              <Link href="/" className="inline-flex items-center gap-3 px-10 py-4 bg-[#F68B1E] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">
                Start Shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
