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
  const { data: orders } = api.order.listSellerPackages.useQuery({ limit: 5, offset: 0 });

  const stats = [
    { 
      name: 'Revenue', 
      value: `₦${(metrics?.revenue || 0).toLocaleString()}`, 
      change: '+12.5%', 
      icon: TrendingUp, 
      color: 'bg-emerald-500',
      description: 'Total earnings this month'
    },
    { 
      name: 'Orders', 
      value: ((metrics as any)?.totalOrders || (metrics?.deliveredOrders || 0) + (metrics?.pendingOrders || 0)).toString(), 
      change: 'Active', 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      description: 'Volume across all categories'
    },
    { 
      name: 'Fulfillment', 
      value: `${((metrics as any)?.fulfillmentRate || 100).toFixed(1)}%`, 
      change: '98%', 
      icon: Package, 
      color: 'bg-purple-500',
      description: 'Order processing efficiency'
    },
    { 
      name: 'Pending', 
      value: (orders?.filter(p => p.status === 'PENDING').length || 0).toString(), 
      change: 'Urgent', 
      icon: Clock, 
      color: 'bg-amber-500',
      description: 'Action required immediately'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f68b1e] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Synchronizing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Business Console</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Live Storefront Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Last Sync</p>
            <p className="text-[11px] font-black text-gray-900 uppercase">May 08, 15:45</p>
          </div>
          <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-95">
            Download Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#f68b1e]/30 transition-all duration-300">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/5`}>
                  <stat.icon size={22} />
                </div>
                <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                  stat.change.includes('+') || stat.change === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.name}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1 tracking-tighter">{stat.value}</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">{stat.description}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Inbound Orders</h3>
              </div>
              <Link href="/seller/orders" className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#f68b1e] hover:text-white transition-all flex items-center gap-2">
                Manage All <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-50">
              {orders?.slice(0, 5).map((pkg) => (
                <div key={pkg.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 group-hover:border-blue-200 transition-colors">
                      <Package size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-black text-gray-900 tracking-tight">#{pkg.orderId.slice(-8).toUpperCase()}</h4>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {new Date(pkg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-0.5">
                        {pkg.lines.length} Line Items • ₦{Number(pkg.order.total).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Customer</p>
                      <p className="text-[11px] font-black text-gray-900 uppercase">{pkg.order.user.firstName}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${
                      pkg.status === 'PENDING' 
                        ? 'bg-orange-50 text-orange-600 border-orange-100/50' 
                        : 'bg-blue-50 text-blue-600 border-blue-100/50'
                    }`}>
                      {pkg.status}
                    </div>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Awaiting New Orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Insights & SLA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Promo Card */}
          <div className="bg-[#1A1A1A] p-8 rounded-[32px] shadow-2xl shadow-black/10 text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f68b1e]/20 rounded-full blur-[60px] group-hover:blur-[80px] transition-all" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/5">
                <ArrowUpRight size={20} className="text-[#f68b1e]" />
              </div>
              <h3 className="text-xl font-black mb-3 uppercase tracking-tighter leading-none">Expand Your <br /> Reach</h3>
              <p className="text-white/40 text-xs mb-8 leading-relaxed font-bold uppercase tracking-tight">
                Unlock official brand status and reach millions of new customers.
              </p>
              <button className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#f68b1e] hover:text-white transition-all shadow-xl active:scale-95">
                Apply for Brand Status
              </button>
            </div>
          </div>

          {/* SLA Metrics */}
          <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm">
            <h3 className="text-[11px] font-black text-gray-900 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
              <BarChart3 size={16} className="text-[#f68b1e]" />
              Operational Health
            </h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fulfillment Rate</p>
                    <span className="text-xl font-black text-gray-900 tracking-tight">{((metrics as any)?.fulfillmentRate || 100).toFixed(1)}%</span>
                  </div>
                  <span className="text-[10px] font-black text-green-500 uppercase">Above Target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${(metrics as any)?.fulfillmentRate || 100}%` }} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Store Rating</p>
                    <span className="text-xl font-black text-gray-900 tracking-tight">{((metrics as any)?.rating || 4.5).toFixed(1)} / 5.0</span>
                  </div>
                  <span className="text-[10px] font-black text-[#f68b1e] uppercase">Excellent</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f68b1e] rounded-full transition-all duration-1000" style={{ width: `${((metrics as any)?.rating || 4.5) * 20}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                  <Info size={16} />
                </div>
                <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase">
                  Maintain a fulfillment rate above <span className="text-gray-900">95%</span> to avoid performance penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
