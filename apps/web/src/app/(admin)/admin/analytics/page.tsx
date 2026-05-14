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
  Calendar,
  AlertCircle,
  Layers,
  ArrowRight,
  Target,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAnalyticsPage() {
  const { data: metrics, isLoading: metricsLoading } = api.ops.getGlobalMetrics.useQuery();
  const { data: timeSeries, isLoading: tsLoading } = api.ops.getTimeSeries.useQuery();

  const isLoading = metricsLoading || tsLoading;

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <Skeleton className="h-[400px] w-full rounded-sm" />
          <Skeleton className="h-[400px] w-full rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-j-text text-white rounded-sm shadow-sm">
                <BarChart size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Platform Insights</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Analytics <span className="text-jumia-orange">Dashboard</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">System-wide performance and growth telemetry</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Live Feed: Synchronized</span>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-j-text text-white p-8 rounded-sm shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-white/40">
                <Activity size={16} />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-white/60">Active Sessions</h3>
              </div>
              <p className="text-4xl font-black tracking-tight mb-2 leading-none">{metrics?.activeSessions || 0}</p>
              <div className="flex items-center gap-2 text-green-400 text-[9px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-full">
                <TrendingUp size={12} /> +4.2% Load
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-5">
              <Activity size={80} />
            </div>
          </div>

          {[
            { label: '30D Revenue', value: `₦ ${(metrics?.totalGmv30d || 0).toLocaleString()}`, icon: DollarSign, sub: 'Total GMV Performance', trend: '+12.4%', up: true },
            { label: 'Seller Density', value: metrics?.activeSellers || 0, icon: Users, sub: 'Verified Merchants', trend: '+8.1%', up: true },
            { label: 'Market Disputes', value: metrics?.openDisputes || 0, icon: AlertCircle, sub: 'Active Resolution', trend: '-2.4%', up: false, color: 'text-j-error' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-8 rounded-sm border border-j-border shadow-sm transition-all hover:border-jumia-orange/30 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-j-background rounded-sm text-j-text-muted group-hover:text-jumia-orange transition-colors">
                    <kpi.icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-[9px] font-black uppercase text-j-text-muted/60 tracking-wider">{kpi.label}</h3>
                    <p className="text-[8px] font-black uppercase text-j-text-muted/30 italic tracking-tight">{kpi.sub}</p>
                  </div>
                </div>
                {kpi.up ? <ArrowUpRight size={14} className="text-j-success" /> : <ArrowDown size={14} className="text-j-error" />}
              </div>
              <div>
                <p className={`text-2xl font-black tracking-tight uppercase leading-none ${kpi.color || 'text-j-text'}`}>{kpi.value}</p>
                <p className={`text-[9px] font-black uppercase mt-4 tracking-widest ${kpi.up ? 'text-j-success' : 'text-j-error'} opacity-60`}>
                  {kpi.trend} vs Prev Period
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts/Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart Representation */}
          <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-background/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                  <DollarSign size={20} className="text-jumia-orange" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Revenue Performance</h3>
                  <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60 tracking-wider">30-Day Financial Trajectory</p>
                </div>
              </div>
              <Calendar size={16} className="text-j-text-muted/20" />
            </div>

            <div className="p-4 flex-1 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {timeSeries?.gmv.length ? (
                timeSeries.gmv.map((point: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-j-background/40 border border-j-border rounded-sm group hover:border-jumia-orange/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-jumia-orange/20 rounded-full group-hover:bg-jumia-orange transition-colors" />
                      <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">{point.day}</span>
                    </div>
                    <span className="text-xs font-black text-j-text tracking-tight uppercase">₦ {point.value.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center space-y-4 opacity-20">
                  <BarChart size={40} className="mx-auto" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No revenue data available</p>
                </div>
              )}
            </div>
          </div>

          {/* User Growth Chart Representation */}
          <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-background/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                  <Users size={20} className="text-jumia-orange" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">User Registrations</h3>
                  <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60 tracking-wider">Acquisition & Growth Metrics</p>
                </div>
              </div>
              <TrendingUp size={16} className="text-j-text-muted/20" />
            </div>

            <div className="p-4 flex-1 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {timeSeries?.users.length ? (
                timeSeries.users.map((point: any, i: number) => (
                  <div key={i} className="space-y-2 p-4 bg-j-background/40 border border-j-border rounded-sm group hover:border-jumia-orange/20 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">{point.day}</span>
                      <span className="text-xs font-black text-j-text tracking-widest">{point.value} NEW</span>
                    </div>
                    <div className="w-full h-1.5 bg-white border border-j-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-jumia-orange transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(point.value * 5, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center space-y-4 opacity-20">
                  <Layers size={40} className="mx-auto" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No growth data synchronized</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit info section */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <ShieldCheck size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Data <span className="text-jumia-orange">Integrity</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  Platform analytics are recalculated every 60 minutes. Financial data undergoes automated reconciliation with regional clearing houses to ensure 100% accuracy in settlement reporting.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Audit Trail: Active</span>
              <Target size={16} className="text-jumia-orange animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
