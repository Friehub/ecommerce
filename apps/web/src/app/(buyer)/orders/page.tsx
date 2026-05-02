'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ShoppingBag, ChevronRight, Package, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { data: orders, isLoading } = api.order.listMyOrders.useQuery();

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/account" className="text-gray-500 hover:text-[#F68B1E] transition-colors text-sm">My Account</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-sm font-bold">Orders</span>
        </div>

        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Orders</h1>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-[#F68B1E]">
                        <Package size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">Order #{order.id.substring(0, 8).toUpperCase()}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-700' 
                              : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Placed on {format(new Date(order.createdAt), 'dd-MM-yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-gray-900">
                            <span>Total: ₦{Number(order.total).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/orders/${order.id}`}
                      className="text-[#F68B1E] text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                    >
                      See Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">You have no orders</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Items you order will show up here</p>
              <Link href="/" className="px-6 py-2 bg-[#F68B1E] text-white rounded font-bold text-sm uppercase">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .justify-between { justify-content: space-between; }
        .flex-col { flex-direction: column; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .gap-x-4 { column-gap: 16px; }
        .gap-y-1 { row-gap: 4px; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-orange-50 { background-color: #fff7ed; }
        .bg-green-100 { background-color: #dcfce7; }
        .bg-red-100 { background-color: #fee2e2; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-green-700 { color: #15803d; }
        .text-red-700 { color: #b91c1c; }
        .text-blue-700 { color: #1d4ed8; }
        .text-gray-900 { color: #111827; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .divide-y > * + * { border-top: 1px solid #e5e7eb; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .p-8 { padding: 2rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-[10px] { font-size: 10px; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @media (min-width: 640px) {
          .sm\\:flex-row { flex-direction: row; }
          .sm\\:items-center { align-items: center; }
        }
      `}</style>
    </div>
  );
}
