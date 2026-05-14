'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { AlertTriangle, Clock, CheckCircle, ArrowRight, ShieldAlert, Activity, Scale } from 'lucide-react';

export default function DisputeCenter() {
 const { data: disputes, isLoading } = api.dispute.listMyDisputes.useQuery();

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Resolution Nodes</p>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-5xl mx-auto px-6">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <Scale size={24} className="text-jumia-orange" />
 <h2 className="text-[10px] font-semibold text-jumia-orange uppercase tracking-[0.4em]">Resolution Protocol</h2>
 </div>
 <h1 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Dispute <span className="text-jumia-orange">Matrix</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Operational conflict management and settlement tracking.</p>
 </div>
 <div className="flex items-center gap-4">
 <Link href="/orders" className="h-14 px-8 bg-surface-container-low text-on-surface rounded-xl font-semibold text-[10px] uppercase tracking-[0.3em] hover:bg-jumia-orange hover:text-white transition-all active:scale-95 flex items-center gap-3 border-2 border-surface-container-low">
 New Conflict <ArrowRight size={14} />
 </Link>
 </div>
 </div>

 {(!disputes || disputes.length === 0) ? (
 <div className="bg-surface-container-lowest p-20 rounded-[56px] border border-surface-container-low shadow-soft text-center animate-in zoom-in-95 duration-1000">
 <ShieldAlert className="mx-auto text-surface-container-low mb-10" size={80} />
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Zero <span className="text-jumia-orange">Anomalies</span></h3>
 <p className="text-on-surface-variant/40 text-[11px] max-w-sm mx-auto mb-12 font-semibold uppercase tracking-[0.3em] leading-relaxed italic">
 NO ACTIVE CONFLICTS DETECTED WITHIN YOUR TRANSACTION HISTORY. ALL NODES OPERATING WITHIN NORMAL PARAMETERS.
 </p>
 <Link href="/orders" className="h-20 px-16 bg-jumia-orange text-white rounded-3xl font-semibold text-[10px] uppercase tracking-[0.4em] hover:bg-jumia-orange-dark transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto w-fit">
 Explore History <ArrowRight size={20} />
 </Link>
 </div>
 ) : (
 <div className="bg-surface-container-lowest rounded-[48px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="divide-y-2 divide-surface-container-low">
 {disputes.map((dispute) => (
 <div key={dispute.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-container-low/20 transition-all gap-8 group">
 <div className="space-y-4">
 <div className="flex items-center gap-4">
 <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border-2 ${
 dispute.status === 'OPEN' ? 'bg-error/5 text-error border-error/10' :
 dispute.status === 'UNDER_REVIEW' ? 'bg-jumia-orange/5 text-jumia-orange border-jumia-orange/10' :
 'bg-success/5 text-success border-success/10'
 }`}>
 {dispute.status.replace('_', ' ')}
 </span>
 <span className="text-on-surface-variant/40 text-[10px] font-semibold uppercase tracking-[0.3em] italic">
 Node #{dispute.orderId.slice(-8).toUpperCase()}
 </span>
 </div>
 <h3 className="text-xl font-semibold text-on-surface uppercase tracking-tighter leading-none group-hover:text-jumia-orange transition-colors">{dispute.reason}</h3>
 <div className="flex items-center gap-3 text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-widest italic">
 <Activity size={12} />
 Sequence Initiated {new Date(dispute.createdAt).toLocaleDateString()}
 </div>
 </div>
 
 <Link href={`/disputes/${dispute.id}`} className="h-16 px-10 bg-surface-container-low text-on-surface rounded-2xl font-semibold text-[10px] uppercase tracking-[0.3em] hover:bg-jumia-orange hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 group/btn border-2 border-surface-container-low shrink-0">
 Audit Thread <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
 </Link>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
