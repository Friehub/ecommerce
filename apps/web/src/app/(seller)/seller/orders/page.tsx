'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { 
 Search, 
 Filter, 
 MoreVertical, 
 ExternalLink, 
 Package, 
 Truck, 
 CheckCircle2, 
 AlertCircle,
 Clock,
 Box,
 ChevronRight,
 ArrowRight,
 SearchCode,
 Layers,
 MapPin,
 Sparkles,
 Zap,
 ShieldCheck
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

const tabs = [
 { name: 'All', icon: Layers, color: 'text-on-surface' },
 { name: 'Pending', icon: Clock, color: 'text-jumia-orange' },
 { name: 'Processing', icon: Package, color: 'text-warning' },
 { name: 'Shipped', icon: Truck, color: 'text-secondary' },
 { name: 'Delivered', icon: CheckCircle2, color: 'text-success' },
];

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});
  const { data: packages, isLoading, refetch } = api.order.listSellerPackages.useQuery();
  const { toast } = useToast();

  const updateStatus = api.order.updatePackageStatus.useMutation({
    onSuccess: () => {
      refetch();
      setTrackingNumbers({});
      toast({
        title: 'Status Updated',
        message: 'Order status has been updated successfully.',
        type: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'Update Failed',
        message: err.message || 'Could not update order status.',
        type: 'error',
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-12 space-y-8 bg-j-background min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-64 rounded-sm" />
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-sm shrink-0" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-sm" />
      </div>
    );
  }

  const filteredPackages = packages?.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return p.status === 'PENDING';
    if (activeTab === 'Processing') return ['READY_FOR_PICKUP', 'PICKED_UP'].includes(p.status);
    if (activeTab === 'Shipped') return p.status === 'IN_TRANSIT';
    if (activeTab === 'Delivered') return p.status === 'DELIVERED';
    return p.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
                <Package size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Seller Center</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Order <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage your store orders and fulfillment</p>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID..."
              className="w-full h-12 pl-12 pr-4 bg-white border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange focus:ring-1 focus:ring-jumia-orange text-xs font-bold text-j-text placeholder:text-j-text-muted/40 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                  isActive 
                    ? 'bg-jumia-orange text-white border-jumia-orange shadow-md -translate-y-1' 
                    : 'bg-white text-j-text-muted border-j-border hover:border-jumia-orange/30'
                }`}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background border-b border-j-border text-j-text-muted text-[9px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5">Order ID</th>
                  <th className="px-6 py-5">Product Details</th>
                  <th className="px-6 py-5">Total Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {filteredPackages?.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-j-background transition-colors group">
                    <td className="px-6 py-6">
                      <div className="text-sm font-black text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors">#{pkg.orderId.slice(-8).toUpperCase()}</div>
                      <div className="text-[9px] font-black text-j-text-muted uppercase mt-1 flex items-center gap-2">
                        <Clock size={12} className="opacity-40" /> {format(new Date(pkg.order.createdAt), 'MMM dd, HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-j-background border border-j-border rounded-sm flex items-center justify-center shrink-0">
                          <Box size={24} className="text-j-text-muted/20 group-hover:text-jumia-orange transition-colors" />
                        </div>
                        <div className="max-w-[280px]">
                          <h4 className="font-bold text-xs text-j-text uppercase truncate mb-1">
                            {(pkg.lines[0]?.variant as any)?.product?.title || 'Multiple Items'}
                          </h4>
                          {pkg.lines.length > 1 ? (
                            <span className="text-[9px] text-jumia-orange font-black uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-sm border border-orange-100">+{pkg.lines.length - 1} More Items</span>
                          ) : (
                            <span className="text-[9px] text-j-text-muted font-black uppercase tracking-widest opacity-40">Single Item</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm font-black text-j-text">₦{Number(pkg.order.total).toLocaleString()}</div>
                      <div className="text-[9px] font-black text-j-text-muted uppercase mt-1 opacity-60">
                        {pkg.order.paymentMethod || 'Wallet'}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        pkg.status === 'PENDING' ? 'bg-orange-50 text-jumia-orange border-orange-100' :
                        pkg.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        pkg.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-j-background text-j-text-muted border-j-border'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {pkg.status === 'PENDING' && (
                          <button 
                            onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'READY_FOR_PICKUP' })}
                            disabled={updateStatus.isPending}
                            className="bg-jumia-orange text-white h-10 px-6 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-20 flex items-center gap-2"
                          >
                            Ready for Pickup
                          </button>
                        )}
                        {pkg.status === 'READY_FOR_PICKUP' && (
                          <button 
                            onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'PICKED_UP' })}
                            disabled={updateStatus.isPending}
                            className="bg-jumia-orange text-white h-10 px-6 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-20 flex items-center gap-2"
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {pkg.status === 'PICKED_UP' && (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="Tracking ID" 
                              value={trackingNumbers[pkg.id] || ''}
                              onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                              className="text-[10px] font-bold bg-j-background border border-j-border rounded-sm px-3 h-10 w-32 focus:border-jumia-orange outline-none uppercase transition-all"
                            />
                            <button 
                              onClick={() => updateStatus.mutate({ 
                                packageId: pkg.id, 
                                status: 'IN_TRANSIT',
                                trackingNumber: trackingNumbers[pkg.id]
                              })}
                              disabled={updateStatus.isPending || !trackingNumbers[pkg.id]}
                              className="bg-j-success text-white h-10 px-6 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-sm active:scale-95 disabled:opacity-20"
                            >
                              Dispatch
                            </button>
                          </div>
                        )}
                        {(pkg.status === 'IN_TRANSIT') && (
                          <div className="flex items-center gap-2 text-j-success font-black text-[9px] uppercase tracking-widest">
                            <Truck size={14} /> Shipped
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!filteredPackages || filteredPackages.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-j-background rounded-full flex items-center justify-center border border-j-border text-j-text-muted/20">
                          <Package size={32} />
                        </div>
                        <h4 className="font-black text-xl text-j-text uppercase tracking-tight">No orders found</h4>
                        <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">You don't have any orders in this category yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
