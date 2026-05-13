'use client';

import React from 'react';
import { 
 ShieldCheck, 
 TrendingUp, 
 BarChart, 
 Users, 
 ArrowUpRight, 
 DollarSign, 
 Activity,
 Loader2,
 Calendar,
 AlertCircle,
 Zap,
 Cpu,
 Binary,
 Layers,
 ArrowRight
} from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAnalyticsPage() {
 const { data: metrics, isLoading: metricsLoading } = api.ops.getGlobalMetrics.useQuery();
 const { data: timeSeries, isLoading: tsLoading } = api.ops.getTimeSeries.useQuery();

 if (metricsLoading || tsLoading) {
 return (
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-12 animate-pulse bg-background min-h-screen">
 <div className="flex justify-between items-end mb-16">
 <div className="space-y-4">
 <div className="h-4 w-48 bg-surface-container-low rounded-full" />
 <div className="h-16 w-96 bg-surface-container-low rounded-2xl" />
 </div>
 <div className="h-12 w-48 bg-surface-container-low rounded-xl" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className="h-40 bg-surface-container-low rounded-[32px] border-4 border-surface-container-lowest" />
 ))}
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
 <div className="h-[400px] bg-surface-container-low rounded-[48px] border-4 border-surface-container-lowest" />
 <div className="h-[400px] bg-surface-container-low rounded-[48px] border-4 border-surface-container-lowest" />
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-primary-container/20 backdrop-blur-xl rounded-2xl border border-primary-container/30 shadow-inner">
 <ShieldCheck size={24} className="text-primary-container" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-container italic">Global Distribution Protocol & Telemetry</span>
 </div>
 <h1 className="text-5xl md:text-7xl font-black text-on-surface uppercase tracking-tighter leading-[0.85]">
 Command <br />
 <span className="text-primary-container italic">Nexus.</span>
 </h1>
 </div>

 <div className="flex flex-col items-end gap-3 animate-in slide-in-from-right-8 duration-1000">
 <div className="flex items-center gap-4 px-6 py-3 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl shadow-soft">
 <div className="flex h-3 w-3 relative">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/60">Live Signal: Stable</span>
 </div>
 <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] italic">System Uptime: 99.998%</p>
 </div>
 </div>

 {/* KPI Matrix */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 <div className="bg-on-surface text-white p-8 rounded-[40px] border-4 border-surface-container-low shadow-3xl group relative overflow-hidden transition-all duration-700 hover:-translate-y-2">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
 <div className="relative z-10">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3 text-white/40">
 <div className="p-2 bg-white/5 rounded-xl border border-white/10">
 <Activity size={20} />
 </div>
 <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Network Load</h3>
 </div>
 </div>
 <p className="text-5xl font-black tracking-tighter italic mb-3">{metrics?.activeSessions || 0}</p>
 <div className="flex items-center gap-2 text-primary-container text-[10px] font-black uppercase tracking-widest bg-primary-container/10 w-fit px-3 py-1.5 rounded-full border border-primary-container/20">
 <TrendingUp size={12} /> Live Sessions
 </div>
 </div>
 </div>

 {[
 { label: '30D Capital Flow', value: `₦ ${(metrics?.totalGmv30d || 0).toLocaleString()}`, icon: DollarSign, sub: 'Gross Matrix Value', trend: '+12.4%' },
 { label: 'Merchant Density', value: metrics?.activeSellers || 0, icon: Users, sub: 'Verified Entities', trend: '+8.1%' },
 { label: 'Conflict Registry', value: metrics?.openDisputes || 0, icon: AlertCircle, sub: 'Active Arbitrations', trend: '-2.4%', color: 'text-error' }
 ].map((kpi, i) => (
 <div key={i} className="bg-surface-container-lowest p-8 rounded-[40px] border-4 border-surface-container-low shadow-soft group transition-all duration-700 hover:border-primary-container/20 hover:translate-x-2">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-3 bg-surface-container-low rounded-2xl text-on-surface-variant group-hover:text-primary-container group-hover:bg-primary-container/5 transition-all duration-700 shadow-inner">
 <kpi.icon size={22} />
 </div>
 <div>
 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">{kpi.label}</h3>
 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface/20 italic">{kpi.sub}</p>
 </div>
 </div>
 <p className="text-3xl md:text-4xl font-black text-on-surface tracking-tighter uppercase mb-4 leading-none">{kpi.value}</p>
 <div className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${kpi.color || 'text-green-500 opacity-60'}`}>
 Telemetry: {kpi.trend}
 </div>
 </div>
 ))}
 </div>

 {/* Analytics Matrix Tables */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[56px] p-12 shadow-soft space-y-10 group relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />
 
 <div className="relative z-10 flex items-center justify-between pb-8 border-b-4 border-surface-container-low">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center border-2 border-primary-container/20 shadow-inner">
 <DollarSign size={28} />
 </div>
 <div>
 <h3 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">Capital Matrix</h3>
 <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Daily Revenue Liquidity (30D)</p>
 </div>
 </div>
 <Calendar size={20} className="text-on-surface-variant/20" />
 </div>

 <div className="relative z-10 space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
 {timeSeries?.gmv.length ? (
 timeSeries.gmv.map((point: any, i: number) => (
 <div key={i} className="flex justify-between items-center p-6 bg-surface-container-low/40 border-2 border-surface-container-lowest rounded-3xl group/row hover:translate-x-4 transition-all duration-500">
 <div className="flex items-center gap-4">
 <div className="w-2 h-2 rounded-full bg-primary-container/30 group-hover/row:scale-150 transition-all duration-500" />
 <span className="text-xs font-black text-on-surface/60 uppercase tracking-widest">{point.day}</span>
 </div>
 <span className="text-sm font-black text-primary-container tracking-tight italic">₦ {point.value.toLocaleString()}</span>
 </div>
 ))
 ) : (
 <div className="py-20 text-center space-y-4 opacity-20">
 <Binary size={48} className="mx-auto" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No revenue telemetry detected</p>
 </div>
 )}
 </div>
 </div>

 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[56px] p-12 shadow-soft space-y-10 group relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />
 
 <div className="relative z-10 flex items-center justify-between pb-8 border-b-4 border-surface-container-low">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center border-2 border-primary-container/20 shadow-inner">
 <Users size={28} />
 </div>
 <div>
 <h3 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">Entity Growth</h3>
 <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">New Account Registrations Matrix</p>
 </div>
 </div>
 <Zap size={20} className="text-on-surface-variant/20" />
 </div>

 <div className="relative z-10 space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
 {timeSeries?.users.length ? (
 timeSeries.users.map((point: any, i: number) => (
 <div key={i} className="flex justify-between items-center p-6 bg-surface-container-low/40 border-2 border-surface-container-lowest rounded-3xl group/row hover:translate-x-4 transition-all duration-500">
 <span className="text-xs font-black text-on-surface/60 uppercase tracking-widest">{point.day}</span>
 <div className="flex items-center gap-6">
 <div className="w-32 h-2 bg-surface-container-lowest rounded-full overflow-hidden border border-surface-container-low">
 <div className="h-full bg-primary-container transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(246,139,30,0.4)]" style={{ width: `${Math.min(point.value * 5, 100)}%` }} />
 </div>
 <span className="text-xs font-black text-on-surface tracking-widest">{point.value}</span>
 </div>
 </div>
 ))
 ) : (
 <div className="py-20 text-center space-y-4 opacity-20">
 <Layers size={48} className="mx-auto" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Growth metrics synchronized</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
