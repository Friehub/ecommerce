'use client';

import React from 'react';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { 
 Megaphone, 
 Plus, 
 MousePointerClick, 
 Eye, 
 TrendingUp, 
 AlertCircle,
 Zap,
 Target,
 BarChart3,
 ExternalLink,
 ChevronRight,
 Sparkles,
 Rocket,
 SearchCode,
 Layers,
 Network
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function AdvertisingDashboard() {
 const { data: campaigns, isLoading } = api.advertising.getCampaigns.useQuery();

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
 <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
 {[...Array(4)].map((_, i) => (
 <Skeleton key={i} className="h-52 w-full rounded" />
 ))}
 </div>
 <Skeleton className="h-[700px] w-full rounded-[64px]" />
 </div>
 );
 }

 const activeCampaigns = campaigns?.filter(c => c.status === 'ACTIVE').length || 0;
 
 // Aggregate stats
 let totalSpend = 0;
 let totalClicks = 0;
 let totalImpressions = 0;

 campaigns?.forEach(c => {
 c.adGroups.forEach(g => {
 totalClicks += (g as any)._count?.clicks || 0;
 totalImpressions += (g as any)._count?.impressions || 0;
 totalSpend += ((g as any)._count?.clicks || 0) * Number(g.bid);
 });
 });

 const stats = [
 { label: 'Active Channels', val: activeCampaigns, icon: Target, color: 'text-jumia-orange', bg: 'bg-jumia-orange/10', trend: 'OPTIMIZED' },
 { label: 'Global Reach', val: totalImpressions.toLocaleString(), icon: Eye, color: 'text-secondary', bg: 'bg-secondary-container/10', trend: 'LIVE' },
 { label: 'Engagement Rate', val: totalClicks.toLocaleString(), icon: Zap, color: 'text-error', bg: 'bg-error-container/10', trend: 'HIGH' },
 { label: 'Total Investment', val: `₦${totalSpend.toLocaleString()}`, icon: TrendingUp, color: 'text-success', bg: 'bg-success-container/10', trend: 'ROI FOCUS' }
 ];

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <Rocket size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Neural Growth Engine & Traffic Nexus</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Growth <br />
 <span className="text-jumia-orange italic">Engine.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">High-Performance Audience Acquisition & Real-time Bidding Control</p>
 </div>
 <Link 
 href="/seller/advertising/create" 
 className="bg-jumia-orange text-white px-12 py-6 rounded text-[10px] font-semibold uppercase  hover:bg-jumia-orange-dark transition-all shadow-2xl active:scale-95 flex items-center gap-4 group animate-in slide-in-from-right-8 duration-1000"
 >
 <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Launch New Campaign
 </Link>
 </div>

 {/* KPI Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
 {stats.map((stat, idx) => (
 <div key={stat.label} className="bg-surface-container-lowest p-10 rounded border border-surface-container-low flex flex-col justify-between h-[220px] hover:translate-y-[-12px] transition-all duration-700 shadow-soft group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex justify-between items-start">
 <div className={`w-14 h-14 rounded bg-surface-container-low flex items-center justify-center border-2 border-outline-variant/5 group-hover:scale-110 group-hover:border-jumia-orange/20 transition-all duration-1000 shadow-inner`}>
 <stat.icon className={stat.color} size={28} strokeWidth={2.5} />
 </div>
 <span className={`text-[9px] font-semibold px-5 py-2 rounded-full uppercase tracking-widest border-2 bg-surface-container-low text-on-surface-variant/40 border-outline-variant/5 italic shadow-sm`}>
 {stat.trend}
 </span>
 </div>
 <div>
 <p className="text-on-surface-variant/40 text-[9px] font-semibold uppercase  mb-3 italic">{stat.label}</p>
 <h3 className={`text-3xl font-semibold text-on-surface tracking-tighter leading-none`}>{stat.val}</h3>
 </div>
 </div>
 ))}
 </div>

 {/* Active Campaigns Table */}
 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="p-12 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 bg-jumia-orange/5 rounded-2xl flex items-center justify-center border-2 border-on-surface/10">
 <BarChart3 size={24} className="text-on-surface-variant" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-on-surface uppercase  leading-none mb-2">Deployment Matrix</h3>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  italic">Active Ad Network Synchronization</p>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-success-container/10 border-2 border-success/20 px-8 py-3 rounded-full shadow-sm">
 <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
 <span className="text-[9px] font-semibold uppercase text-success  italic">Network Synchronized</span>
 </div>
 </div>
 
 {(!campaigns || campaigns.length === 0) ? (
 <div className="py-48 text-center opacity-40 animate-in zoom-in-95 duration-1000">
 <div className="w-32 h-32 bg-surface-container-low rounded flex items-center justify-center border border-surface-container-lowest text-on-surface-variant shadow-inner mx-auto mb-10 group">
 <Megaphone size={64} strokeWidth={1} className="opacity-10 group-hover:scale-110 transition-transform duration-1000" />
 </div>
 <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4 leading-none">Visibility Restricted</h2>
 <p className="text-[11px] font-semibold text-on-surface-variant uppercase  max-w-sm mx-auto italic mb-14 leading-relaxed">
 Asset promotion is currently inactive in this sector. Launch a campaign to dominate the competitive landscape.
 </p>
 <Link href="/seller/advertising/create" className="inline-flex items-center gap-6 px-14 py-6 bg-jumia-orange text-white rounded font-semibold text-[10px] uppercase  hover:bg-jumia-orange-dark transition-all shadow-2xl active:scale-95 group">
 <Sparkles size={20} className="text-jumia-orange group-hover:scale-125 transition-transform duration-500" />
 Initialize Growth
 </Link>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[1200px]">
 <thead>
 <tr className="border-b-4 border-surface-container-low text-on-surface-variant text-[10px] font-semibold uppercase  bg-surface-container-low/20 italic">
 <th className="px-12 py-8">Strategy Identity</th>
 <th className="px-12 py-8">State</th>
 <th className="px-12 py-8">Resource Allocation</th>
 <th className="px-12 py-8 text-right">Reach</th>
 <th className="px-12 py-8 text-right">Engagement</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {campaigns.map((c, idx) => {
 let imp = 0, clk = 0;
 c.adGroups.forEach(g => { imp += (g as any)._count?.impressions || 0; clk += (g as any)._count?.clicks || 0; });
 return (
 <tr key={c.id} className="hover:bg-surface-container-low/30 transition-all duration-700 group animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
 <td className="px-12 py-10">
 <div className="text-xl font-semibold text-on-surface tracking-tighter uppercase group-hover:text-jumia-orange transition-colors duration-500 cursor-pointer leading-none mb-3">{c.name}</div>
 <div className="text-[9px] font-semibold text-on-surface-variant/30 uppercase  italic flex items-center gap-3">
 <Network size={14} className="opacity-40" /> DISTRIBUTED BIDDING STRATEGY
 </div>
 </td>
 <td className="px-12 py-10">
 <span className={`inline-flex items-center gap-3 px-8 py-3 rounded-full text-[9px] font-semibold uppercase  border-2 shadow-sm italic transition-all duration-700 ${
 c.status === 'ACTIVE' ? 'bg-success-container/10 text-success border-success/20' :
 c.status === 'OUT_OF_BUDGET' ? 'bg-error-container/10 text-error border-error/20' :
 'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10'
 }`}>
 <div className={`w-2 h-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-success animate-pulse' : 'bg-current'}`} />
 {c.status.replace('_', ' ')}
 </span>
 </td>
 <td className="px-12 py-10">
 <div className="text-lg font-semibold text-on-surface tracking-tight leading-none mb-2 italic opacity-60">₦{Number(c.budget).toLocaleString()}</div>
 <div className="text-[9px] font-semibold text-on-surface-variant/20 uppercase  italic">PER OPERATIONAL CYCLE</div>
 </td>
 <td className="px-12 py-10 text-right">
 <div className="text-3xl font-semibold text-on-surface tracking-tighter leading-none mb-2">{imp.toLocaleString()}</div>
 <div className="text-[9px] font-semibold text-on-surface-variant/20 uppercase  italic">IMPRESSIONS</div>
 </td>
 <td className="px-12 py-10 text-right">
 <div className="text-3xl font-semibold text-jumia-orange tracking-tighter leading-none mb-2">{clk.toLocaleString()}</div>
 <div className="text-[9px] font-semibold text-jumia-orange/40 uppercase  italic">ENGAGEMENTS</div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
}
