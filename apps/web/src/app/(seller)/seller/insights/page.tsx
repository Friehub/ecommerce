'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { TrendingUp, Award, BarChart3, Users, DollarSign, Calendar, Flame, FlameKindling, Loader2, Package, AlertTriangle } from 'lucide-react';

export default function SellerInsightsPage() {
  const { data: metrics, isLoading } = api.seller.getDashboardMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] select-none">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  const gmv = metrics?.gmv || 0;
  const revenue = metrics?.revenue || 0;
  const pendingOrders = metrics?.pendingOrders || 0;
  const deliveredOrders = metrics?.deliveredOrders || 0;
  const totalOrders = pendingOrders + deliveredOrders;
  const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

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
          <span className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">Real-time Data</span>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-[#F68B1E]">
            <DollarSign size={20} className="p-1 rounded-lg bg-orange-50 border border-orange-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Gross Revenues</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">₦ {gmv.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs font-extrabold text-green-500 bg-green-50/50 px-1.5 py-0.5 rounded border border-green-100/40">Active</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Live tracking</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-[#F68B1E]">
            <Award size={20} className="p-1 rounded-lg bg-orange-50 border border-orange-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Performance Score</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{(metrics?.performanceScore || 5.0).toFixed(1)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Out of 5.0</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-blue-500">
            <Package size={20} className="p-1 rounded-lg bg-blue-50 border border-blue-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Total Orders</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{totalOrders}</p>
          <div className="flex items-center gap-1.5 mt-2 text-blue-500">
            <span className="text-xs font-extrabold uppercase tracking-widest">{pendingOrders} pending</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-gray-200/80 duration-300 transition-all">
          <div className="flex items-center gap-3 mb-3 text-red-500">
            <Flame size={20} className="p-1 rounded-lg bg-red-50 border border-red-100 shrink-0" />
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">Items Sold</h3>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{deliveredOrders}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Verified deliveries</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 md:p-7">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FlameKindling size={16} className="text-[#F68B1E]" /> Performance Metrics
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Fulfillment Rate', val: `${conversionRate.toFixed(1)}%`, progress: conversionRate, color: 'bg-[#F68B1E]' },
              { label: 'Inventory Health', val: metrics?.lowStockCount === 0 ? 'Optimal' : `${metrics?.lowStockCount} Low`, progress: metrics?.lowStockCount === 0 ? 100 : 50, color: 'bg-blue-500' },
              { label: 'Customer Satisfaction', val: `${((metrics?.performanceScore || 5.0) * 20).toFixed(0)}%`, progress: (metrics?.performanceScore || 5.0) * 20, color: 'bg-green-500' },
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

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 md:p-7 overflow-hidden">
          <h3 className="text-xs md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Stock Alerts
          </h3>
          {metrics?.lowStockCount && metrics.lowStockCount > 0 ? (
            <div className="p-8 text-center bg-orange-50 rounded-2xl border border-orange-100">
               <Package className="mx-auto text-orange-200 mb-2" size={32} />
               <p className="text-sm font-bold text-orange-800">You have {metrics.lowStockCount} items running low on stock.</p>
               <p className="text-[10px] uppercase font-black text-orange-400 mt-1 tracking-widest">Replenish soon to avoid losing sales</p>
            </div>
          ) : (
            <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100">
               <CheckCircle2 className="mx-auto text-green-200 mb-2" size={32} />
               <p className="text-sm font-bold text-green-800">Inventory levels are healthy.</p>
               <p className="text-[10px] uppercase font-black text-green-400 mt-1 tracking-widest">All active products have sufficient stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
