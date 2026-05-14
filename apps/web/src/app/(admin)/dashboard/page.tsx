'use client';

import { api } from '@/trpc/react';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  Activity, 
  DollarSign,
  Briefcase,
  Box,
  Layers,
  Search,
  MoreVertical,
  ShieldAlert,
  Gavel
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const { data: metrics, isLoading: metricsLoading } = api.ops.getGlobalMetrics.useQuery();
  const { data: pendingSellers, isLoading: kycLoading } = api.admin.getPendingSellers.useQuery();
  const { data: disputes, isLoading: disputesLoading } = api.admin.getDisputeQueue.useQuery();

  const approveSellerMutation = api.admin.approveSeller.useMutation({
    onSuccess: () => {
      utils.admin.getPendingSellers.invalidate();
      toast({
        title: 'Seller Approved',
        description: 'The seller account has been successfully activated.',
        type: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'Approval Failed',
        description: err.message || 'System error while approving seller.',
        type: 'error',
      });
    }
  });

  const isLoading = metricsLoading || kycLoading || disputesLoading;

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
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Administration</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Admin <span className="text-jumia-orange">Dashboard</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Platform statistics and administrative oversight</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">System Status: Online</span>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-j-text text-white p-8 rounded-sm shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-white/40">
                <Activity size={16} />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-white/60">Live Users</h3>
              </div>
              <p className="text-4xl font-black tracking-tight mb-2 leading-none">{metrics?.activeSessions || 0}</p>
              <div className="flex items-center gap-2 text-green-400 text-[9px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-full">
                <Activity size={12} className="animate-pulse" /> Normal Load
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-5">
              <Users size={80} />
            </div>
          </div>

          {[
            { label: '30D Sales', value: `₦ ${(metrics?.totalGmv30d || 0).toLocaleString()}`, icon: DollarSign, sub: 'Total Revenue' },
            { label: 'Active Sellers', value: metrics?.activeSellers || 0, icon: Users, sub: 'Verified Sellers' },
            { label: 'Open Disputes', value: metrics?.openDisputes || 0, icon: AlertTriangle, sub: 'Pending Resolution', color: 'text-j-error', href: '/admin/admin/disputes' }
          ].map((kpi, i) => (
            <Link key={i} href={kpi.href || '#'} className={`block group ${!kpi.href && 'pointer-events-none'}`}>
              <div className="h-full bg-white p-8 rounded-sm border border-j-border shadow-sm transition-all hover:border-jumia-orange/30 flex flex-col justify-between">
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
                  {kpi.href && <ArrowRight size={14} className="text-j-text-muted/20 group-hover:text-jumia-orange group-hover:translate-x-1 transition-all" />}
                </div>
                <p className={`text-2xl font-black tracking-tight uppercase leading-none ${kpi.color || 'text-j-text'}`}>{kpi.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Management Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seller Verifications */}
          <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden">
            <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-background/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                  <ShieldCheck size={20} className="text-jumia-orange" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Seller Verifications</h3>
                  <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60 tracking-wider">Pending Account Approval</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-j-text text-white rounded-full text-[9px] font-black tracking-widest shadow-sm">
                {pendingSellers?.length || 0} PENDING
              </div>
            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {pendingSellers?.map(seller => (
                <div key={seller.id} className="flex justify-between items-center p-4 bg-j-background/40 border border-j-border rounded-sm group hover:border-jumia-orange/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-j-text-muted border border-j-border group-hover:text-jumia-orange transition-colors">
                      <Briefcase size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-j-text uppercase tracking-tight mb-1">{seller.businessName}</h4>
                      <p className="text-[9px] font-black text-j-text-muted/40 uppercase tracking-widest">{seller.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => approveSellerMutation.mutate({ sellerId: seller.id })}
                    disabled={approveSellerMutation.isPending}
                    className="bg-green-50 text-j-success border border-green-100 p-2 rounded-sm hover:bg-j-success hover:text-white transition-all disabled:opacity-50 shadow-sm"
                    title="Approve Seller"
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              ))}
              {(!pendingSellers || pendingSellers.length === 0) && (
                <div className="py-24 text-center space-y-4 opacity-20">
                  <CheckCircle size={40} className="mx-auto" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No pending verifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Disputes */}
          <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden">
            <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-background/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                  <AlertTriangle size={20} className="text-j-error" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Customer Disputes</h3>
                  <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60 tracking-wider">Active Resolution Required</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-j-error text-white rounded-full text-[9px] font-black tracking-widest shadow-sm">
                {disputes?.length || 0} ACTIVE
              </div>
            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {disputes?.map(dispute => (
                <div key={dispute.id} className="p-4 bg-j-background/40 border border-j-border rounded-sm group hover:border-j-error/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-50 text-j-error border border-red-100 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest">
                          {dispute.status}
                        </span>
                        <span className="text-[9px] font-black text-j-text-muted/40 uppercase italic tracking-tight">
                          Order #{dispute.orderId.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-j-text uppercase tracking-tight group-hover:text-j-error transition-colors leading-tight">{dispute.reason}</h4>
                    </div>
                    <Link
                      href={`/admin/admin/disputes/${dispute.id}`}
                      className="p-2 bg-white text-j-text-muted/40 hover:text-jumia-orange border border-j-border rounded-sm transition-all shadow-sm"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
              {(!disputes || disputes.length === 0) && (
                <div className="py-24 text-center space-y-4 opacity-20">
                  <Layers size={40} className="mx-auto" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No active disputes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info section */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <ShieldCheck size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Platform <span className="text-jumia-orange">Policies</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  All administrative actions and account status updates are logged for audit purposes. Ensure compliance with platform guidelines before approving or suspending seller accounts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">System Security Active</span>
              <Activity size={16} className="text-jumia-orange animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
