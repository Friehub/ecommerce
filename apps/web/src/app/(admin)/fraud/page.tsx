'use client';

import React from 'react';
import { api } from '../../../trpc/react';
import { ShieldAlert, ShieldCheck, ShieldX, User, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFraudQueuePage() {
  const utils = api.useUtils();
  const { data: orders, isLoading } = api.admin.getFraudQueue.useQuery();
  
  const resolveFraud = api.admin.resolveFraudReview.useMutation({
    onSuccess: () => {
      utils.admin.getFraudQueue.invalidate();
      alert('Fraud review resolved!');
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <ShieldAlert size={28} className="text-[#f68b1e]" />
            Fraud Review Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">Orders flagged for manual security review.</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by Order ID..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4">Order ID / Customer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Flagged On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-bold text-gray-900 flex items-center gap-2">
                      #{order.id.slice(-8).toUpperCase()}
                      <a href={`/admin/orders/${order.id}`} className="text-gray-400 hover:text-[#f68b1e]">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <User size={12} />
                      {order.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ₦{Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => resolveFraud.mutate({ orderId: order.id, action: 'ALLOW' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-green-100 transition-colors"
                      >
                        <ShieldCheck size={14} />
                        Allow
                      </button>
                      <button 
                        onClick={() => resolveFraud.mutate({ orderId: order.id, action: 'BLOCK' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        <ShieldX size={14} />
                        Block
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && orders?.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm italic">
              Fraud queue is clear. Good job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
