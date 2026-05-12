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
  { name: 'Pending', icon: Clock, color: 'text-primary-container' },
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
        title: 'LOGISTICS UPDATE SUCCESSFUL',
        message: 'Package state has been synchronized with the main hub.',
        type: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'UPDATE FAILED',
        message: err.message || 'Logistics hub synchronization error.',
        type: 'error',
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
            <Skeleton className="h-16 w-96 rounded-[24px]" />
            <Skeleton className="h-6 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-20 w-80 rounded-[32px]" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-40 rounded-full shrink-0" />
          ))}
        </div>
        <Skeleton className="h-[700px] w-full rounded-[64px]" />
      </div>
    );
  }

  const filteredPackages = packages?.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return p.status === 'PENDING';
    if (activeTab === 'Processing') return ['READY_FOR_PICKUP', 'PICKED_UP'].includes(p.status);
    if (activeTab === 'Shipped') return p.status === 'IN_TRANSIT' || p.status === 'SHIPPED';
    if (activeTab === 'Delivered') return p.status === 'DELIVERED';
    return p.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="animate-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-primary-container/20 backdrop-blur-xl rounded-2xl border border-primary-container/30">
              <Zap size={24} className="text-primary-container" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-container italic">Logistics Hub & Fulfillment Nexus</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-on-surface uppercase tracking-tighter leading-[0.85]">
            Operational <br />
            <span className="text-primary-container italic">Control.</span>
          </h1>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] mt-8 opacity-40 italic border-l-4 border-primary-container pl-8">Global Pipeline Orchestration & Shipment Intelligence</p>
        </div>
        <div className="relative group w-full md:w-96 animate-in slide-in-from-right-8 duration-1000">
          <SearchCode className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-focus-within:opacity-100 transition-all duration-500" size={24} />
          <input 
            type="text" 
            placeholder="LOCATE ORDER ID..."
            className="w-full pl-20 pr-8 py-6 bg-surface-container-low border-4 border-surface-container-lowest rounded-[32px] focus:outline-none focus:border-primary-container/50 focus:ring-8 focus:ring-primary-container/5 text-xs font-black text-on-surface placeholder:text-on-surface-variant/20 tracking-[0.3em] transition-all shadow-soft"
          />
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-4 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 whitespace-nowrap border-4 relative overflow-hidden group ${
                isActive 
                  ? 'bg-on-surface text-white border-on-surface shadow-2xl scale-105 -translate-y-2' 
                  : 'bg-surface-container-low text-on-surface-variant border-surface-container-lowest hover:border-primary-container/20'
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <tab.icon size={18} className={`${isActive ? 'opacity-100' : 'opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500'} ${tab.color}`} />
              {tab.name}
              {isActive && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-primary-container rounded-bl-3xl flex items-center justify-center animate-in slide-in-from-top-4 duration-500">
                  <Sparkles size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Shipment Matrix */}
      <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b-4 border-surface-container-low text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] bg-surface-container-low/20 italic">
                <th className="px-12 py-8">Inbound Pipeline</th>
                <th className="px-12 py-8">Asset Payload</th>
                <th className="px-12 py-8">Capitalization</th>
                <th className="px-12 py-8">Logistics State</th>
                <th className="px-12 py-8 text-right">Operational Control</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-surface-container-low">
              {filteredPackages?.map((pkg, idx) => (
                <tr key={pkg.id} className="hover:bg-surface-container-low/30 duration-700 transition-all group animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-lg font-black text-on-surface tracking-tighter uppercase leading-none group-hover:text-primary-container transition-colors duration-500">#{pkg.orderId.slice(-12).toUpperCase()}</div>
                    </div>
                    <div className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                      <Clock size={14} className="opacity-40" /> INITIATED {format(new Date(pkg.order.createdAt), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-surface-container-low rounded-[28px] flex items-center justify-center border-2 border-outline-variant/5 shrink-0 group-hover:scale-105 group-hover:border-primary-container/30 transition-all duration-1000 shadow-inner">
                        <Box size={32} className="text-on-surface-variant/10 group-hover:text-primary-container transition-colors duration-500" />
                      </div>
                      <div className="max-w-[340px]">
                        <h4 className="font-black text-base text-on-surface tracking-tighter uppercase truncate mb-2 leading-none">
                          {(pkg.lines[0]?.variant as any)?.product?.title || 'ASSORTED ASSET BUNDLE'}
                        </h4>
                        {pkg.lines.length > 1 ? (
                          <div className="text-[9px] text-primary-container font-black uppercase tracking-[0.2em] italic bg-primary-container/10 px-3 py-1 rounded-xl inline-block border border-primary-container/20">+{pkg.lines.length - 1} SUPPLEMENTARY ASSETS</div>
                        ) : (
                          <div className="text-[9px] text-on-surface-variant/20 font-black uppercase tracking-[0.3em] italic">SINGLE LINE ITEM NODE</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="text-2xl font-black text-on-surface tracking-tighter leading-none mb-3">₦{Number(pkg.order.total).toLocaleString()}</div>
                    <div className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.3em] italic">
                      VIA {pkg.order.paymentMethod || 'SYSTEM LEDGER'}
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`inline-flex items-center px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border-2 shadow-sm italic transition-all duration-700 ${
                      pkg.status === 'PENDING' ? 'bg-primary-container/10 text-primary-container border-primary-container/20' :
                      pkg.status === 'IN_TRANSIT' ? 'bg-secondary-container/10 text-secondary border-secondary/20' :
                      pkg.status === 'DELIVERED' ? 'bg-success-container/10 text-success border-success/20' :
                      'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-3 ${['PENDING', 'IN_TRANSIT', 'READY_FOR_PICKUP'].includes(pkg.status) ? 'bg-current animate-pulse' : 'bg-current'}`} />
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <div className="flex items-center justify-end gap-6">
                      {pkg.status === 'PENDING' && (
                        <button 
                          onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'READY_FOR_PICKUP' })}
                          disabled={updateStatus.isPending}
                          className="bg-on-surface text-white px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-container transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center gap-4 group/btn"
                        >
                          <CheckCircle2 size={18} className="group-hover/btn:scale-125 transition-transform duration-500" />
                          Validate Inbound
                        </button>
                      )}
                      {pkg.status === 'READY_FOR_PICKUP' && (
                        <button 
                          onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'PICKED_UP' })}
                          disabled={updateStatus.isPending}
                          className="bg-primary-container text-on-primary-container px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center gap-4 group/btn"
                        >
                          <Truck size={18} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
                          Hub Handover
                        </button>
                      )}
                      {pkg.status === 'PICKED_UP' && (
                        <div className="flex items-center gap-6 animate-in slide-in-from-right-8 duration-700">
                          <div className="relative group/input">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-focus-within/input:opacity-100 transition-all duration-500" size={18} />
                            <input 
                              type="text" 
                              placeholder="MANIFEST ID" 
                              value={trackingNumbers[pkg.id] || ''}
                              onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                              className="text-[10px] font-black bg-surface-container-low border-4 border-surface-container-lowest rounded-[24px] pl-14 pr-6 py-5 w-48 focus:border-primary-container/50 outline-none uppercase tracking-[0.3em] transition-all shadow-inner"
                            />
                          </div>
                          <button 
                            onClick={() => updateStatus.mutate({ 
                              packageId: pkg.id, 
                              status: 'SHIPPED',
                              trackingNumber: trackingNumbers[pkg.id]
                            })}
                            disabled={updateStatus.isPending || !trackingNumbers[pkg.id]}
                            className="bg-success text-white px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-success/90 transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center gap-4 group/btn"
                          >
                            <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
                            Dispatch
                          </button>
                        </div>
                      )}
                      {(pkg.status === 'SHIPPED' || pkg.status === 'IN_TRANSIT') && (
                        <div className="flex items-center gap-4 bg-success-container/10 border-4 border-success/20 px-10 py-5 rounded-[24px] shadow-soft animate-in zoom-in-95 duration-700">
                          <CheckCircle2 size={18} className="text-success animate-pulse" />
                          <span className="text-[10px] font-black text-success uppercase tracking-[0.4em] italic leading-none">Node Transmitting</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!filteredPackages || filteredPackages.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-12 py-40 text-center opacity-40">
                    <div className="flex flex-col items-center gap-10 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-1000">
                      <div className="w-32 h-32 bg-surface-container-low rounded-[48px] flex items-center justify-center border-4 border-surface-container-lowest text-on-surface-variant shadow-inner group">
                        <ShieldCheck size={64} strokeWidth={1} className="opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-black text-3xl text-on-surface tracking-tighter uppercase leading-none">Pipeline Dormant</h4>
                        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">System awaiting inbound logistics triggers. All current sectors reporting clear fulfillment telemetry.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
