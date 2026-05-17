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
 Box
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function SellerInsightsPage() {
  const { data: metrics, isLoading: isMetricsLoading } = api.seller.getDashboardMetrics.useQuery();
  const { data: timeSeries, isLoading: isTsLoading } = api.seller.getTimeSeries.useQuery();

  const isLoading = isMetricsLoading || isTsLoading;

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Skeleton className="h-[500px] w-full rounded-sm" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-[500px] w-full rounded-sm" />
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
      label: 'Gross Sales', 
      val: `₦${gmv.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-jumia-orange',
      badge: 'bg-orange-50 text-jumia-orange border-orange-100',
      trend: '+12.5%',
      isPositive: true
    },
    { 
      label: 'Net Revenue', 
      val: `₦${netRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-j-success',
      badge: 'bg-green-50 text-j-success border-green-100',
      trend: '+8.2%',
      isPositive: true
    },
    { 
      label: 'Store Rating', 
      val: (metrics?.performanceScore || 5.0).toFixed(1), 
      icon: Award, 
      color: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-600 border-blue-100',
      trend: 'TOP RATED',
      isPositive: true
    },
    { 
      label: 'Total Orders', 
      val: totalOrders.toString(), 
      icon: Package, 
      color: 'text-j-text',
      badge: 'bg-j-background text-j-text-muted border-j-border',
      trend: `${pendingOrders} PENDING`,
      isPositive: false
    },
    { 
      label: 'Conversion Rate', 
      val: `${conversionRate.toFixed(1)}%`, 
      icon: Zap, 
      color: 'text-j-error',
      badge: 'bg-red-50 text-j-error border-red-100',
      trend: 'OPTIMAL',
      isPositive: true
    },
  ];

  return (
    <div className="max-w-[1184px] mx-auto space-y-12 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
              <BarChart3 size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Business Insights</span>
          </div>
          <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
            Performance <span className="text-jumia-orange">Analytics</span>
          </h1>
          <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">In-depth analysis of your store's performance and sales</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-sm border border-j-border shadow-sm">
          <Calendar className="text-jumia-orange" size={18} />
          <div className="text-right">
            <p className="text-[9px] font-black text-j-text-muted uppercase mb-0.5">Report Period</p>
            <p className="text-[10px] font-black text-j-text uppercase tracking-tight">{format(new Date(), 'MMMM yyyy')}</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-8 rounded-sm border border-j-border flex flex-col justify-between h-[200px] hover:border-jumia-orange/30 transition-all shadow-sm group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-sm bg-j-background flex items-center justify-center border border-j-border group-hover:bg-white transition-colors">
                <kpi.icon className={kpi.color} size={24} />
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${kpi.badge}`}>
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-j-text-muted text-[9px] font-black uppercase mb-1">{kpi.label}</p>
              <h3 className="text-2xl font-black text-j-text tracking-tight leading-none">{kpi.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Operations Overview */}
        <div className="lg:col-span-7 bg-white rounded-sm border border-j-border shadow-sm p-10 space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-j-background text-jumia-orange rounded-sm flex items-center justify-center border border-j-border shadow-inner">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Operations Overview</h3>
              <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Store efficiency metrics</p>
            </div>
          </div>

          <div className="space-y-10">
            {[
              { label: 'Fulfillment Rate', val: `${conversionRate.toFixed(1)}%`, progress: conversionRate, icon: Zap, color: 'bg-jumia-orange' },
              { label: 'Stock Health', val: metrics?.lowStockCount === 0 ? 'HEALTHY' : `${metrics?.lowStockCount} LOW STOCK`, progress: metrics?.lowStockCount === 0 ? 100 : 40, icon: Box, color: 'bg-blue-600' },
              { label: 'Seller Score', val: `${((metrics?.performanceScore || 5.0) * 20).toFixed(0)}%`, progress: (metrics?.performanceScore || 5.0) * 20, icon: ShieldCheck, color: 'bg-j-success' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-j-background flex items-center justify-center border border-j-border">
                      <item.icon size={14} className="text-j-text-muted opacity-40" />
                    </div>
                    <span className="text-[10px] font-black text-j-text-muted uppercase">{item.label}</span>
                  </div>
                  <span className="text-xl font-black text-j-text tracking-tight leading-none">{item.val}</span>
                </div>
                <div className="h-2 bg-j-background rounded-full overflow-hidden border border-j-border p-0.5 shadow-inner">
                  <div className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="lg:col-span-5 bg-j-text rounded-sm shadow-lg p-10 flex flex-col justify-between border border-black relative overflow-hidden group h-full min-h-[450px]">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center border border-white/20 backdrop-blur-sm">
                <AlertTriangle size={20} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase leading-none mb-1">Inventory Alerts</h3>
                <p className="text-[9px] font-black text-white/30 uppercase">Stock monitoring system</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-6">
              {metrics?.lowStockCount && metrics.lowStockCount > 0 ? (
                <>
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 animate-pulse">
                    <AlertTriangle className="text-j-error" size={48} />
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-black text-white tracking-tight uppercase leading-none">Low Stock Warning</p>
                    <p className="text-[10px] font-black text-white/40 uppercase leading-relaxed max-w-[240px] mx-auto">
                      {metrics.lowStockCount} products are running low. Restock soon to avoid losing potential sales.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/5">
                    <ShieldCheck className="text-j-success" size={48} />
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-black text-white tracking-tight uppercase leading-none">Inventory Healthy</p>
                    <p className="text-[10px] font-black text-white/40 uppercase leading-relaxed max-w-[240px] mx-auto">
                      All products are well-stocked. Your inventory levels are currently within optimal range.
                    </p>
                  </div>
                </>
              )}
            </div>

            <button className="w-full mt-10 bg-white text-j-text h-12 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-jumia-orange hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm">
              Manage Catalog <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none translate-x-1/4 scale-150">
            <LineChart size={400} strokeWidth={1} className="text-white" />
          </div>
        </div>
      </div>

      {/* Trend Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Performance (Daily Gross Sales) */}
        <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                <DollarSign size={20} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Daily Gross Sales</h3>
                <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60 tracking-wider">30-Day Revenue Trajectory</p>
              </div>
            </div>
            <Calendar size={16} className="text-j-text-muted/20" />
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center min-h-[250px]">
            {timeSeries?.gmv.length ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                {[...timeSeries.gmv].reverse().map((point: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-j-background/40 border border-j-border rounded-sm group hover:border-jumia-orange/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-jumia-orange/20 rounded-full group-hover:bg-jumia-orange transition-colors" />
                      <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">{point.day}</span>
                    </div>
                    <span className="text-xs font-black text-j-text tracking-tight uppercase">₦ {point.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-4 px-6">
                <div className="w-12 h-12 bg-j-background border border-j-border rounded-sm flex items-center justify-center mx-auto shadow-sm">
                  <BarChart3 size={20} className="text-j-text-muted opacity-40 animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-j-text uppercase tracking-tight">No revenue data yet</h4>
                <p className="text-[10px] text-j-text-muted font-bold uppercase tracking-tight leading-relaxed max-w-[240px] mx-auto">
                  Sales insights are compiled at the end of the settlement cycle. Check back once your first order is delivered!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Volume (Orders per Day) */}
        <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                <Package size={20} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Orders Per Day</h3>
                <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60 tracking-wider">30-Day Volume Metrics</p>
              </div>
            </div>
            <TrendingUp size={16} className="text-j-text-muted/20" />
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center min-h-[250px]">
            {timeSeries?.orders.length ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                {[...timeSeries.orders].reverse().map((point: any, i: number) => (
                  <div key={i} className="space-y-2 p-4 bg-j-background/40 border border-j-border rounded-sm group hover:border-jumia-orange/20 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">{point.day}</span>
                      <span className="text-xs font-black text-j-text tracking-widest">{point.value} ORDERS</span>
                    </div>
                    <div className="w-full h-1.5 bg-white border border-j-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-jumia-orange transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(point.value * 10, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-4 px-6">
                <div className="w-12 h-12 bg-j-background border border-j-border rounded-sm flex items-center justify-center mx-auto shadow-sm">
                  <Package size={20} className="text-j-text-muted opacity-40 animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-j-text uppercase tracking-tight">No orders recorded</h4>
                <p className="text-[10px] text-j-text-muted font-bold uppercase tracking-tight leading-relaxed max-w-[240px] mx-auto">
                  Daily volume metrics will appear here once your store begins receiving consumer traffic and orders.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
