'use client';

import { api } from '@/trpc/react';
import { 
 TrendingUp, 
 Users, 
 ShoppingBag, 
 ShoppingCart,
 Clock,
 ArrowUpRight,
 ChevronRight,
 Package,
 BarChart3,
 Info,
 ExternalLink,
 Store,
 Zap,
 Sparkles,
 ShieldCheck,
 LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function SellerDashboard() {
 const { data: metrics, isLoading: isMetricsLoading } = api.seller.getDashboardMetrics.useQuery();
 const { data: orders, isLoading: isOrdersLoading } = api.order.listSellerPackages.useQuery({ limit: 5, offset: 0 });

 const stats = [
 { 
 name: 'Net Revenue', 
 value: `₦${(metrics?.netRevenue || 0).toLocaleString()}`, 
 change: '+12.5%', 
 icon: TrendingUp, 
 color: 'text-success',
 badge: 'bg-success-container/10 text-success border-success/20',
 description: 'AFTER COMMISSION'
 },
 { 
 name: 'Orders', 
 value: ((metrics as any)?.totalOrders || (metrics?.deliveredOrders || 0) + (metrics?.pendingOrders || 0)).toString(), 
 change: 'ACTIVE', 
 icon: ShoppingBag, 
 color: 'text-jumia-orange',
 badge: 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20',
 description: 'TOTAL VOLUME'
 },
 { 
 name: 'Fulfillment', 
 value: `${((metrics as any)?.fulfillmentRate || 100).toFixed(1)}%`, 
 change: '98%', 
 icon: Package, 
 color: 'text-secondary',
 badge: 'bg-secondary-container/10 text-secondary border-secondary/20',
 description: 'PROCESSING RATE'
 },
 { 
 name: 'Pending', 
 value: (orders?.filter(p => p.status === 'PENDING').length || 0).toString(), 
 change: 'URGENT', 
 icon: Clock, 
 color: 'text-error',
 badge: 'bg-error-container/10 text-error border-error/20',
 description: 'ACTION REQUIRED'
 },
 ];

 if (isMetricsLoading) {
 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="space-y-6">
 <Skeleton className="h-16 w-96 rounded" />
 <Skeleton className="h-6 w-64 rounded-xl" />
 </div>
 <div className="flex gap-8">
 <Skeleton className="h-20 w-32 rounded" />
 <Skeleton className="h-20 w-64 rounded" />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
 {[...Array(4)].map((_, i) => (
 <Skeleton key={i} className="h-56 w-full rounded" />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 <div className="lg:col-span-8">
 <Skeleton className="h-[600px] w-full rounded-[64px]" />
 </div>
 <div className="lg:col-span-4 space-y-10">
 <Skeleton className="h-72 w-full rounded-[64px]" />
 <Skeleton className="h-72 w-full rounded-[64px]" />
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <LayoutDashboard size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Executive Merchant Terminal</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Business <br />
 <span className="text-jumia-orange italic">Console.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Live Intelligence Feed • Active Transactional Hub</p>
 </div>
 <div className="flex items-center gap-10 bg-surface-container-low/30 backdrop-blur-xl p-6 rounded border border-surface-container-lowest shadow-soft animate-in slide-in-from-right-8 duration-1000">
 <div className="text-right hidden sm:block">
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  mb-2 italic">System Synchronization</p>
 <p className="text-xs font-semibold text-on-surface uppercase tracking-tighter italic">Last Pulse: {format(new Date(), 'HH:mm:ss')}</p>
 </div>
 <button className="bg-jumia-orange text-white px-12 py-6 rounded text-[10px] font-semibold uppercase  hover:bg-jumia-orange-dark transition-all shadow-2xl active:scale-95 group flex items-center gap-4">
 Export Analytics <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
 </button>
 </div>
 </div>

 {/* Metrics Row */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
 {stats.map((stat, idx) => (
 <div key={stat.name} className="bg-surface-container-lowest p-10 rounded border border-surface-container-low flex flex-col justify-between h-[220px] hover:translate-y-[-12px] transition-all duration-700 shadow-soft group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex justify-between items-start">
 <div className={`w-14 h-14 rounded bg-surface-container-low flex items-center justify-center border-2 border-outline-variant/5 group-hover:scale-110 group-hover:border-jumia-orange/20 transition-all duration-1000 shadow-inner`}>
 <stat.icon className={stat.color} size={28} strokeWidth={2.5} />
 </div>
 <span className={`text-[9px] font-semibold px-5 py-2 rounded-full uppercase tracking-widest border-2 italic shadow-sm ${stat.badge}`}>
 {stat.change}
 </span>
 </div>
 <div>
 <p className="text-on-surface-variant/40 text-[9px] font-semibold uppercase  mb-3 italic">{stat.name}</p>
 <h3 className="text-4xl font-semibold text-on-surface tracking-tighter leading-none">{stat.value}</h3>
 <p className="text-[8px] text-on-surface-variant/30 font-semibold uppercase mt-4  italic border-t border-surface-container-low pt-3">{stat.description}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Main Grid Content */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
 {/* Left Column (8/12): Inbound Orders */}
 <div className="lg:col-span-8 bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
 <div className="p-12 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 bg-jumia-orange/5 rounded-2xl flex items-center justify-center border-2 border-on-surface/10">
 <ShoppingCart size={24} className="text-on-surface-variant" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-on-surface uppercase  leading-none mb-2">Inbound Pipeline</h3>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  italic">Real-time Fulfillment Feed</p>
 </div>
 </div>
 <Link href="/seller/orders" className="bg-surface-container-low text-on-surface-variant hover:bg-jumia-orange hover:text-white px-8 py-4 rounded-sm text-[10px] font-semibold uppercase  flex items-center gap-4 transition-all duration-500 group border-2 border-surface-container-lowest">
 Manage Pipeline <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
 </Link>
 </div>
 
 <div className="min-h-[540px]">
 {orders && orders.length > 0 ? (
 <div className="divide-y-4 divide-surface-container-low">
 {orders.slice(0, 5).map((pkg, idx) => (
 <div key={pkg.id} className="p-10 flex items-center justify-between hover:bg-surface-container-low/20 transition-all duration-700 group animate-in fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
 <div className="flex items-center gap-10">
 <div className="w-20 h-20 bg-surface-container-low rounded flex items-center justify-center border-2 border-outline-variant/5 group-hover:scale-105 group-hover:border-jumia-orange/30 transition-all duration-1000 shadow-inner relative overflow-hidden">
 <Package size={36} className="text-on-surface-variant/10 group-hover:text-jumia-orange transition-colors duration-1000" />
 <div className="absolute inset-0 bg-jumia-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-5">
 <h4 className="text-xl font-semibold text-on-surface tracking-tighter uppercase leading-none group-hover:text-jumia-orange transition-colors duration-500">#{pkg.orderId.slice(-12).toUpperCase()}</h4>
 <span className="w-2 h-2 bg-jumia-orange/20 rounded-full animate-pulse" />
 <span className="text-[10px] font-semibold text-on-surface-variant/30 uppercase  italic">
 {format(new Date(pkg.order.createdAt), 'MMM dd, HH:mm')}
 </span>
 </div>
 <p className="text-on-surface-variant/50 text-[10px] font-semibold uppercase  italic flex items-center gap-3">
 <Sparkles size={12} className="text-jumia-orange" />
 {pkg.lines.length} Line Assets • Gross Value ₦{Number(pkg.order.total).toLocaleString()}
 </p>
 </div>
 </div>
 <div className={`px-8 py-3 rounded-full text-[9px] font-semibold uppercase  border-2 shadow-sm italic transition-all duration-700 ${
 pkg.status === 'PENDING' ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20' : 'bg-success-container/10 text-success border-success/20'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full mr-2.5 inline-block ${pkg.status === 'PENDING' ? 'bg-jumia-orange animate-pulse' : 'bg-success'}`} />
 {pkg.status}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in zoom-in-95 duration-1000">
 <div className="w-32 h-32 bg-surface-container-low rounded flex items-center justify-center text-on-surface-variant border border-surface-container-lowest shadow-inner group">
 <ShieldCheck size={64} strokeWidth={1} className="opacity-10 group-hover:scale-110 transition-transform duration-1000" />
 </div>
 <div className="text-center space-y-4">
 <p className="text-xl font-semibold uppercase tracking-tighter text-on-surface">Logistics Integrity High</p>
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant/40 italic">All sectors reporting clear fulfillment telemetry</p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Right Column (4/12): Side Actions */}
 <div className="lg:col-span-4 space-y-10">
 {/* Brand Expand Card */}
 <div className="bg-jumia-orange p-14 rounded-[64px] text-white relative overflow-hidden group shadow-2xl border border-surface-container-low animate-in fade-in slide-in-from-right-8 duration-1000">
 <div className="absolute top-0 right-0 w-64 h-64 bg-jumia-orange/10 rounded-full blur-[100px] group-hover:bg-jumia-orange-dark/20 transition-all duration-1000" />
 <div className="relative z-10">
 <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-12 border-2 border-white/10 backdrop-blur-xl group-hover:scale-110 group-hover:border-jumia-orange/30 transition-all duration-1000 shadow-2xl">
 <Store size={32} className="text-jumia-orange" />
 </div>
 <h3 className="text-3xl md:text-5xl font-semibold uppercase tracking-tighter leading-[0.8] mb-8">Amplify <br /> Your <span className="text-jumia-orange italic">Authority.</span></h3>
 <p className="text-white/40 text-[11px] font-semibold uppercase  leading-relaxed mb-14 max-w-[280px] italic opacity-60">
 Unlock elite merchant status protocols and dominate the consumer ecosystem with priority node placement.
 </p>
 <button className="group flex items-center gap-6 text-[11px] font-semibold uppercase  text-jumia-orange hover:text-white transition-all duration-500">
 Escalate Status <ArrowUpRight size={24} className="group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-1000" />
 </button>
 </div>
 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px] group-hover:bg-white/10 transition-all duration-1000" />
 </div>

 {/* Operational Health Card */}
 <div className="bg-surface-container-lowest p-12 rounded-[56px] border border-surface-container-low shadow-soft animate-in fade-in slide-in-from-right-8 duration-1000" style={{ animationDelay: '300ms' }}>
 <div className="flex items-center gap-6 mb-16">
 <div className="w-14 h-14 bg-jumia-orange/10 text-jumia-orange rounded-2xl flex items-center justify-center border-2 border-jumia-orange/20 shadow-inner group">
 <BarChart3 size={28} className="group-hover:scale-110 transition-transform duration-500" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-on-surface uppercase  leading-none mb-2">Vitality Score</h3>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  italic">Merchant Health Index</p>
 </div>
 </div>
 
 <div className="space-y-16">
 <div className="space-y-8">
 <div className="flex justify-between items-end">
 <div className="space-y-2">
 <p className="text-[9px] font-semibold text-on-surface-variant/30 uppercase  italic">Fulfillment Precision</p>
 <span className="text-5xl font-semibold text-on-surface tracking-tighter leading-none">100.0<span className="text-xl opacity-20 ml-1">%</span></span>
 </div>
 <div className="flex flex-col items-end gap-3">
 <Zap size={16} className="text-success animate-bounce" />
 <span className="text-[10px] font-semibold text-success uppercase  border-2 border-success/20 bg-success-container/10 px-6 py-2 rounded-full italic shadow-sm">Peak Performance</span>
 </div>
 </div>
 <div className="h-4 bg-surface-container-low rounded-full overflow-hidden p-1 shadow-inner relative">
 <div className="h-full bg-success rounded-full shadow-2xl shadow-success/40 transition-all duration-1000 relative overflow-hidden" style={{ width: '100%' }}>
 <div className="absolute inset-0 bg-white/20 animate-pulse" />
 </div>
 </div>
 </div>

 <div className="pt-10 border-t-4 border-surface-container-low flex items-center gap-6 group">
 <div className="w-10 h-10 rounded-full bg-jumia-orange/5 flex items-center justify-center shrink-0 border-2 border-surface-container-low group-hover:scale-110 transition-transform duration-500">
 <Info size={18} className="text-on-surface-variant opacity-40 group-hover:text-jumia-orange group-hover:opacity-100 transition-all" />
 </div>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 leading-relaxed uppercase  italic">
 Maintain precision nodes above <span className="text-on-surface font-semibold">98.5%</span> to sustain priority logistic routing protocols and elite visibility.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
