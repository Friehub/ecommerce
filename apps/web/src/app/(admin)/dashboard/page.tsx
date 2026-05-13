'use client';

import { api } from '@/trpc/react';
import { 
 ShieldCheck, 
 Users, 
 AlertTriangle, 
 ArrowRight, 
 CheckCircle, 
 Activity, 
 DollarSign,
 Zap,
 Fingerprint,
 Briefcase,
 History,
 Target,
 Box,
 Layers,
 Search,
 MoreVertical,
 Cpu,
 Binary
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
 const { toast } = useToast();
 const utils = api.useUtils();
 const { data: metrics, isLoading: metricsLoading } = api.ops.getGlobalMetrics.useQuery();
 const { data: pendingSellers, isLoading: kycLoading } = api.admin.getPendingSellers.useQuery();
 const { data: disputes, isLoading: disputesLoading } = api.admin.getDisputeQueue.useQuery();

 const approveSellerMutation = api.admin.approveSeller.useMutation({
 onSuccess: () => {
 utils.admin.getPendingSellers.invalidate();
 toast({
 title: 'ENTITY AUTHORIZED',
 description: 'Seller credentials verified and account activated successfully.',
 });
 },
 onError: (err) => {
 toast({
 title: 'AUTHORIZATION FAILED',
 description: err.message || 'System failed to finalize seller approval.',
 variant: 'destructive',
 });
 }
 });

 const isLoading = metricsLoading || kycLoading || disputesLoading;

 if (isLoading) {
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
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10">
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
 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-container italic">Operations Command Hub & Platform Moderation</span>
 </div>
 <h1 className="text-5xl md:text-7xl font-black text-on-surface uppercase tracking-tighter leading-[0.85]">
 Ops <br />
 <span className="text-primary-container italic">Hub.</span>
 </h1>
 </div>

 <div className="flex flex-col items-end gap-3 animate-in slide-in-from-right-8 duration-1000">
 <div className="flex items-center gap-4 px-6 py-3 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl shadow-soft">
 <div className="flex h-3 w-3 relative">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/60">System Heartbeat: Operational</span>
 </div>
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
 <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Telemetry</h3>
 </div>
 </div>
 <p className="text-5xl font-black tracking-tighter italic mb-3">{metrics?.activeSessions || 0}</p>
 <div className="flex items-center gap-2 text-primary-container text-[10px] font-black uppercase tracking-widest bg-primary-container/10 w-fit px-3 py-1.5 rounded-full border border-primary-container/20">
 <Zap size={12} className="animate-pulse" /> Live Load
 </div>
 </div>
 </div>

 {[
 { label: '30D GMV', value: `₦ ${(metrics?.totalGmv30d || 0).toLocaleString()}`, icon: DollarSign, sub: 'Gross Matrix Flow' },
 { label: 'Active Sellers', value: metrics?.activeSellers || 0, icon: Users, sub: 'Verified Partners' },
 { label: 'Conflict Load', value: metrics?.openDisputes || 0, icon: AlertTriangle, sub: 'Active Disputes', color: 'text-error', href: '/admin/disputes' }
 ].map((kpi, i) => {
 const Content = (
 <div className="h-full bg-surface-container-lowest p-8 rounded-[40px] border-4 border-surface-container-low shadow-soft group transition-all duration-700 hover:border-primary-container/20 hover:translate-x-2">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-surface-container-low rounded-2xl text-on-surface-variant group-hover:text-primary-container group-hover:bg-primary-container/5 transition-all duration-700 shadow-inner">
 <kpi.icon size={22} />
 </div>
 <div>
 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">{kpi.label}</h3>
 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface/20 italic">{kpi.sub}</p>
 </div>
 </div>
 {kpi.href && <ArrowRight size={16} className="text-on-surface-variant/20 group-hover:text-primary-container group-hover:translate-x-2 transition-all duration-700" />}
 </div>
 <p className={`text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none ${kpi.color || 'text-on-surface'}`}>{kpi.value}</p>
 </div>
 );

 return kpi.href ? (
 <Link key={i} href={kpi.href} className="block">
 {Content}
 </Link>
 ) : (
 <div key={i}>{Content}</div>
 );
 })}
 </div>

 {/* Moderation Matrix Tables */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[56px] p-12 shadow-soft space-y-10 group relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />
 
 <div className="relative z-10 flex items-center justify-between pb-8 border-b-4 border-surface-container-low">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center border-2 border-primary-container/20 shadow-inner">
 <Fingerprint size={28} />
 </div>
 <div>
 <h3 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">KYC Backlog</h3>
 <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Pending Merchant Authorization Queue</p>
 </div>
 </div>
 <div className="px-4 py-2 bg-primary-container text-white rounded-full text-[10px] font-black italic shadow-3xl">
 {pendingSellers?.length || 0} UNITS
 </div>
 </div>

 <div className="relative z-10 space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
 {pendingSellers?.map(seller => (
 <div key={seller.id} className="flex justify-between items-center p-6 bg-surface-container-low/40 border-2 border-surface-container-lowest rounded-3xl group/row hover:translate-x-4 transition-all duration-500">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant border border-surface-container-lowest group-hover/row:bg-primary-container/10 group-hover/row:text-primary-container transition-all duration-700">
 <Briefcase size={18} />
 </div>
 <div>
 <h4 className="text-sm font-black text-on-surface uppercase tracking-tight leading-none mb-1 group-hover/row:translate-x-2 transition-transform duration-700">{seller.businessName}</h4>
 <p className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest italic">{seller.user.email}</p>
 </div>
 </div>
 <button
 onClick={() => approveSellerMutation.mutate({ sellerId: seller.id })}
 disabled={approveSellerMutation.isPending}
 className="bg-green-500/5 text-green-500 hover:bg-green-500 hover:text-white border-4 border-green-500/10 p-3 rounded-xl duration-500 transition-all cursor-pointer shadow-soft group/btn disabled:opacity-50"
 >
 <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
 </button>
 </div>
 ))}
 {(!pendingSellers || pendingSellers.length === 0) && (
 <div className="py-20 text-center space-y-4 opacity-20">
 <CheckCircle size={48} className="mx-auto" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Backlog reconciled</p>
 </div>
 )}
 </div>
 </div>

 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[56px] p-12 shadow-soft space-y-10 group relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />
 
 <div className="relative z-10 flex items-center justify-between pb-8 border-b-4 border-surface-container-low">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-error/10 text-error rounded-2xl flex items-center justify-center border-2 border-error/20 shadow-inner">
 <AlertTriangle size={28} />
 </div>
 <div>
 <h3 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">Dispute Matrix</h3>
 <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Active Conflict Arbitration Registry</p>
 </div>
 </div>
 <div className="px-4 py-2 bg-error text-white rounded-full text-[10px] font-black italic shadow-3xl">
 {disputes?.length || 0} UNITS
 </div>
 </div>

 <div className="relative z-10 space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
 {disputes?.map(dispute => (
 <div key={dispute.id} className="p-6 bg-surface-container-low/40 border-2 border-surface-container-lowest rounded-3xl group/row hover:translate-x-4 transition-all duration-500 relative">
 <div className="flex items-start justify-between gap-4">
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <span className="bg-error/10 text-error border-2 border-error/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic">
 {dispute.status}
 </span>
 <span className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.3em] italic">
 Ord #{dispute.orderId.slice(-8).toUpperCase()}
 </span>
 </div>
 <h4 className="text-sm font-black text-on-surface uppercase tracking-tighter italic leading-none group-hover/row:translate-x-2 transition-transform duration-700">{dispute.reason}</h4>
 </div>
 <Link
 href={`/disputes/${dispute.id}`}
 className="p-3 bg-surface-container-low text-on-surface-variant/40 hover:text-primary-container hover:bg-primary-container/10 border-4 border-surface-container-lowest rounded-xl transition-all duration-500 shadow-soft"
 >
 <ArrowRight size={18} />
 </Link>
 </div>
 </div>
 ))}
 {(!disputes || disputes.length === 0) && (
 <div className="py-20 text-center space-y-4 opacity-20">
 <Layers size={48} className="mx-auto" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Conflict Registry Optimized</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
