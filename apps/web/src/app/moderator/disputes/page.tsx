'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { AlertCircle, ChevronRight, MessageSquare, Clock, CheckCircle2, XCircle, ShieldAlert, Scale, Gavel, Activity, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ModeratorDisputesDashboard() {
 const utils = api.useUtils();
 const { data: disputes, isLoading } = api.dispute.listAllDisputes.useQuery();
 const resolveMutation = api.dispute.resolveDispute.useMutation({
 onSuccess: () => {
 utils.dispute.listAllDisputes.invalidate();
 setSelectedDispute(null);
 }
 });

 const [selectedDispute, setSelectedDispute] = useState<any>(null);
 const [resolution, setResolution] = useState('');
 const [refundAmount, setRefundAmount] = useState(0);

 const handleResolve = (status: 'RESOLVED' | 'REJECTED') => {
 if (!selectedDispute || !resolution) return;
 resolveMutation.mutate({
 disputeId: selectedDispute.id,
 resolution,
 status,
 refundAmount: refundAmount || 0
 });
 };

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <Gavel size={24} className="text-primary-container" />
 <h2 className="text-[10px] font-black text-primary-container uppercase tracking-[0.4em]">Arbitration Terminal</h2>
 </div>
 <h1 className="text-4xl font-black text-on-surface uppercase tracking-tighter leading-none">Conflict <span className="text-primary-container">Resolution</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Tier-3 Moderator override and systemic settlement interface.</p>
 </div>
 <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">
 <span className="flex items-center gap-2 px-4 py-2 bg-success/5 text-success rounded-xl border-2 border-success/10 shadow-xl shadow-success/5 animate-pulse">
 <Activity size={14} /> Systems Online
 </span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 <div className="lg:col-span-8 bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="p-8 border-b-4 border-surface-container-low bg-surface-container-low/30 flex items-center justify-between">
 <h2 className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em] italic">Pending Resolution Queue</h2>
 </div>

 {isLoading ? (
 <div className="p-10 space-y-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-24 bg-surface-container-low/30 border-2 border-surface-container-low rounded-[32px] animate-pulse" />
 ))}
 </div>
 ) : disputes && disputes.length > 0 ? (
 <div className="divide-y-2 divide-surface-container-low">
 {disputes.map((dispute: any) => (
 <div 
 key={dispute.id} 
 onClick={() => setSelectedDispute(dispute)}
 className={`p-8 flex items-center justify-between hover:bg-surface-container-low/20 cursor-pointer transition-all duration-500 group ${
 selectedDispute?.id === dispute.id ? 'bg-primary-container/5 border-l-[12px] border-primary-container' : 'border-l-[12px] border-transparent'
 }`}
 >
 <div className="flex items-center gap-6">
 <div className={`w-14 h-14 rounded-[20px] border-2 flex items-center justify-center transition-all ${
 dispute.status === 'OPEN' 
 ? 'bg-error/5 text-error border-error/10' 
 : 'bg-success/5 text-success border-success/10'
 }`}>
 <MessageSquare size={24} />
 </div>
 <div>
 <div className="flex items-center gap-4 mb-2">
 <span className="font-black text-on-surface text-lg uppercase tracking-tighter leading-none group-hover:text-primary-container transition-colors">Case #{dispute.id.slice(-8).toUpperCase()}</span>
 <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 ${
 dispute.status === 'OPEN' 
 ? 'bg-error/5 text-error border-error/10' 
 : 'bg-success/5 text-success border-success/10'
 }`}>
 {dispute.status.replace('_', ' ')}
 </span>
 </div>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest line-clamp-1 italic">{dispute.reason}</p>
 <p className="text-[9px] font-black text-on-surface-variant/20 mt-3 uppercase tracking-[0.2em]">
 Origin: {dispute.buyer?.email.toUpperCase()}
 </p>
 </div>
 </div>
 <ChevronRight size={20} className={`transition-all duration-500 ${selectedDispute?.id === dispute.id ? 'text-primary-container translate-x-2' : 'text-on-surface-variant/20'}`} />
 </div>
 ))}
 </div>
 ) : (
 <div className="p-24 text-center">
 <ShieldCheck className="mx-auto text-surface-container-low mb-10" size={80} />
 <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter mb-4">Queue <span className="text-success">Clear</span></h3>
 <p className="text-on-surface-variant/40 text-[10px] max-w-sm mx-auto font-black uppercase tracking-[0.3em] leading-relaxed italic">
 NO PENDING DISPUTES REQUIRE MODERATOR INTERVENTION. SYSTEMIC CONFLICT LEVELS ARE NOMINAL.
 </p>
 </div>
 )}
 </div>

 <div className="lg:col-span-4 space-y-8">
 <div className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft p-10 animate-in fade-in slide-in-from-right-8 duration-700">
 <h2 className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em] mb-10 border-b-2 border-surface-container-low pb-6 italic">
 Resolution Protocol
 </h2>
 {selectedDispute ? (
 <div className="space-y-10">
 <div className="group">
 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 block mb-3 italic">Conflict Root</span>
 <p className="text-[11px] font-black text-on-surface uppercase tracking-widest bg-surface-container-low/30 border-2 border-surface-container-low p-6 rounded-[24px] leading-relaxed italic">
 {selectedDispute.reason}
 </p>
 </div>

 <div className="space-y-4">
 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 block ml-2 italic">Official Ruling</label>
 <textarea
 placeholder="ENTER SETTLEMENT JUSTIFICATION..."
 rows={5}
 value={resolution}
 onChange={(e) => setResolution(e.target.value)}
 className="w-full p-6 bg-surface-container-low/30 border-2 border-surface-container-low rounded-[32px] focus:border-primary-container text-[11px] font-black text-on-surface uppercase tracking-widest placeholder:font-normal placeholder:text-on-surface-variant/50 transition-all outline-none"
 />
 </div>

 <div className="space-y-4">
 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 block ml-2 italic">Settlement Amount (₦)</label>
 <input
 type="number"
 placeholder="0.00"
 value={refundAmount}
 onChange={(e) => setRefundAmount(Number(e.target.value))}
 className="w-full h-16 px-6 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl focus:border-primary-container text-[11px] font-black text-on-surface uppercase tracking-[0.5em] transition-all outline-none"
 />
 </div>

 <div className="grid grid-cols-1 gap-4 pt-4">
 <button
 onClick={() => handleResolve('RESOLVED')}
 disabled={!resolution || resolveMutation.isPending}
 className="h-20 bg-success text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-success/20 hover:scale-105 active:scale-95 flex items-center gap-4 justify-center disabled:opacity-30"
 >
 <CheckCircle2 size={20} /> Authorize Settlement
 </button>
 <button
 onClick={() => handleResolve('REJECTED')}
 disabled={!resolution || resolveMutation.isPending}
 className="h-20 bg-error text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-error/20 hover:scale-105 active:scale-95 flex items-center gap-4 justify-center disabled:opacity-30"
 >
 <XCircle size={20} /> Terminate Claim
 </button>
 </div>
 </div>
 ) : (
 <div className="py-24 text-center border-2 border-dashed border-surface-container-low rounded-[32px]">
 <Scale className="mx-auto text-surface-container-low mb-6 opacity-40" size={48} />
 <p className="text-[10px] font-black text-on-surface-variant/20 uppercase tracking-[0.4em] italic px-6 leading-relaxed">
 SELECT A TARGET DISPUTE NODE FROM THE QUEUE TO INITIALIZE RESOLUTION SEQUENCE.
 </p>
 </div>
 )}
 </div>
 
 <div className="bg-on-surface text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/20 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
 <h3 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Moderator <span className="text-primary-container">Integrity</span></h3>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed italic relative z-10 opacity-60">
 ALL RULINGS ARE IRREVOCABLE AND LOGGED WITHIN THE SYSTEMIC AUDIT TRAIL. ENSURE PROTOCOL COMPLIANCE.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
