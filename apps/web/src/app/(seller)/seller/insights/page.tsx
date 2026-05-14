'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { 
 TrendingUp, 
 Award, 
 BarChart3, 
 Users, 
 DollarSign, 
 Calendar, 
 Flame, 
 FlameKindling, 
 Loader2, 
 Package, 
 AlertTriangle,
 CheckCircle2,
 Percent,
 LineChart,
 ShieldCheck,
 Zap,
 ArrowUpRight,
 TrendingDown,
 Sparkles,
 SearchCode,
 Box,
 Binary
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function SellerInsightsPage() {
 const { data: metrics, isLoading } = api.seller.getDashboardMetrics.useQuery();

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
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
 {[...Array(5)].map((_, i) => (
 <Skeleton key={i} className="h-44 w-full rounded" />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 <div className="lg:col-span-7">
 <Skeleton className="h-[600px] w-full rounded-[64px]" />
 </div>
 <div className="lg:col-span-5">
 <Skeleton className="h-[600px] w-full rounded-[64px]" />
 </div>
 </div>
 </div>
 );
 }

 const gmv = metrics?.gmv || 0;
 const netRevenue = metrics?.netRevenue || 0;
 const pendingOrders = metrics?.pendingOrders || 0;
 const deliveredOrders = metrics?.deliveredOrders || 0;
 const totalOrders = pendingOrders + deliveredOrders;
 const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

 const kpis = [
 { 
 label: 'Gross Volume', 
 val: `₦${gmv.toLocaleString()}`, 
 icon: DollarSign, 
 color: 'text-jumia-orange',
 bg: 'bg-jumia-orange/10',
 trend: '+12%',
 isPositive: true
 },
 { 
 label: 'Net Revenue', 
 val: `₦${netRevenue.toLocaleString()}`, 
 icon: TrendingUp, 
 color: 'text-success',
 bg: 'bg-success-container/10',
 trend: '+8%',
 isPositive: true
 },
 { 
 label: 'Performance', 
 val: (metrics?.performanceScore || 5.0).toFixed(1), 
 icon: Award, 
 color: 'text-secondary',
 bg: 'bg-secondary-container/10',
 trend: 'ELITE',
 isPositive: true
 },
 { 
 label: 'Total Orders', 
 val: totalOrders.toString(), 
 icon: Package, 
 color: 'text-on-surface',
 bg: 'bg-surface-container-low',
 trend: `${pendingOrders} PENDING`,
 isPositive: false
 },
 { 
 label: 'Conversions', 
 val: `${conversionRate.toFixed(1)}%`, 
 icon: Zap, 
 color: 'text-error',
 bg: 'bg-error-container/10',
 trend: 'OPTIMAL',
 isPositive: true
 },
 ];

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <Binary size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-jumia-orange italic">Neural Market Analysis Nexus</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Market <br />
 <span className="text-jumia-orange italic">Intelligence.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase tracking-[0.4em] mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Real-time Advanced Analytics • Multi-Sector Pulse Synchronization</p>
 </div>
 <div className="flex items-center gap-8 bg-surface-container-low/30 backdrop-blur-xl p-6 rounded border border-surface-container-lowest shadow-soft animate-in slide-in-from-right-8 duration-1000">
 <Calendar className="text-jumia-orange opacity-40" size={20} />
 <div className="text-right">
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-1 italic">Active Intelligence Cycle</p>
 <p className="text-xs font-semibold text-on-surface uppercase tracking-[0.2em] italic">{format(new Date(), 'MMMM yyyy')}</p>
 </div>
 </div>
 </div>

 {/* KPI Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
 {kpis.map((kpi, idx) => (
 <div key={kpi.label} className="bg-surface-container-lowest p-10 rounded-[48px] border border-surface-container-low flex flex-col justify-between h-[220px] hover:translate-y-[-12px] transition-all duration-700 shadow-soft group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex justify-between items-start">
 <div className={`w-14 h-14 rounded bg-surface-container-low flex items-center justify-center border-2 border-outline-variant/5 group-hover:scale-110 group-hover:border-jumia-orange/20 transition-all duration-1000 shadow-inner`}>
 <kpi.icon className={kpi.color} size={28} strokeWidth={2.5} />
 </div>
 <span className={`text-[9px] font-semibold px-5 py-2 rounded-full uppercase tracking-widest border-2 italic shadow-sm ${kpi.isPositive ? 'bg-success-container/10 text-success border-success/20' : 'bg-surface-container-low text-on-surface-variant/40 border-outline-variant/10'}`}>
 {kpi.trend}
 </span>
 </div>
 <div>
 <p className="text-on-surface-variant/40 text-[9px] font-semibold uppercase tracking-[0.4em] mb-3 italic">{kpi.label}</p>
 <h3 className="text-3xl font-semibold text-on-surface tracking-tighter leading-none">{kpi.val}</h3>
 </div>
 </div>
 ))}
 </div>

 {/* Deep Insights */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 {/* Vitality Meters */}
 <div className="lg:col-span-7 bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft p-14 space-y-16 animate-in fade-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 bg-jumia-orange/10 text-jumia-orange rounded-2xl flex items-center justify-center border-2 border-jumia-orange/20 shadow-inner">
 <FlameKindling size={24} />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-on-surface uppercase tracking-[0.4em] leading-none mb-2">Operations Vitality</h3>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em] italic">Operational Efficiency Notifications</p>
 </div>
 </div>

 <div className="space-y-16">
 {[
 { label: 'Fulfillment Velocity', val: `${conversionRate.toFixed(1)}%`, progress: conversionRate, icon: Zap, color: 'bg-jumia-orange' },
 { label: 'Inventory Elasticity', val: metrics?.lowStockCount === 0 ? 'OPTIMAL' : `${metrics?.lowStockCount} CRITICAL`, progress: metrics?.lowStockCount === 0 ? 100 : 40, icon: Box, color: 'bg-secondary' },
 { label: 'Merchant Authority', val: `${((metrics?.performanceScore || 5.0) * 20).toFixed(0)}%`, progress: (metrics?.performanceScore || 5.0) * 20, icon: ShieldCheck, color: 'bg-success' },
 ].map((item, idx) => (
 <div key={idx} className="space-y-6 group">
 <div className="flex justify-between items-end px-4">
 <div className="flex items-center gap-4">
 <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center border-2 border-outline-variant/5">
 <item.icon size={16} className="text-on-surface-variant opacity-40 group-hover:opacity-100 group-hover:text-jumia-orange transition-all duration-500" />
 </div>
 <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-[0.3em] italic">{item.label}</span>
 </div>
 <span className="text-2xl font-semibold text-on-surface tracking-tighter leading-none">{item.val}</span>
 </div>
 <div className="h-4 bg-surface-container-low rounded-full overflow-hidden p-1 shadow-inner relative">
 <div className={`${item.color} h-full rounded-full shadow-2xl transition-all duration-1000 ease-out relative overflow-hidden`} style={{ width: `${item.progress}%` }}>
 <div className="absolute inset-0 bg-white/20 animate-pulse" />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Intelligence Alerts */}
 <div className="lg:col-span-5 bg-jumia-orange rounded-[64px] shadow-2xl p-14 flex flex-col justify-between border border-surface-container-low animate-in fade-in slide-in-from-right-8 duration-1000 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-jumia-orange/10 rounded-full blur-[100px] group-hover:bg-jumia-orange-dark/20 transition-all duration-1000" />
 <div className="relative z-10">
 <div className="flex items-center gap-6 mb-16">
 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border-2 border-white/10 backdrop-blur-xl">
 <LineChart size={24} className="text-jumia-orange" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-white uppercase tracking-[0.4em] leading-none mb-2">Asset Alerts</h3>
 <p className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.2em] italic">Predictive Threat Intelligence</p>
 </div>
 </div>

 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-10">
 {metrics?.lowStockCount && metrics.lowStockCount > 0 ? (
 <>
 <div className="w-32 h-32 bg-error-container/10 rounded-full flex items-center justify-center border border-error/20 animate-pulse relative">
 <AlertTriangle className="text-error" size={56} strokeWidth={1} />
 <div className="absolute inset-0 bg-error/20 rounded-full blur-2xl animate-ping" />
 </div>
 <div className="space-y-6">
 <p className="text-3xl font-semibold text-white tracking-tighter uppercase leading-none">Resource Depletion</p>
 <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.3em] opacity-80 leading-relaxed italic max-w-[280px] mx-auto">
 {metrics.lowStockCount} Assets detected below safety threshold. Replenish to sustain market presence.
 </p>
 </div>
 </>
 ) : (
 <>
 <div className="w-32 h-32 bg-success-container/10 rounded-full flex items-center justify-center border border-success/20 relative shadow-2xl">
 <ShieldCheck className="text-success" size={56} strokeWidth={1} />
 <div className="absolute inset-0 bg-success/10 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-1000" />
 </div>
 <div className="space-y-6">
 <p className="text-3xl font-semibold text-white tracking-tighter uppercase leading-none">Operations Secure</p>
 <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.3em] opacity-80 leading-relaxed italic max-w-[280px] mx-auto">
 Inventory levels remain synchronized and healthy. All asset nodes are reporting optimal operational status.
 </p>
 </div>
 </>
 )}
 </div>
 </div>

 <button className="w-full mt-16 bg-white text-on-surface py-6 rounded text-[10px] font-semibold uppercase tracking-[0.4em] hover:bg-jumia-orange-dark hover:text-white transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 shadow-2xl group relative z-10 overflow-hidden">
 Optimize Catalog <ArrowUpRight size={20} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
 </button>
 </div>
 </div>
 </div>
 );
}
