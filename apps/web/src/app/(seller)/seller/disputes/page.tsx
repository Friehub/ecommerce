'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { 
 AlertCircle, 
 ChevronRight, 
 MessageSquare, 
 Clock, 
 CheckCircle2, 
 XCircle,
 ShieldAlert,
 SearchCode,
 Scale,
 ArrowUpRight,
 Zap,
 Gavel,
 History,
 ShieldCheck,
 Binary,
 Globe,
 Cpu,
 MessageSquareMore
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SellerDisputesPage() {
 const { data: disputes, isLoading } = api.dispute.listMyDisputes.useQuery();

 if (isLoading) {
 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="space-y-6">
 <Skeleton className="h-16 w-96 rounded" />
 <Skeleton className="h-6 w-64 rounded-xl" />
 </div>
 <Skeleton className="h-20 w-80 rounded" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
 {[...Array(3)].map((_, i) => (
 <Skeleton key={i} className="h-52 w-full rounded" />
 ))}
 </div>
 <Skeleton className="h-[700px] w-full rounded-[64px]" />
 </div>
 );
 }

 const kpis = [
 { 
 label: 'Active Audits', 
 val: `${disputes?.filter(d => d.status === 'OPEN').length || 0} Open Cases`, 
 icon: Scale, 
 color: 'text-jumia-orange',
 bg: 'bg-jumia-orange/10',
 trend: 'ACTIVE MEDIATION'
 },
 { 
 label: 'Velocity', 
 val: '48h Resolution', 
 icon: Zap, 
 color: 'text-success',
 bg: 'bg-success-container/10',
 trend: 'OPTIMAL SPEED'
 },
 { 
 label: 'Integrity Score', 
 val: 'Elite Standing', 
 icon: ShieldCheck, 
 color: 'text-secondary',
 bg: 'bg-secondary-container/10',
 trend: 'TRUST VERIFIED'
 }
 ];

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <Gavel size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Neural Mediation Nexus & Dispute Resolution Center</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Resolution <br />
 <span className="text-jumia-orange italic">Center.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Professional Consumer Protection & Automated Mediation Control</p>
 </div>
 <div className="relative group w-full md:w-[450px] animate-in slide-in-from-right-8 duration-1000">
 <div className="absolute inset-0 bg-jumia-orange/5 rounded blur-2xl group-focus-within:bg-jumia-orange/10 transition-all duration-700" />
 <div className="relative">
 <SearchCode className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-focus-within:opacity-100 group-focus-within:text-jumia-orange transition-all duration-500" size={24} />
 <input 
 type="text" 
 placeholder="LOCATE CASE IDENTITY OR SECTOR..."
 className="w-full pl-20 pr-10 py-7 bg-surface-container-low/50 backdrop-blur-xl border border-surface-container-lowest rounded focus:outline-none focus:border-jumia-orange/30 focus:ring-[24px] focus:ring-primary-container/5 text-[12px] font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50  transition-all shadow-soft italic uppercase"
 />
 </div>
 </div>
 </div>

 {/* KPI Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
 {kpis.map((kpi, idx) => (
 <div key={kpi.label} className="bg-surface-container-lowest p-10 rounded border border-surface-container-low flex flex-col justify-between h-[220px] hover:translate-y-[-12px] transition-all duration-700 shadow-soft group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex justify-between items-start">
 <div className={`w-14 h-14 rounded bg-surface-container-low flex items-center justify-center border-2 border-outline-variant/5 group-hover:scale-110 group-hover:border-jumia-orange/20 transition-all duration-1000 shadow-inner`}>
 <kpi.icon className={kpi.color} size={28} strokeWidth={2.5} />
 </div>
 <span className={`text-[9px] font-semibold px-5 py-2 rounded-full uppercase tracking-widest border-2 bg-surface-container-low text-on-surface-variant/40 border-outline-variant/5 italic shadow-sm`}>
 {kpi.trend}
 </span>
 </div>
 <div>
 <p className="text-on-surface-variant/40 text-[9px] font-semibold uppercase  mb-3 italic">{kpi.label}</p>
 <h3 className={`text-3xl font-semibold text-on-surface tracking-tighter leading-none`}>{kpi.val}</h3>
 </div>
 </div>
 ))}
 </div>

 {/* Cases Matrix */}
 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="p-12 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 bg-jumia-orange/5 rounded-2xl flex items-center justify-center border-2 border-on-surface/10">
 <Binary size={24} className="text-on-surface-variant" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-on-surface uppercase  leading-none mb-2">Dispute Matrix</h3>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  italic">Active Operational Mediation Ledger</p>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-surface-container-low/50 px-8 py-3 rounded-full border-2 border-surface-container-lowest shadow-sm">
 <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
 <span className="text-[9px] font-semibold uppercase text-on-surface-variant  italic opacity-60">System Synchronized</span>
 </div>
 </div>

 {disputes && disputes.length > 0 ? (
 <div className="divide-y-4 divide-surface-container-low">
 {disputes.map((dispute, idx) => (
 <Link 
 key={dispute.id} 
 href={`/seller/disputes/${dispute.id}`}
 className="p-12 flex items-center justify-between hover:bg-surface-container-low/30 transition-all duration-700 group animate-in fade-in"
 style={{ animationDelay: `${idx * 50}ms` }}
 >
 <div className="flex items-center gap-10">
 <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center transition-all duration-1000 group-hover:scale-105 border border-surface-container-low shadow-soft relative overflow-hidden ${
 dispute.status === 'OPEN' 
 ? 'bg-jumia-orange/10 text-jumia-orange' 
 : dispute.status === 'RESOLVED'
 ? 'bg-success-container/10 text-success'
 : 'bg-surface-container-low text-on-surface-variant/40'
 }`}>
 <MessageSquareMore size={36} strokeWidth={1.5} className="relative z-10" />
 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
 </div>
 <div>
 <div className="flex items-center gap-6 mb-4">
 <span className="font-semibold text-on-surface uppercase tracking-tighter text-3xl group-hover:text-jumia-orange transition-colors duration-500 leading-none">#{dispute.order.id.slice(-12).toUpperCase()}</span>
 <span className={`text-[9px] px-6 py-2 rounded-full font-semibold uppercase  border-2 shadow-sm italic transition-all duration-700 ${
 dispute.status === 'OPEN' 
 ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20' 
 : dispute.status === 'RESOLVED'
 ? 'bg-success-container/10 text-success border-success/20'
 : 'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full mr-3 inline-block ${dispute.status === 'OPEN' ? 'bg-jumia-orange animate-pulse' : dispute.status === 'RESOLVED' ? 'bg-success' : 'bg-current'}`} />
 {dispute.status.replace('_', ' ')}
 </span>
 </div>
 <p className="text-on-surface-variant text-base font-semibold uppercase tracking-tight mb-5 opacity-60 italic group-hover:opacity-100 transition-opacity duration-700">"{dispute.reason}"</p>
 <div className="flex items-center gap-6 text-[10px] text-on-surface-variant/30 font-semibold uppercase  italic">
 <div className="flex items-center gap-3">
 <Clock size={16} className="opacity-40" />
 SYNCHRONIZED • {format(new Date(dispute.updatedAt), 'MMM dd, HH:mm')}
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-jumia-orange-variant/10" />
 <div className="flex items-center gap-3">
 <Globe size={16} className="opacity-40" />
 GLOBAL SECTOR ALPHA
 </div>
 </div>
 </div>
 </div>
 <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center text-on-surface-variant group-hover:bg-jumia-orange group-hover:text-white transition-all duration-700 transform group-hover:rotate-45 group-hover:translate-x-4 shadow-soft border border-surface-container-lowest">
 <ArrowUpRight size={32} />
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <div className="py-48 text-center px-12 opacity-40 animate-in zoom-in-95 duration-1000">
 <div className="w-32 h-32 bg-surface-container-low rounded flex items-center justify-center mx-auto mb-12 border border-surface-container-lowest text-on-surface-variant shadow-inner group">
 <ShieldAlert size={64} strokeWidth={1} className="opacity-10 group-hover:scale-110 transition-transform duration-1000" />
 </div>
 <h3 className="font-semibold text-3xl text-on-surface uppercase tracking-tighter mb-5 leading-none">Operational Zero</h3>
 <p className="text-on-surface-variant text-[11px] font-semibold uppercase  max-w-sm mx-auto italic leading-relaxed">
 No active disputes detected in this operational sector. Consistently high service authority standards verified.
 </p>
 </div>
 )}
 </div>
 </div>
 );
}
