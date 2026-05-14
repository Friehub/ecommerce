'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { ShieldAlert, ShieldCheck, ShieldX, User, Search, ExternalLink, Activity, Fingerprint, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminFraudQueuePage() {
  const utils = api.useUtils();
  const { data: orders, isLoading } = api.admin.getFraudQueue.useQuery();
  
  const resolveFraud = api.admin.resolveFraudReview.useMutation({
    onSuccess: () => {
      utils.admin.getFraudQueue.invalidate();
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-sm" />
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
                <ShieldAlert size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Order Security</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Fraud <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Review flagged transactions and security anomalies</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Monitoring Active</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-j-border bg-j-background/30 flex items-center justify-between">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search Order ID..." 
                className="w-full h-11 pl-12 pr-4 bg-white border border-j-border rounded-sm outline-none focus:border-jumia-orange text-xs font-bold text-j-text placeholder:text-j-text-muted/40 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background/50 text-[9px] font-black uppercase tracking-widest text-j-text-muted/60 border-b border-j-border">
                  <th className="px-8 py-5">Order / Customer</th>
                  <th className="px-8 py-5">Order Total</th>
                  <th className="px-8 py-5">Security Reason</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-j-background/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-j-background rounded-sm flex items-center justify-center text-j-text-muted border border-j-border group-hover:border-jumia-orange/30 transition-colors">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-black text-sm text-j-text flex items-center gap-2 uppercase tracking-tight">
                            #{order.id.slice(-8).toUpperCase()}
                            <a href={`/admin/orders/${order.id}`} className="text-j-text-muted/20 hover:text-jumia-orange transition-colors">
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <div className="text-[10px] font-black text-j-text-muted/40 uppercase tracking-widest mt-0.5">
                            {order.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-j-text">
                        ₦{Number(order.total).toLocaleString()}
                      </div>
                      <div className="text-[9px] font-black text-j-text-muted uppercase opacity-60 mt-0.5">
                        {order.paymentMethod || 'Prepaid'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-jumia-orange uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-sm border border-orange-100 w-fit">Auto-Flagged</span>
                        <span className="text-[8px] font-black text-j-text-muted/40 uppercase tracking-tight">{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => resolveFraud.mutate({ orderId: order.id, action: 'ALLOW' })}
                          className="h-10 px-6 bg-white text-j-success rounded-sm text-[10px] font-black uppercase tracking-widest border border-j-border hover:bg-j-success hover:text-white hover:border-j-success transition-all shadow-sm active:scale-95"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => resolveFraud.mutate({ orderId: order.id, action: 'BLOCK' })}
                          className="h-10 px-6 bg-white text-j-error rounded-sm text-[10px] font-black uppercase tracking-widest border border-j-border hover:bg-j-error hover:text-white hover:border-j-error transition-all shadow-sm active:scale-95"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-green-50 text-j-success rounded-full flex items-center justify-center border border-green-100 mb-2">
                          <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-black text-j-text uppercase tracking-tight">Queue All Clear</h3>
                        <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">No orders require manual security review at this time.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Info Footer */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <Lock size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Security <span className="text-jumia-orange">Standards</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-xl leading-relaxed">
                  All administrative actions are logged and audited to ensure platform integrity and compliance with e-commerce security protocols.
                </p>
              </div>
            </div>
            <Activity size={32} className="text-jumia-orange/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
