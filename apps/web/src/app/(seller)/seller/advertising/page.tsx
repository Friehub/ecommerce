'use client';

import React from 'react';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { 
  Megaphone, 
  Plus, 
  Eye, 
  TrendingUp, 
  Zap,
  Target,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdvertisingDashboard() {
  const { data: campaigns, isLoading } = api.advertising.getCampaigns.useQuery();

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12 bg-background min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-96 rounded-sm" />
            <Skeleton className="h-4 w-64 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-60 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-sm" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-sm" />
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
    { label: 'Active Campaigns', val: activeCampaigns, icon: Target, color: 'text-jumia-orange', bg: 'bg-orange-50', trend: 'ACTIVE' },
    { label: 'Total Impressions', val: totalImpressions.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'VIEWS' },
    { label: 'Total Clicks', val: totalClicks.toLocaleString(), icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: 'CLICKS' },
    { label: 'Total Spend', val: `₦ ${totalSpend.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: 'SPENT' }
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
              <Megaphone size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Sponsored Ads</span>
          </div>
          <h1 className="text-3xl font-black text-j-text uppercase tracking-tight">
            Advertising <span className="text-jumia-orange">Dashboard</span>
          </h1>
          <p className="text-j-text-muted text-[11px] font-bold uppercase mt-2 opacity-80 border-l-2 border-jumia-orange pl-4">
            Boost your product visibility and sales on Jumia with targeted sponsored advertisements.
          </p>
        </div>
        <Link 
          href="/seller/advertising/create" 
          className="bg-jumia-orange text-white px-8 py-4 rounded-sm text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95 flex items-center gap-3"
        >
          <Plus size={18} /> New Campaign
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-sm border border-j-border flex flex-col justify-between h-[160px] shadow-sm hover:border-j-text-muted transition-colors">
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-sm ${stat.bg} flex items-center justify-center border border-j-border`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest border border-j-border bg-j-background text-j-text-muted opacity-80">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-j-text-muted text-[9px] font-black uppercase mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-j-text tracking-tight">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Active Campaigns Table */}
      <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-background">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 rounded-sm flex items-center justify-center border border-orange-100">
              <BarChart3 size={20} className="text-jumia-orange" />
            </div>
            <div>
              <h3 className="text-xs font-black text-j-text uppercase tracking-wider">All Campaigns</h3>
              <p className="text-[9px] font-bold text-j-text-muted uppercase tracking-widest mt-0.5">Manage and track your advertising campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1 rounded-sm">
            <div className="w-2 h-2 bg-j-success rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase text-j-success tracking-widest">System Active</span>
          </div>
        </div>
        
        {(!campaigns || campaigns.length === 0) ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-j-background rounded-sm flex items-center justify-center border border-j-border text-j-text-muted mx-auto mb-6">
              <Megaphone size={36} className="opacity-40" />
            </div>
            <h2 className="text-md font-black text-j-text uppercase tracking-wider mb-2">No Advertising Campaigns Found</h2>
            <p className="text-[11px] font-bold text-j-text-muted uppercase max-w-md mx-auto mb-6 leading-relaxed">
              You haven't created any advertising campaigns yet. Start a campaign to promote your products to millions of shoppers.
            </p>
            <Link href="/seller/advertising/create" className="inline-flex items-center gap-2 px-8 py-4 bg-jumia-orange text-white rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95">
              <Sparkles size={16} />
              Create First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-j-border text-j-text-muted text-[10px] font-black uppercase bg-j-background tracking-wider">
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4 text-right">Impressions</th>
                  <th className="px-6 py-4 text-right">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {campaigns.map((c) => {
                  let imp = 0, clk = 0;
                  c.adGroups.forEach(g => { 
                    imp += (g as any)._count?.impressions || 0; 
                    clk += (g as any)._count?.clicks || 0; 
                  });
                  return (
                    <tr key={c.id} className="hover:bg-j-background transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-j-text uppercase tracking-tight mb-1">{c.name}</div>
                        <div className="text-[9px] font-bold text-j-text-muted uppercase tracking-widest flex items-center gap-1.5">
                          <Target size={12} className="opacity-60 text-jumia-orange" /> STANDARD SPONSORED ADS
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase border tracking-wider ${
                          c.status === 'ACTIVE' ? 'bg-green-50 text-j-success border-green-100' :
                          c.status === 'OUT_OF_BUDGET' ? 'bg-red-50 text-j-error border-red-100' :
                          'bg-j-background text-j-text-muted border-j-border'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-j-success animate-pulse' : 'bg-current'}`} />
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-j-text italic">₦ {Number(c.budget).toLocaleString()}</div>
                        <div className="text-[9px] font-bold text-j-text-muted uppercase tracking-widest">DAILY BUDGET</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-lg font-black text-j-text tracking-tight">{imp.toLocaleString()}</div>
                        <div className="text-[9px] font-bold text-j-text-muted uppercase tracking-widest">IMPRESSIONS</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-lg font-black text-jumia-orange tracking-tight">{clk.toLocaleString()}</div>
                        <div className="text-[9px] font-bold text-jumia-orange/60 uppercase tracking-widest">CLICKS</div>
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
