'use client';

import { api } from '@/trpc/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  ChevronRight,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboard() {
  const { data: metrics, isLoading } = api.seller.getDashboardMetrics.useQuery();
  const { data: orders } = api.order.listSellerPackages.useQuery();

  const stats = [
    { 
      name: 'Total Revenue', 
      value: `₦${(metrics?.revenue || 0).toLocaleString()}`, 
      change: '+0%', 
      icon: TrendingUp, 
      color: 'text-emerald-400' 
    },
    { 
      name: 'Total Orders', 
      value: (metrics?.totalOrders || 0).toString(), 
      change: 'Active', 
      icon: ShoppingBag, 
      color: 'text-blue-400' 
    },
    { 
      name: 'Fulfillment Rate', 
      value: `${(metrics?.fulfillmentRate || 100).toFixed(1)}%`, 
      change: 'Goal: 95%', 
      icon: Package, 
      color: 'text-purple-400' 
    },
    { 
      name: 'Pending Orders', 
      value: (orders?.filter(p => p.status === 'PENDING').length || 0).toString(), 
      change: 'Urgent', 
      icon: Clock, 
      color: 'text-amber-400' 
    },
  ];

  if (isLoading) return <div className="text-gray-400">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Store Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time performance and store insights.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last updated</p>
          <p className="text-xs font-bold text-gray-900">Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded shadow-sm border border-gray-200 group hover:border-[#f68b1e] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded bg-gray-50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                stat.change.includes('+') || stat.change === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Recent Orders</h3>
            <Link href="/seller/orders" className="text-[#f68b1e] text-[10px] font-bold hover:underline flex items-center gap-1 uppercase tracking-wider">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {orders?.slice(0, 5).map((pkg) => (
              <div key={pkg.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-100">
                    <ShoppingBag size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Order #{pkg.orderId.slice(-8).toUpperCase()}</h4>
                    <p className="text-gray-500 text-[11px] uppercase font-bold tracking-tight">
                      {pkg.lines.length} items • ₦{Number(pkg.order.total).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    pkg.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {pkg.status}
                  </span>
                  <p className="text-gray-400 text-[9px] mt-1 uppercase font-bold tracking-widest">Just now</p>
                </div>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <div className="p-12 text-center text-gray-400">
                <p className="text-xs font-bold uppercase tracking-wider">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#282828] p-8 rounded shadow-sm text-white relative overflow-hidden group cursor-pointer border border-gray-800">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">GROW YOUR BUSINESS</h3>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed font-medium">
                Unlock exclusive seller tools and reaching millions of customers across Nigeria.
              </p>
              <button className="border border-white text-white px-5 py-2.5 rounded text-[10px] font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest">
                LEARN MORE <ArrowUpRight size={14} className="inline ml-1" />
              </button>
            </div>
            <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 -rotate-12 transition-transform group-hover:scale-110" />
          </div>

          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h3 className="text-[10px] font-bold text-gray-900 mb-6 uppercase tracking-widest border-b border-gray-100 pb-2">SLA Performance</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] mb-2 uppercase tracking-widest">
                  <span className="text-gray-500 font-bold">Fulfillment Rate</span>
                  <span className="text-gray-900 font-bold">{(metrics?.fulfillmentRate || 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${metrics?.fulfillmentRate || 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-2 uppercase tracking-widest">
                  <span className="text-gray-500 font-bold">Average Rating</span>
                  <span className="text-gray-900 font-bold">{(metrics?.rating || 0).toFixed(1)} / 5.0</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f68b1e]" style={{ width: `${(metrics?.rating || 0) * 20}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
