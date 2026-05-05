'use client';

import { api } from '../../../../trpc/react';
import Link from 'next/link';
import { Megaphone, Plus, MousePointerClick, Eye, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdvertisingDashboard() {
  const { data: campaigns, isLoading } = api.advertising.getCampaigns.useQuery();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Campaigns...</div>;
  }

  const activeCampaigns = campaigns?.filter(c => c.status === 'ACTIVE').length || 0;
  
  // Aggregate stats
  let totalSpend = 0;
  let totalClicks = 0;
  let totalImpressions = 0;

  campaigns?.forEach(c => {
    c.adGroups.forEach(g => {
      totalClicks += g._count.clicks;
      totalImpressions += g._count.impressions;
      totalSpend += g._count.clicks * Number(g.bid);
    });
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Advertising</h1>
          <p className="text-gray-500 text-sm mt-1">Boost your product visibility with sponsored placements.</p>
        </div>
        <Link href="/seller/advertising/create" className="bg-[#f68b1e] text-white px-6 py-2.5 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-[#e07a1a] transition-all flex items-center gap-2">
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Megaphone size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Active Campaigns</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeCampaigns}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Eye size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Total Impressions</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <MousePointerClick size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Total Clicks</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <TrendingUp size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Ad Spend</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦{totalSpend.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Your Campaigns</h3>
        </div>
        
        {(!campaigns || campaigns.length === 0) ? (
          <div className="p-12 text-center text-gray-500">
            <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-xs font-bold uppercase tracking-wider">No campaigns found</p>
            <p className="text-sm mt-2">Create your first ad campaign to drive more sales.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Budget</th>
                <th className="p-4 text-right">Impressions</th>
                <th className="p-4 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {campaigns.map(c => {
                let imp = 0, clk = 0;
                c.adGroups.forEach(g => { imp += g._count.impressions; clk += g._count.clicks; });
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{c.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        c.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' :
                        c.status === 'OUT_OF_BUDGET' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {c.status === 'OUT_OF_BUDGET' && <AlertCircle size={10} />}
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">₦{Number(c.budget).toLocaleString()}</td>
                    <td className="p-4 text-right text-gray-900 font-bold">{imp.toLocaleString()}</td>
                    <td className="p-4 text-right text-gray-900 font-bold">{clk.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
