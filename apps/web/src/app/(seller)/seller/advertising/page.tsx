'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { Megaphone, Plus, MousePointerClick, Eye, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdvertisingDashboard() {
  const { data: campaigns, isLoading } = api.advertising.getCampaigns.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-[#F68B1E] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Ad Servers...</p>
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

  return (
    <div className="space-y-12 select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="bg-[#1A1A1A] p-2 rounded-xl">
               <Megaphone size={20} className="text-white" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Marketing <span className="text-[#F68B1E]">Hub</span></h1>
          </div>
          <p className="text-sm text-gray-500 font-medium max-w-lg leading-relaxed">
            Drive targeted traffic to your listings. Monitor performance in real-time and optimize your bidding strategy.
          </p>
        </div>
        <Link 
          href="/seller/advertising/create" 
          className="bg-[#1A1A1A] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F68B1E] transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 active:scale-95"
        >
          <Plus size={18} /> Launch Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Active Campaigns', val: activeCampaigns, icon: <Megaphone size={20} />, color: 'text-blue-500' },
          { label: 'Total Reach', val: totalImpressions.toLocaleString(), icon: <Eye size={20} />, color: 'text-purple-500' },
          { label: 'Engagement', val: totalClicks.toLocaleString(), icon: <MousePointerClick size={20} />, color: 'text-[#F68B1E]' },
          { label: 'Total Spend', val: `₦${totalSpend.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'text-green-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/[0.02]">
            <div className="flex items-center justify-between mb-6">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
               <div className={`${stat.color} bg-current/10 p-2 rounded-xl`}>{stat.icon}</div>
            </div>
            <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Campaigns</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Live Monitoring</span>
          </div>
        </div>
        
        {(!campaigns || campaigns.length === 0) ? (
          <div className="p-24 text-center">
            <Megaphone className="mx-auto text-gray-100 mb-8" size={64} />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Zero Visibility</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-10 font-medium italic">Your products aren't being promoted yet. Start a campaign to reach millions of buyers.</p>
            <Link href="/seller/advertising/create" className="inline-block px-12 py-4 bg-[#F68B1E] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1A1A1A] transition-all transform active:scale-95 shadow-xl shadow-orange-500/10">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <th className="px-8 py-6">Campaign Strategy</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Daily Budget</th>
                  <th className="px-8 py-6 text-right">Reach</th>
                  <th className="px-8 py-6 text-right">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map(c => {
                  let imp = 0, clk = 0;
                  c.adGroups.forEach(g => { imp += (g as any)._count?.impressions || 0; clk += (g as any)._count?.clicks || 0; });
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6 font-black text-gray-900 uppercase tracking-tight group-hover:text-[#F68B1E] transition-colors">{c.name}</td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          c.status === 'OUT_OF_BUDGET' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {c.status === 'OUT_OF_BUDGET' && <AlertCircle size={12} />}
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-bold text-xs italic">₦{Number(c.budget).toLocaleString()}</td>
                      <td className="px-8 py-6 text-right text-gray-900 font-black tracking-tighter text-lg">{imp.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right text-gray-900 font-black tracking-tighter text-lg">{clk.toLocaleString()}</td>
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
