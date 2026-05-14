'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
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
 ArrowRight,
 ShieldCheck,
 Activity
} from 'lucide-react';
import Link from 'next/link';

export default function AdminReturnsPage() {
  const { data: returns, isLoading, refetch } = api.return.listPending.useQuery();
  const approveReturn = api.return.approve.useMutation({
    onSuccess: () => refetch()
  });

  const { data: orders, isLoading: returnsLoading } = api.return.listPending.useQuery();
  const rejectReturn = api.return.reject.useMutation({
    onSuccess: () => refetch()
  });

  const handleReject = (returnId: string) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason) {
      rejectReturn.mutate({ returnId, reason: reason.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
                <RotateCcw size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Return Requests</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Returns <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage order returns, quality inspections, and refund approvals</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <Activity size={16} className="text-jumia-orange" />
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">{returns?.length || 0} Pending Requests</span>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-6">
          {returns && returns.length > 0 ? (
            returns.map((req: any) => (
              <div key={req.id} className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden group hover:border-jumia-orange/20 transition-all duration-300">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Product Info */}
                  <div className="lg:col-span-5 flex gap-6">
                    <div className="w-20 h-20 bg-j-background rounded-sm flex items-center justify-center border border-j-border overflow-hidden shrink-0 group-hover:border-jumia-orange/30 transition-colors">
                      <img src={req.orderLine.variant.product.media[0]?.url} className="w-full h-full object-contain p-2" alt={req.orderLine.variant.product.title} />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black text-j-text-muted/60 uppercase tracking-widest">Order ID: {req.orderLine.package.orderId.slice(-8).toUpperCase()}</span>
                        <div className="w-1 h-1 bg-j-border rounded-full" />
                        <span className="text-[9px] font-black text-jumia-orange uppercase tracking-widest">SKU: {req.orderLine.variant.sku}</span>
                      </div>
                      <h3 className="text-base font-black text-j-text leading-tight uppercase tracking-tight truncate group-hover:text-jumia-orange transition-colors">
                        {req.orderLine.variant.product.title}
                      </h3>
                      <p className="text-[10px] text-j-text-muted font-black uppercase mt-2 tracking-widest opacity-60">
                        Qty: {req.orderLine.quantity} • <span className="text-j-text">₦{Number(req.orderLine.unitPrice * req.orderLine.quantity).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Return Reason */}
                  <div className="lg:col-span-4 bg-j-background/50 p-6 rounded-sm border border-j-border">
                    <div className="flex items-center gap-2 mb-3">
                      <RotateCcw size={14} className="text-j-text-muted/40" />
                      <span className="text-[9px] font-black text-j-text-muted uppercase tracking-widest">Reason for Return</span>
                    </div>
                    <p className="text-xs font-bold text-j-text leading-relaxed tracking-tight italic">
                      "{req.reason}"
                    </p>
                  </div>

                  {/* Customer & Actions */}
                  <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-j-border pt-6 lg:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-j-background rounded-sm flex items-center justify-center text-j-text-muted border border-j-border">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-j-text uppercase tracking-tight truncate">
                          {req.orderLine.package.order.user.firstName} {req.orderLine.package.order.user.lastName}
                        </p>
                        <p className="text-[9px] font-black text-j-text-muted/60 uppercase tracking-widest">Verified Customer</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => approveReturn.mutate({ returnId: req.id })}
                        disabled={approveReturn.isPending}
                        className="w-12 h-12 bg-j-success text-white rounded-sm flex items-center justify-center shadow-sm hover:bg-green-600 active:scale-95 transition-all disabled:opacity-30"
                        title="Approve Return"
                      >
                        <CheckCircle2 size={24} />
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        disabled={rejectReturn.isPending}
                        className="w-12 h-12 bg-red-50 text-j-error rounded-sm border border-red-100 flex items-center justify-center hover:bg-j-error hover:text-white active:scale-95 transition-all disabled:opacity-30"
                        title="Reject Return"
                      >
                        <XCircle size={24} />
                      </button>
                    </div>
                  </div>

                </div>
                
                {/* Footer bar */}
                <div className="px-8 py-4 bg-j-background/50 border-t border-j-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-j-text-muted/60">
                    <span>Requested on {new Date(req.createdAt).toLocaleDateString()}</span>
                    <div className="w-1 h-1 bg-j-border rounded-full" />
                    <span className="text-jumia-orange">Quality Inspection Required</span>
                  </div>
                  <Link href={`/admin/orders/${req.orderLine.package.orderId}`} className="text-[9px] font-black uppercase tracking-widest text-j-text hover:text-jumia-orange flex items-center gap-2 transition-all group/link">
                    View Order Details <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-sm border border-j-border py-24 text-center shadow-sm">
              <div className="w-16 h-16 bg-j-background rounded-full flex items-center justify-center mx-auto mb-6 opacity-20 border border-j-border">
                <RotateCcw size={32} />
              </div>
              <h3 className="font-black text-2xl text-j-text uppercase tracking-tight mb-2">No Pending Returns</h3>
              <p className="text-j-text-muted font-black text-[10px] uppercase tracking-widest opacity-60">There are currently no return requests waiting for approval.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <ShieldCheck size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Return <span className="text-jumia-orange">Standards</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  All returns must undergo a quality inspection before refund approval. Ensure customers are notified of the return status within 48 hours of receipt.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">System Active</span>
              <Activity size={16} className="text-jumia-orange animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
