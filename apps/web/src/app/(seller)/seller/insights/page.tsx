'use client';

import React from 'react';
import { TrendingUp, Award, BarChart3, Users, DollarSign, Calendar, Flame, FlameKindling } from 'lucide-react';

export default function SellerInsightsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
            <BarChart3 className="text-[#F68B1E]" /> SELLER INSIGHTS & ANALYTICS
          </h1>
          <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
            Track business metrics, analytics trends, and growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-sm">
          <Calendar className="text-gray-400" size={16} />
          <span className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">Last 30 Days</span>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-[#F68B1E]">
            <DollarSign size={20} className="p-1 rounded-lg bg-orange-50 border border-orange-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Gross Revenues</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">₦ 425,000</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs font-extrabold text-green-500 bg-green-50/50 px-1.5 py-0.5 rounded border border-green-100/40">+12%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-[#F68B1E]">
            <Award size={20} className="p-1 rounded-lg bg-orange-50 border border-orange-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Conversion Rate</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">3.85%</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs font-extrabold text-green-500 bg-green-50/50 px-1.5 py-0.5 rounded border border-green-100/40">+0.4%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-blue-500">
            <Users size={20} className="p-1 rounded-lg bg-blue-50 border border-blue-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Traffic (Visits)</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">14,210</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs font-extrabold text-green-500 bg-green-50/50 px-1.5 py-0.5 rounded border border-green-100/40">+8%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-red-500">
            <Flame size={20} className="p-1 rounded-lg bg-red-50 border border-red-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Total Items Sold</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">524</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs font-extrabold text-green-500 bg-green-50/50 px-1.5 py-0.5 rounded border border-green-100/40">+15%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">vs last month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 md:p-7">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FlameKindling size={16} className="text-[#F68B1E]" /> Hot Trends & Customer Insights
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Repeat Customer Growth', val: '64%', progress: 64, color: 'bg-[#F68B1E]' },
              { label: 'Cross-Category Purchases', val: '28%', progress: 28, color: 'bg-blue-500' },
              { label: 'Listing Conversion Improvement', val: '41%', progress: 41, color: 'bg-green-500' },
              { label: 'Abandonment Prevention Rate', val: '72%', progress: 72, color: 'bg-indigo-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-gray-700 tracking-tight">{item.label}</span>
                  <span className="font-black text-gray-900">{item.val}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top selling catalog items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 md:p-7 overflow-hidden">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6">Top Selling Items</h3>
          <div className="divide-y divide-gray-100">
            {[
              { id: 1, title: 'Corporate Leather Briefcase', price: 45000, qty: 124, rev: 5580000 },
              { id: 2, title: 'Multi-Utility Tactical Backpack', price: 18500, qty: 89, rev: 1646500 },
              { id: 3, title: 'Modern Premium Ergonomic Desk Chair', price: 62000, qty: 45, rev: 2790000 },
              { id: 4, title: 'Smart Ultra-High Definition Display 4K', price: 110000, qty: 32, rev: 3520000 },
            ].map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200">
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs md:text-sm text-gray-900 leading-tight tracking-tight hover:text-[#F68B1E] transition-colors cursor-pointer truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    ₦ {item.price.toLocaleString()} • {item.qty} units sold
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs md:text-sm font-black text-gray-800">₦ {item.rev.toLocaleString()}</p>
                  <span className="text-[10px] font-extrabold text-green-500 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded border border-green-100/30">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
