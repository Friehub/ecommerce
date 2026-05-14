'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Banknote, Search, CheckCircle2, Clock, AlertCircle, ShieldCheck, Activity, ArrowRight, Gavel } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminPayoutsPage() {
 const utils = api.useUtils();
 const [search, setSearch] = React.useState('');
 const { showToast } = useToast();
 const { data: payouts, isLoading } = api.revenue.listAllPayouts.useQuery();
 
 const filteredPayouts = payouts?.filter(p => 
 p.seller.businessName.toLowerCase().includes(search.toLowerCase()) ||
 p.id.toLowerCase().includes(search.toLowerCase())
 );

 const approvePayout = api.revenue.approvePayout.useMutation({
 onSuccess: () => {
 utils.revenue.listAllPayouts.invalidate();
 showToast('Payout approved and transfer initiated!');
 },
 onError: (err) => {
 showToast(`Approval failed: ${err.message}`, 'error');
 }
 });

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Financial Nodes</p>
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
 <Banknote size={24} className="text-jumia-orange" />
 <h2 className="text-[10px] font-semibold text-jumia-orange uppercase tracking-[0.4em]">Financial Settlement</h2>
 </div>
 <h1 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Payout <span className="text-jumia-orange">Matrix</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Review and authorize premium vendor withdrawal requests and settlements.</p>
 </div>
 <div className="flex items-center gap-6">
 <div className="relative group w-full sm:w-96">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-jumia-orange transition-colors" size={18} />
 <input 
 type="text" 
 placeholder="QUERY VENDOR IDENTITY..." 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-16 pr-6 h-16 bg-surface-container-lowest border border-surface-container-low rounded focus:border-jumia-orange text-[10px] font-semibold uppercase tracking-[0.3em] outline-none placeholder:font-normal placeholder:text-on-surface-variant/50 transition-all shadow-soft"
 />
 </div>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-container-low/30 text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/60 border-b-4 border-surface-container-low">
 <th className="px-10 py-8">Vendor / Node</th>
 <th className="px-10 py-8">Liquidity Magnitude</th>
 <th className="px-10 py-8">Temporal Sync</th>
 <th className="px-10 py-8">Status</th>
 <th className="px-10 py-8 text-right">Settlement</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-surface-container-low">
 {filteredPayouts?.map((payout, idx) => (
 <tr key={payout.id} className="hover:bg-surface-container-low/20 transition-all duration-300 group">
 <td className="px-10 py-10">
 <div className="font-semibold text-on-surface text-lg uppercase tracking-tighter leading-none group-hover:text-jumia-orange transition-colors mb-2">{payout.seller.businessName}</div>
 <div className="text-[10px] text-on-surface-variant/40 font-semibold uppercase tracking-[0.3em] italic">Identity: {payout.id.slice(-8).toUpperCase()}</div>
 </td>
 <td className="px-10 py-10">
 <div className="text-2xl font-semibold text-on-surface tracking-tighter leading-none">
 ₦{Number(payout.amount).toLocaleString()}
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-semibold text-on-surface uppercase tracking-widest">{format(new Date(payout.createdAt), 'dd MMM yyyy').toUpperCase()}</span>
 <span className="text-[9px] text-on-surface-variant/40 font-semibold uppercase tracking-[0.2em] italic">{format(new Date(payout.createdAt), 'HH:mm')} LOG</span>
 </div>
 </td>
 <td className="px-10 py-10">
 <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-semibold uppercase tracking-[0.3em] border-2 shadow-xl ${
 payout.status === 'SUCCESS' || payout.status === 'COMPLETED'
 ? 'bg-success/5 text-success border-success/10' 
 : payout.status === 'FAILED'
 ? 'bg-error/5 text-error border-error/10'
 : payout.status === 'PROCESSING'
 ? 'bg-jumia-orange/5 text-jumia-orange border-jumia-orange/10'
 : 'bg-jumia-orange/5 text-on-surface-variant border-on-surface/10'
 }`}>
 <div className={`w-2 h-2 rounded-full mr-3 ${
 payout.status === 'PENDING' ? 'bg-jumia-orange-variant animate-pulse' : 
 payout.status === 'PROCESSING' ? 'bg-jumia-orange animate-spin border-2 border-t-transparent' :
 (payout.status === 'SUCCESS' || payout.status === 'COMPLETED') ? 'bg-success' : 'bg-error'
 }`} />
 {payout.status}
 </span>
 </td>
 <td className="px-10 py-10 text-right">
 {payout.status === 'PENDING' && (
 <button 
 onClick={() => approvePayout.mutate({ payoutId: payout.id })}
 disabled={approvePayout.isLoading}
 className="h-16 px-10 bg-jumia-orange text-white rounded-2xl text-[10px] font-semibold uppercase tracking-[0.4em] hover:bg-jumia-orange-dark active:scale-95 transition-all shadow-2xl disabled:opacity-30 group/btn"
 >
 {approvePayout.isLoading && (approvePayout as any).variables?.payoutId === payout.id ? (
 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
 ) : (
 <>Authorize <ArrowRight size={16} className="inline ml-2 group-hover/btn:translate-x-1 transition-transform" /></>
 )}
 </button>
 )}
 {payout.bankRef && (
 <div className="inline-flex items-center gap-3 text-[9px] text-on-surface-variant/40 font-semibold uppercase tracking-[0.3em] bg-surface-container-low px-4 py-2 rounded-xl border-2 border-surface-container-low italic" title="Settlement Reference">
 REF: {payout.bankRef.toUpperCase()}
 </div>
 )}
 {(payout.status === 'SUCCESS' || payout.status === 'COMPLETED') && !payout.bankRef && (
 <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center border-2 border-success/10 ml-auto shadow-xl shadow-success/5">
 <ShieldCheck size={24} />
 </div>
 )}
 </td>
 </tr>
 ))}
 {(!isLoading && filteredPayouts?.length === 0) && (
 <tr>
 <td colSpan={5} className="px-10 py-32 text-center">
 <div className="flex flex-col items-center gap-8 max-w-sm mx-auto">
 <div className="w-24 h-24 bg-surface-container-low rounded flex items-center justify-center border border-surface-container-low shadow-inner">
 <Banknote size={48} className="text-on-surface-variant/20" strokeWidth={1} />
 </div>
 <div className="space-y-3">
 <h3 className="text-2xl font-semibold text-on-surface uppercase tracking-tighter">Queue <span className="text-success">Clear</span></h3>
 <p className="text-[10px] text-on-surface-variant/40 font-semibold uppercase tracking-[0.3em] italic leading-relaxed">ALL VENDOR WITHDRAWAL REQUESTS HAVE BEEN SYSTEMICALLY PROCESSED AND LOGGED.</p>
 </div>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 
 <div className="mt-12 bg-jumia-orange text-white rounded p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-96 h-96 bg-jumia-orange/20 rounded-full blur-[150px] -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000" />
 <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
 <div className="flex items-center gap-8">
 <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center border-2 border-white/10">
 <Gavel size={32} className="text-jumia-orange" />
 </div>
 <div>
 <h3 className="text-2xl font-semibold uppercase tracking-tighter mb-2">Protocol <span className="text-jumia-orange">Integrity</span></h3>
 <p className="text-[10px] font-semibold uppercase tracking-[0.2em] italic opacity-40 max-w-2xl leading-loose">
 ALL SETTLEMENT AUTHORIZATIONS ARE IRREVOCABLE AND CRYPTOGRAPHICALLY LOGGED TO THE CORE ADMINISTRATIVE LEDGER.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded border-2 border-white/10 shrink-0">
 <Activity size={20} className="text-jumia-orange animate-pulse" />
 <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">Ledger Active</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
