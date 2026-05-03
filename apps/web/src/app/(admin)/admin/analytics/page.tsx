'use client';

import React from 'react';
import { ShieldCheck, TrendingUp, BarChart, Users, ArrowUpRight, DollarSign, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck className="text-[#F68B1E]" /> SYSTEM ANALYTICS & MONITORING
          </h1>
          <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
            Global operational overview of users, active sellers, transactions, and metrics.
          </p>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#282828] text-white p-6 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Active Traffic</h3>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black">2,419</p>
          <div className="flex items-center gap-1.5 mt-2 text-green-400 text-xs">
            <TrendingUp size={14} />
            <span className="font-extrabold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">+4%</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">in last 1 hour</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 duration-300 hover:border-gray-200">
          <div className="flex items-center gap-3 mb-3 text-gray-500">
            <DollarSign size={20} className="p-1 bg-gray-50 border border-gray-100 rounded-lg shrink-0" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gross Platform Volume</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">₦ 41,520,000</p>
          <div className="flex items-center gap-1.5 mt-2 text-green-500 text-xs">
            <ArrowUpRight size={14} />
            <span className="font-extrabold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">+11%</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 duration-300 hover:border-gray-200">
          <div className="flex items-center gap-3 mb-3 text-gray-500">
            <Users size={20} className="p-1 bg-gray-50 border border-gray-100 rounded-lg shrink-0" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Marketplace Sellers</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">384</p>
          <div className="flex items-center gap-1.5 mt-2 text-green-500 text-xs">
            <TrendingUp size={14} />
            <span className="font-extrabold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">+8.2%</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">new applications</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 duration-300 hover:border-gray-200">
          <div className="flex items-center gap-3 mb-3 text-gray-500">
            <BarChart size={20} className="p-1 bg-gray-50 border border-gray-100 rounded-lg shrink-0" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Processing Success Rate</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">99.85%</p>
          <div className="flex items-center gap-1.5 mt-2 text-indigo-500 text-xs">
            <Activity size={14} />
            <span className="font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Exhaustive</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">API processing uptime</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 shadow-md">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6">Traffic & Request Influx</h3>
          <div className="space-y-4">
            {[
              { route: 'catalog.getCategories', count: '1.2M hits', status: 'Optimal', p: 88, c: 'bg-green-500' },
              { route: 'promo.getFlashSales', count: '450K hits', status: 'Optimal', p: 61, c: 'bg-green-500' },
              { route: 'cart.get', count: '310K hits', status: 'Healthy', p: 48, c: 'bg-[#F68B1E]' },
              { route: 'auth.getSession', count: '180K hits', status: 'Optimal', p: 25, c: 'bg-blue-500' },
            ].map((r, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-gray-700 tracking-tight font-mono">{r.route}</span>
                  <span className="font-black text-gray-900">{r.count}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  <div className={`${r.c} h-full rounded-full transition-all duration-500`} style={{ width: `${r.p}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Usage Load Percentage</span>
                  <span className="text-gray-500 font-extrabold">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 shadow-md">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6">System Health Matrix</h3>
          <div className="space-y-3">
            {[
              { title: 'Core Node Server', val: 'Active', color: 'text-green-600 bg-green-50 border-green-100' },
              { title: 'Rust Inventory Search Service', val: 'Active', color: 'text-green-600 bg-green-50 border-green-100' },
              { title: 'Redis Cache Memory Clusters', val: 'Healthy', color: 'text-green-600 bg-green-50 border-green-100' },
              { title: 'Payment Processing Hooks (Paystack)', val: 'Healthy', color: 'text-green-600 bg-green-50 border-green-100' },
              { title: 'Platform Email Notification Workers', val: 'Operational', color: 'text-blue-600 bg-blue-50 border-blue-100' },
            ].map((node, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors duration-200">
                <span className="text-xs font-bold text-gray-700 tracking-tight">{node.title}</span>
                <span className={`text-[10px] px-2.5 py-1 rounded font-extrabold uppercase tracking-widest border ${node.color}`}>
                  {node.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
