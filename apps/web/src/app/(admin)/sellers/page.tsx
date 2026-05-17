'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Users, Shield, ShieldAlert, CheckCircle2, XCircle, Search, Filter, MoreHorizontal, ArrowUpRight, Activity, Gavel, Star, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminSellersPage() {
  const utils = api.useUtils();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const { data: sellers, isLoading } = api.admin.listAllSellers.useQuery();
  
  const filteredSellers = sellers?.filter(s => {
    const matchesSearch = s.businessName.toLowerCase().includes(search.toLowerCase()) || 
      s.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = api.admin.updateSellerStatus.useMutation({
    onSuccess: () => utils.admin.listAllSellers.invalidate()
  });

  const approveKYC = api.admin.approveSeller.useMutation({
    onSuccess: () => utils.admin.listAllSellers.invalidate()
  });

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-j-border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-j-text text-white rounded-sm shadow-sm">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Seller Directory</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Seller <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage seller accounts, verification status, and performance</p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/40 group-focus-within:text-jumia-orange transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR EMAIL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-j-border rounded-sm outline-none focus:border-jumia-orange text-[10px] font-black text-j-text placeholder:text-j-text-muted/30 transition-all shadow-sm uppercase tracking-widest"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 h-10 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-jumia-orange text-white border-jumia-orange shadow-md' 
                  : 'bg-white text-j-text-muted border-j-border hover:bg-j-background'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background text-[10px] font-black uppercase tracking-widest text-j-text-muted/50 border-b border-j-border">
                  <th className="px-8 py-5">Seller Details</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Seller Tier</th>
                  <th className="px-8 py-5">Join Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {filteredSellers?.map((seller) => (
                  <tr key={seller.id} className="hover:bg-j-background transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-xs text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors mb-1">
                        {seller.businessName}
                      </div>
                      <div className="text-[9px] font-black text-j-text-muted uppercase tracking-widest opacity-60">
                        {seller.user.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-all ${
                        seller.status === 'ACTIVE' 
                          ? 'bg-green-50 text-j-success border-green-100' 
                          : seller.status === 'SUSPENDED'
                          ? 'bg-red-50 text-j-error border-red-100'
                          : 'bg-orange-50 text-jumia-orange border-orange-100 animate-pulse'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${seller.status === 'ACTIVE' ? 'bg-j-success animate-pulse' : 'bg-j-text-muted/30'}`} />
                        {seller.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] font-black text-j-text uppercase tracking-widest opacity-60">{seller.tier}</div>
                        <div className="flex items-center gap-1 text-[9px] text-jumia-orange font-black">
                          <Star size={12} className="fill-jumia-orange" />
                          {Number(seller.rating).toFixed(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-j-text uppercase tracking-widest">{format(new Date(seller.createdAt), 'MMM dd, yyyy')}</span>
                        <span className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40">Join Date</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {seller.status === 'PENDING_VERIFICATION' && (
                          <Link 
                            href={`/kyc?sellerId=${seller.id}`}
                            className="p-2 bg-orange-50 text-jumia-orange hover:bg-jumia-orange hover:text-white rounded-sm border border-orange-100 transition-all shadow-sm"
                            title="Review Verification"
                          >
                            <Shield size={16} />
                          </Link>
                        )}
                        {seller.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => updateStatus.mutate({ sellerId: seller.id, status: 'SUSPENDED' })}
                            className="p-2 bg-red-50 text-j-error hover:bg-j-error hover:text-white rounded-sm border border-red-100 transition-all shadow-sm"
                            title="Suspend Seller"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateStatus.mutate({ sellerId: seller.id, status: 'ACTIVE' })}
                            className="p-2 bg-green-50 text-j-success hover:bg-j-success hover:text-white rounded-sm border border-green-100 transition-all shadow-sm"
                            title="Activate Seller"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button className="p-2 bg-white text-j-text-muted border border-j-border rounded-sm hover:border-j-text hover:text-j-text transition-all shadow-sm">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && sellers?.length === 0 && (
            <div className="py-24 text-center opacity-20">
              <Users size={48} className="mx-auto mb-6" />
              <h3 className="text-xl font-black text-j-text uppercase tracking-tight">No Sellers Found</h3>
              <p className="text-[10px] font-black uppercase tracking-widest">No sellers match your current filters.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <Gavel size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Seller <span className="text-jumia-orange">Policies</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  Ensure all seller actions comply with Jumia's vendor agreement. Status changes are logged for security and auditing purposes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Directory Active</span>
              <Activity size={16} className="text-jumia-orange animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
