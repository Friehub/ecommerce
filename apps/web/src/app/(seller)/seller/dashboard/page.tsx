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
 Info,
 ExternalLink,
 Store,
 Zap,
 Sparkles,
 ShieldCheck,
 LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function SellerDashboard() {
  const { data: metrics, isLoading: isMetricsLoading } = api.seller.getDashboardMetrics.useQuery();
  const { data: orders, isLoading: isOrdersLoading } = api.order.listSellerPackages.useQuery({ limit: 5, offset: 0 });

  const stats = [
    { 
      name: 'Net Revenue', 
      value: `₦${(metrics?.netRevenue || 0).toLocaleString()}`, 
      change: '+12.5%', 
      icon: TrendingUp, 
      color: 'text-j-success',
      badge: 'bg-green-50 text-j-success border-green-100',
      description: 'After Commission'
    },
    { 
      name: 'Total Orders', 
      value: ((metrics as any)?.totalOrders || (metrics?.deliveredOrders || 0) + (metrics?.pendingOrders || 0)).toString(), 
      change: 'Active', 
      icon: ShoppingBag, 
      color: 'text-jumia-orange',
      badge: 'bg-orange-50 text-jumia-orange border-orange-100',
      description: 'Monthly Volume'
    },
    { 
      name: 'Fulfillment Rate', 
      value: `${((metrics as any)?.fulfillmentRate || 100).toFixed(1)}%`, 
      change: 'Target: 98%', 
      icon: Package, 
      color: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Processing Rate'
    },
    { 
      name: 'Pending Orders', 
      value: (orders?.filter(p => p.status === 'PENDING').length || 0).toString(), 
      change: 'Urgent', 
      icon: Clock, 
      color: 'text-j-error',
      badge: 'bg-red-50 text-j-error border-red-100',
      description: 'Action Required'
    },
  ];

  if (isMetricsLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Skeleton className="h-[500px] w-full rounded-sm" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-64 w-full rounded-sm" />
            <Skeleton className="h-64 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1184px] mx-auto space-y-12 py-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
              <LayoutDashboard size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Seller Center</span>
          </div>
          <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
            Business <span className="text-jumia-orange">Dashboard</span>
          </h1>
          <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Store overview and fulfillment monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-j-text-muted uppercase mb-1">System Status</p>
            <p className="text-[10px] font-black text-j-text uppercase tracking-tight">Sync: {format(new Date(), 'HH:mm:ss')}</p>
          </div>
          <button className="bg-jumia-orange text-white h-12 px-8 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 group flex items-center gap-3">
            Export Data <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={stat.name} className="bg-white p-8 rounded-sm border border-j-border flex flex-col justify-between h-[200px] hover:border-jumia-orange/30 transition-all shadow-sm group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-sm bg-j-background flex items-center justify-center border border-j-border group-hover:bg-white transition-colors">
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${stat.badge}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-j-text-muted text-[9px] font-black uppercase mb-1">{stat.name}</p>
              <h3 className="text-3xl font-black text-j-text tracking-tight leading-none">{stat.value}</h3>
              <p className="text-[8px] text-j-text-muted font-black uppercase mt-3 pt-3 border-t border-j-border/50">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8/12): Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border">
                <ShoppingCart size={20} className="text-j-text-muted" />
              </div>
              <div>
                <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Recent Orders</h3>
                <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Pending fulfillment actions</p>
              </div>
            </div>
            <Link href="/seller/orders" className="text-jumia-orange hover:text-orange-600 text-[10px] font-black uppercase flex items-center gap-2 transition-colors">
              View All Orders <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="min-h-[400px]">
            {orders && orders.length > 0 ? (
              <div className="divide-y divide-j-border">
                {orders.slice(0, 5).map((pkg) => (
                  <div key={pkg.id} className="p-8 flex items-center justify-between hover:bg-j-background/30 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-j-background rounded-sm flex items-center justify-center border border-j-border group-hover:bg-white transition-all shadow-inner">
                        <Package size={28} className="text-j-text-muted/20 group-hover:text-jumia-orange transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors">#{pkg.orderId.slice(-8).toUpperCase()}</h4>
                          <span className="text-[9px] font-black text-j-text-muted uppercase opacity-40">
                            {format(new Date(pkg.order.createdAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-j-text-muted text-[10px] font-black uppercase flex items-center gap-2">
                          <Sparkles size={12} className="text-jumia-orange" />
                          {pkg.lines.length} Items • Total: ₦{Number(pkg.order.total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      pkg.status === 'PENDING' ? 'bg-orange-50 text-jumia-orange border-orange-100' : 'bg-green-50 text-j-success border-green-100'
                    }`}>
                      {pkg.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
                <div className="w-20 h-20 bg-j-background rounded-full flex items-center justify-center text-j-text-muted border border-j-border">
                  <ShieldCheck size={40} />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black text-j-text uppercase">No orders pending</p>
                  <p className="text-[10px] font-black text-j-text-muted uppercase">Your fulfillment queue is empty</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4/12): Performance & Actions */}
        <div className="lg:col-span-4 space-y-8">
          {/* Brand Action Card */}
          <div className="bg-jumia-orange p-10 rounded-sm text-white relative overflow-hidden group shadow-lg border border-orange-400">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center mb-8 border border-white/20 backdrop-blur-sm">
                <Store size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-[0.9] mb-4">Grow Your <br /> Store Today</h3>
              <p className="text-white/60 text-[10px] font-black uppercase leading-relaxed mb-10 max-w-[200px]">
                Unlock premium seller features and increase your store's visibility to millions of customers.
              </p>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase text-white hover:translate-x-2 transition-transform">
                Get Started <ArrowUpRight size={18} />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
          </div>

          {/* Performance Card */}
          <div className="bg-white p-8 rounded-sm border border-j-border shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-j-background text-jumia-orange rounded-sm flex items-center justify-center border border-j-border">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-j-text uppercase leading-none mb-1">Seller Performance</h3>
                <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Success metrics</p>
              </div>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-j-text-muted uppercase">Fulfillment Precision</p>
                    <span className="text-3xl font-black text-j-text tracking-tight">100.0%</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Zap size={14} className="text-j-success animate-bounce" />
                    <span className="text-[8px] font-black text-j-success uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">Top Rated</span>
                  </div>
                </div>
                <div className="h-2 bg-j-background rounded-full overflow-hidden border border-j-border p-0.5">
                  <div className="h-full bg-j-success rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="pt-8 border-t border-j-border flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full bg-j-background flex items-center justify-center shrink-0 border border-j-border">
                  <Info size={14} className="text-j-text-muted opacity-40 group-hover:text-jumia-orange group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-[8px] font-black text-j-text-muted leading-relaxed uppercase">
                  Maintain a fulfillment rate above <span className="text-j-text font-black">98.5%</span> to keep your Top Rated status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
