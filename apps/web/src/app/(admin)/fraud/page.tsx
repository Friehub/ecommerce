'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { ShieldAlert, ShieldCheck, ShieldX, User, Search, ExternalLink, Activity, Fingerprint, Lock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFraudQueuePage() {
 const utils = api.useUtils();
 const { data: orders, isLoading } = api.admin.getFraudQueue.useQuery();
 
 const resolveFraud = api.admin.resolveFraudReview.useMutation({
 onSuccess: () => {
 utils.admin.getFraudQueue.invalidate();
 }
 });

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <ShieldAlert size={24} className="text-primary-container" />
 <h2 className="text-[10px] font-black text-primary-container uppercase tracking-[0.4em]">Security Diagnostic</h2>
 </div>
 <h1 className="text-4xl font-black text-on-surface uppercase tracking-tighter leading-none">Fraud <span className="text-primary-container">Audit</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Transactional anomaly detection and manual security review hub.</p>
 </div>
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-3 px-6 py-3 bg-primary-container/10 text-primary-container rounded-[20px] border-2 border-primary-container/20 shadow-xl shadow-primary-container/5">
 <Fingerprint size={18} />
 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sentinel Active</span>
 </div>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="p-8 border-b-4 border-surface-container-low bg-surface-container-low/30 flex items-center justify-between">
 <div className="relative max-w-md w-full">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={18} />
 <input 
 type="text" 
 placeholder="QUERY ORDER IDENTITY..." 
 className="w-full pl-16 pr-6 h-14 bg-surface-container-lowest border-2 border-surface-container-low rounded-2xl focus:border-primary-container text-[10px] font-black uppercase tracking-[0.3em] outline-none placeholder:font-normal placeholder:text-on-surface-variant/50 transition-all"
 />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead className="bg-surface-container-low/30 text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 border-b-2 border-surface-container-low">
 <tr>
 <th className="px-10 py-6">Identity / Node</th>
 <th className="px-10 py-6">Market Value</th>
 <th className="px-10 py-6">Anomaly Log</th>
 <th className="px-10 py-6 text-right">Rulings</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-surface-container-low">
 {isLoading ? (
 [...Array(3)].map((_, i) => (
 <tr key={i} className="animate-pulse">
 <td colSpan={4} className="px-10 py-12"><div className="h-12 bg-surface-container-low rounded-[20px] w-full" /></td>
 </tr>
 ))
 ) : orders?.map((order) => (
 <tr key={order.id} className="hover:bg-surface-container-low/20 transition-all duration-300">
 <td className="px-10 py-8">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-on-surface-variant/40 border-2 border-surface-container-low">
 <User size={20} />
 </div>
 <div>
 <div className="font-black text-sm text-on-surface flex items-center gap-3 uppercase tracking-tighter">
 #{order.id.slice(-8).toUpperCase()}
 <a href={`/admin/orders/${order.id}`} className="text-on-surface-variant/20 hover:text-primary-container transition-colors">
 <ExternalLink size={14} />
 </a>
 </div>
 <div className="text-[10px] font-black text-on-surface-variant/40 mt-1 uppercase tracking-widest italic">
 {order.user.email.toUpperCase()}
 </div>
 </div>
 </div>
 </td>
 <td className="px-10 py-8">
 <div className="text-sm font-black text-on-surface uppercase tracking-widest">
 ₦{Number(order.total).toLocaleString()}
 </div>
 </td>
 <td className="px-10 py-8">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest italic">FLAGGED AUTOMATICALLY</span>
 <span className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.2em]">{format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</span>
 </div>
 </td>
 <td className="px-10 py-8 text-right">
 <div className="flex items-center justify-end gap-4">
 <button 
 onClick={() => resolveFraud.mutate({ orderId: order.id, action: 'ALLOW' })}
 className="h-14 px-6 bg-success/5 text-success rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-2 border-success/10 hover:bg-success hover:text-white transition-all active:scale-90"
 >
 <ShieldCheck size={16} className="inline mr-2" />
 Authorized
 </button>
 <button 
 onClick={() => resolveFraud.mutate({ orderId: order.id, action: 'BLOCK' })}
 className="h-14 px-6 bg-error/5 text-error rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-2 border-error/10 hover:bg-error hover:text-white transition-all active:scale-90"
 >
 <ShieldX size={16} className="inline mr-2" />
 Terminate
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {!isLoading && orders?.length === 0 && (
 <div className="py-24 text-center">
 <ShieldCheck className="mx-auto text-surface-container-low mb-8 opacity-40" size={64} />
 <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter mb-4">Diagnostic <span className="text-success">Clean</span></h3>
 <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em] italic">NO UNRESOLVED SECURITY FLAGS DETECTED WITHIN THE FRAUD PIPELINE.</p>
 </div>
 )}
 </div>
 </div>
 
 <div className="mt-12 bg-on-surface text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-[120px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
 <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center border-2 border-white/10">
 <Lock size={32} />
 </div>
 <div>
 <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Protocol <span className="text-primary-container">Hardening</span></h3>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40 max-w-xl">ALL AUDIT ACTIONS ARE CRYPTOGRAPHICALLY SIGNED AND LOGGED TO THE PERMANENT ADMINISTRATIVE LEDGER.</p>
 </div>
 </div>
 <Activity size={40} className="text-primary-container animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 );
}
