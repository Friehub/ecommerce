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
  AlertCircle
} from 'lucide-react';
import { api } from '@/trpc/react';

export default function AdminAnalyticsPage() {
  const { data: metrics, isLoading: metricsLoading } = api.ops.getGlobalMetrics.useQuery();
  const { data: timeSeries, isLoading: tsLoading } = api.ops.getTimeSeries.useQuery();

  if (metricsLoading || tsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#F9F9FA]">
        <Loader2 className="animate-spin text-[#F68B1E]" size={32} />
      </div>
    );
  }

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
              <h3 className="text-[10px] font-black uppercase tracking-widest">Active Sessions</h3>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black">{metrics?.activeSessions || 0}</p>
          <div className="flex items-center gap-1.5 mt-2 text-green-400 text-xs">
            <TrendingUp size={14} />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Real-time load</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 duration-300 hover:border-gray-200">
          <div className="flex items-center gap-3 mb-3 text-gray-500">
            <DollarSign size={20} className="p-1 bg-gray-50 border border-gray-100 rounded-lg shrink-0" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">30D Revenue (GMV)</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">₦ {(metrics?.totalGmv30d || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2 text-green-500 text-xs">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Last 30 days</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 duration-300 hover:border-gray-200">
          <div className="flex items-center gap-3 mb-3 text-gray-500">
            <Users size={20} className="p-1 bg-gray-50 border border-gray-100 rounded-lg shrink-0" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Sellers</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{metrics?.activeSellers || 0}</p>
          <div className="flex items-center gap-1.5 mt-2 text-green-500 text-xs">
            <TrendingUp size={14} />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Verified partners</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 duration-300 hover:border-gray-200">
          <div className="flex items-center gap-3 mb-3 text-gray-500">
            <BarChart size={20} className="p-1 bg-gray-50 border border-gray-100 rounded-lg shrink-0" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Open Disputes</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{metrics?.openDisputes || 0}</p>
          <div className="flex items-center gap-1.5 mt-2 text-orange-500 text-xs">
            <AlertCircle size={14} />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Needs attention</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 shadow-md">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 flex items-center justify-between">
            Daily Revenue (Last 30 Days)
            <Calendar size={16} className="text-gray-400" />
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {timeSeries?.gmv.length ? (
              timeSeries.gmv.map((point: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-600">{point.day}</span>
                  <span className="text-xs font-black text-[#F68B1E]">₦ {point.value.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs italic">No revenue data for this period</div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 shadow-md">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 flex items-center justify-between">
            New Registrations
            <Users size={16} className="text-gray-400" />
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {timeSeries?.users.length ? (
              timeSeries.users.map((point: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-600">{point.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${Math.min(point.value * 10, 100)}px` }} />
                    <span className="text-xs font-black text-gray-900">{point.value}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs italic">No registration data for this period</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
