'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  User,
  ExternalLink,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminReturnsPage() {
  const { data: returns, isLoading, refetch } = api.return.listPending.useQuery();
  const approveReturn = api.return.approve.useMutation({
    onSuccess: () => refetch()
  });
  const rejectReturn = api.return.reject.useMutation({
    onSuccess: () => refetch()
  });

  const handleReject = (returnId: string) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason) {
      rejectReturn.mutate({ returnId, reason });
    }
  };

  if (isLoading) return <div className="p-12 text-center text-xs font-black uppercase tracking-widest text-gray-400">Loading Return Requests...</div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Returns Queue</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Order Reversal & Refund Management</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-2">
            <Clock size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{returns?.length || 0} PENDING</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6">
        {returns && returns.length > 0 ? (
          returns.map((req: any) => (
            <div key={req.id} className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden group">
              <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Product Info */}
                <div className="lg:col-span-4 flex gap-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                    <img src={req.orderLine.variant.product.media[0]?.url} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order #{req.orderLine.package.orderId.slice(-8).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[9px] font-black text-[#F68B1E] uppercase tracking-widest">SKU: {req.orderLine.variant.sku}</span>
                    </div>
                    <h3 className="font-black text-gray-900 leading-tight truncate">{req.orderLine.variant.product.title}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Qty: {req.orderLine.quantity} • ₦{Number(req.orderLine.unitPrice * req.orderLine.quantity).toLocaleString()}</p>
                  </div>
                </div>

                {/* Return Reason */}
                <div className="lg:col-span-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw size={14} className="text-gray-400" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer Reason</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed italic">"{req.reason}"</p>
                </div>

                {/* Customer Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-900 leading-none">{req.orderLine.package.order.user.firstName} {req.orderLine.package.order.user.lastName}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Verified Buyer</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => approveReturn.mutate({ returnId: req.id })}
                    disabled={approveReturn.isPending}
                    className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={rejectReturn.isPending}
                    className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl border border-red-100 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

              </div>
              
              {/* Footer bar */}
              <div className="px-8 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-blue-500">QC Checklist Required</span>
                </div>
                <Link href={`/admin/orders/${req.orderLine.package.orderId}`} className="text-[9px] font-black uppercase tracking-widest text-[#F68B1E] flex items-center gap-1 hover:gap-2 transition-all">
                  View Full Order <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[32px] border border-gray-100 py-32 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-gray-200 border border-gray-100">
              <RotateCcw size={32} />
            </div>
            <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight">Queue Empty</h3>
            <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">No pending return requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
