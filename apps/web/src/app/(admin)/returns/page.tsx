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
 const rejectReturn = api.return.reject.useMutation({
 onSuccess: () => refetch()
 });

 const handleReject = (returnId: string) => {
 const reason = window.prompt('ENTER REJECTION LOG:');
 if (reason) {
 rejectReturn.mutate({ returnId, reason: reason.toUpperCase() });
 }
 };

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Return Pipeline</p>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <RotateCcw size={24} className="text-primary-container" />
 <h2 className="text-[10px] font-black text-primary-container uppercase tracking-[0.4em]">Protocol Reversal</h2>
 </div>
 <h1 className="text-4xl font-black text-on-surface uppercase tracking-tighter leading-none">Returns <span className="text-primary-container">Queue</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Management of order reversals, diagnostic checks, and refund settlements.</p>
 </div>
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-3 px-6 py-3 bg-primary-container/10 text-primary-container rounded-[20px] border-2 border-primary-container/20 shadow-xl shadow-primary-container/5">
 <Activity size={18} />
 <span className="text-[10px] font-black uppercase tracking-[0.3em]">{returns?.length || 0} PENDING NODES</span>
 </div>
 </div>
 </div>

 <div className="space-y-8">
 {returns && returns.length > 0 ? (
 returns.map((req: any, index: number) => (
 <div key={req.id} className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 50}ms` }}>
 <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
 
 {/* Product Info */}
 <div className="lg:col-span-4 flex gap-8">
 <div className="w-24 h-24 bg-surface-container-low rounded-[28px] flex items-center justify-center border-2 border-surface-container-low overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
 <img src={req.orderLine.variant.product.media[0]?.url} className="w-full h-full object-contain p-3" alt="Product" />
 </div>
 <div className="min-w-0 flex flex-col justify-center">
 <div className="flex items-center gap-3 mb-2">
 <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Node #{req.orderLine.package.orderId.slice(-8).toUpperCase()}</span>
 <div className="w-1 h-1 bg-surface-container-low rounded-full" />
 <span className="text-[9px] font-black text-primary-container uppercase tracking-widest">SKU: {req.orderLine.variant.sku}</span>
 </div>
 <h3 className="text-lg font-black text-on-surface leading-none uppercase tracking-tighter truncate">{req.orderLine.variant.product.title}</h3>
 <p className="text-[10px] text-on-surface-variant/40 font-black uppercase mt-3 tracking-widest italic">Qty: {req.orderLine.quantity} • ₦{Number(req.orderLine.unitPrice * req.orderLine.quantity).toLocaleString()}</p>
 </div>
 </div>

 {/* Return Reason */}
 <div className="lg:col-span-4 bg-surface-container-low/30 p-8 rounded-[32px] border-2 border-surface-container-low">
 <div className="flex items-center gap-3 mb-4">
 <RotateCcw size={16} className="text-on-surface-variant/20" />
 <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Consumer Justification</span>
 </div>
 <p className="text-[11px] font-black text-on-surface leading-relaxed uppercase tracking-widest italic">"{req.reason}"</p>
 </div>

 {/* Customer Info */}
 <div className="lg:col-span-2">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-surface-container-low rounded-[20px] flex items-center justify-center text-on-surface-variant/20 border-2 border-surface-container-low">
 <User size={20} />
 </div>
 <div>
 <p className="text-[10px] font-black text-on-surface uppercase tracking-tight leading-none">{req.orderLine.package.order.user.firstName} {req.orderLine.package.order.user.lastName}</p>
 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase mt-2 tracking-[0.2em] italic">Verified Entity</p>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="lg:col-span-2 flex items-center justify-end gap-4">
 <button 
 onClick={() => approveReturn.mutate({ returnId: req.id })}
 disabled={approveReturn.isPending}
 className="w-16 h-16 bg-success text-white rounded-2xl flex items-center justify-center shadow-xl shadow-success/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 border-4 border-white/10"
 >
 <CheckCircle2 size={28} />
 </button>
 <button 
 onClick={() => handleReject(req.id)}
 disabled={rejectReturn.isPending}
 className="w-16 h-16 bg-error/5 text-error rounded-2xl border-4 border-error/10 flex items-center justify-center hover:bg-error hover:text-white active:scale-95 transition-all disabled:opacity-30"
 >
 <XCircle size={28} />
 </button>
 </div>

 </div>
 
 {/* Footer bar */}
 <div className="px-10 py-5 bg-surface-container-low/30 border-t-4 border-surface-container-low flex items-center justify-between">
 <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 italic">
 <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
 <div className="w-1.5 h-1.5 bg-primary-container/20 rounded-full" />
 <span className="text-primary-container">Diagnostic Checklist Required</span>
 </div>
 <Link href={`/admin/orders/${req.orderLine.package.orderId}`} className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface hover:text-primary-container flex items-center gap-3 transition-all group">
 Audit Full Order <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
 </Link>
 </div>
 </div>
 ))
 ) : (
 <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low py-32 text-center shadow-soft animate-in zoom-in-95 duration-1000">
 <div className="w-24 h-24 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto mb-10 text-on-surface-variant/20 border-2 border-surface-container-low">
 <RotateCcw size={40} />
 </div>
 <h3 className="font-black text-3xl text-on-surface uppercase tracking-tighter mb-4">Pipeline <span className="text-success">Clear</span></h3>
 <p className="text-on-surface-variant/40 font-black text-[10px] uppercase tracking-[0.4em] italic">NO PENDING RETURN REQUESTS DETECTED IN THE LOGISTICS QUEUE.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
