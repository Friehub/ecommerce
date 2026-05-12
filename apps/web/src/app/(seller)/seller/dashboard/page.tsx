'use client';

import { api } from '@/trpc/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ShoppingCart,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Package,
  BarChart3,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboard() {
  const { data: metrics, isLoading } = api.seller.getDashboardMetrics.useQuery();
  const { data: orders } = api.order.listSellerPackages.useQuery({ limit: 5, offset: 0 });

  const stats = [
    { 
      name: 'Net Revenue', 
      value: `₦${(metrics?.netRevenue || 0).toLocaleString()}`, 
      change: '+12.5%', 
      icon: TrendingUp, 
      color: 'text-emerald-500',
      badge: 'bg-green-50 text-green-600',
      description: 'AFTER COMMISSION'
    },
    { 
      name: 'Orders', 
      value: ((metrics as any)?.totalOrders || (metrics?.deliveredOrders || 0) + (metrics?.pendingOrders || 0)).toString(), 
      change: 'ACTIVE', 
      icon: ShoppingBag, 
      color: 'text-blue-500',
      badge: 'bg-blue-50 text-blue-600',
      description: 'TOTAL VOLUME'
    },
    { 
      name: 'Fulfillment', 
      value: `${((metrics as any)?.fulfillmentRate || 100).toFixed(1)}%`, 
      change: '98%', 
      icon: Package, 
      color: 'text-purple-500',
      badge: 'bg-purple-50 text-purple-600',
      description: 'PROCESSING RATE'
    },
    { 
      name: 'Pending', 
      value: (orders?.filter(p => p.status === 'PENDING').length || 0).toString(), 
      change: 'URGENT', 
      icon: Clock, 
      color: 'text-amber-500',
      badge: 'bg-red-50 text-red-600',
      description: 'ACTION REQUIRED'
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
    <div className="max-w-[1400px] mx-auto space-y-10 pb-10 select-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Business Console</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Storefront Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Last Sync</p>
            <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">May 08, 15:45</p>
          </div>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-7 rounded-[20px] border border-gray-100 flex flex-col justify-between h-[160px] hover:border-[#f68b1e]/20 transition-all">
            <div className="flex justify-between items-start">
              <stat.icon className={stat.color} size={20} strokeWidth={2.5} />
              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${stat.badge}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">{stat.name}</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
              <p className="text-[8px] text-gray-400 font-bold uppercase mt-1.5 tracking-widest">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8/12): Inbound Orders */}
        <div className="lg:col-span-8 bg-white rounded-[24px] border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart size={18} className="text-gray-400" />
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Inbound Orders</h3>
            </div>
            <Link href="/seller/orders" className="text-gray-400 hover:text-[#f68b1e] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
              Manage All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            {orders && orders.length > 0 ? (
               <div className="w-full divide-y divide-gray-50">
                 {/* Order lines list would go here, for now keeping it clean like the placeholder */}
                 {orders.slice(0, 5).map(pkg => (
                   <div key={pkg.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                     <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-blue-100 transition-colors">
                         <Package size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                       </div>
                       <div>
                         <div className="flex items-center gap-3">
                           <h4 className="text-sm font-black text-gray-900 tracking-tight">#{pkg.orderId.slice(-8).toUpperCase()}</h4>
                           <span className="w-1 h-1 bg-gray-300 rounded-full" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                             {new Date(pkg.createdAt).toLocaleDateString()}
                           </span>
                         </div>
                         <p className="text-gray-500 text-[10px] font-bold uppercase mt-0.5">
                           {pkg.lines.length} Line Items • ₦{Number(pkg.order.total).toLocaleString()}
                         </p>
                       </div>
                     </div>
                     <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        pkg.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                       {pkg.status}
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 border border-gray-100">
                  <ShoppingCart size={32} strokeWidth={1} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Awaiting New Orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4/12): Side Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Brand Expand Card */}
          <div className="bg-[#232323] p-10 rounded-[32px] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mb-4">Expand Your <br /> Reach</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wide leading-relaxed mb-10 max-w-[200px]">
                Unlock official brand status and reach millions of new customers across the network.
              </p>
              <button className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white hover:text-[#f68b1e] transition-colors">
                Apply for Status <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
          </div>

          {/* Operational Health Card */}
          <div className="bg-white p-8 rounded-[24px] border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 bg-orange-50 text-[#f68b1e] rounded-lg flex items-center justify-center border border-orange-100">
                <BarChart3 size={16} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Operational Health</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Fulfillment Rate</p>
                    <span className="text-xl font-black text-gray-900 tracking-tight">100.0%</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Target Met</span>
                </div>
                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                <Info size={14} className="text-gray-300" />
                <p className="text-[8px] font-bold text-gray-400 leading-relaxed uppercase">
                  Maintain your rate above <span className="text-gray-900">98%</span> to qualify for premium vendor perks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
