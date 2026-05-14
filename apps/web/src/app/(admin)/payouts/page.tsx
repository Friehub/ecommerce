'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Banknote, Search, CheckCircle2, Clock, AlertCircle, ShieldCheck, Activity, ArrowRight, Gavel } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminPayoutsPage() {
  const utils = api.useUtils();
  const [search, setSearch] = React.useState('');
  const { showToast } = useToast();
  const { data: payouts, isLoading } = api.revenue.listAllPayouts.useQuery();
  
  const filteredPayouts = payouts?.filter(p => 
    p.seller.businessName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const approvePayout = api.revenue.approvePayout.useMutation({
    onSuccess: () => {
      utils.revenue.listAllPayouts.invalidate();
      showToast('Payout approved and transfer initiated!');
    },
    onError: (err) => {
      showToast(`Approval failed: ${err.message}`, 'error');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-sm" />
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
              <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
                <Banknote size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Financial Settlement</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Payout <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Review and approve seller withdrawal requests</p>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/40 group-focus-within:text-jumia-orange transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Seller Name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-white border border-j-border rounded-sm outline-none focus:border-jumia-orange text-xs font-bold text-j-text placeholder:text-j-text-muted/40 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background/50 text-[9px] font-black uppercase tracking-widest text-j-text-muted/60 border-b border-j-border">
                  <th className="px-8 py-5">Seller Details</th>
                  <th className="px-8 py-5">Payout Amount</th>
                  <th className="px-8 py-5">Request Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {filteredPayouts?.map((payout) => (
                  <tr key={payout.id} className="hover:bg-j-background/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-black text-sm text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors mb-1">
                        {payout.seller.businessName}
                      </div>
                      <div className="text-[10px] font-black text-j-text-muted/40 uppercase tracking-widest">
                        ID: {payout.id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-lg font-black text-j-text tracking-tight">
                        ₦{Number(payout.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-j-text uppercase tracking-widest">{format(new Date(payout.createdAt), 'MMM dd, yyyy')}</span>
                        <span className="text-[9px] font-black text-j-text-muted/40 uppercase tracking-tight italic">{format(new Date(payout.createdAt), 'HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        payout.status === 'SUCCESS' || payout.status === 'COMPLETED'
                          ? 'bg-green-50 text-j-success border-green-100' 
                          : payout.status === 'FAILED'
                          ? 'bg-red-50 text-j-error border-red-100'
                          : 'bg-orange-50 text-jumia-orange border-orange-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          payout.status === 'PENDING' ? 'bg-orange-400 animate-pulse' : 
                          payout.status === 'PROCESSING' ? 'bg-jumia-orange animate-spin' :
                          (payout.status === 'SUCCESS' || payout.status === 'COMPLETED') ? 'bg-j-success' : 'bg-j-error'
                        }`} />
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {payout.status === 'PENDING' && (
                        <button 
                          onClick={() => approvePayout.mutate({ payoutId: payout.id })}
                          disabled={approvePayout.isPending}
                          className="h-10 px-6 bg-jumia-orange text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-30 group/btn inline-flex items-center justify-center gap-2"
                        >
                          {approvePayout.isPending && (approvePayout as any).variables?.payoutId === payout.id ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : 'Approve Payout'}
                        </button>
                      )}
                      {payout.bankRef && (
                        <div className="inline-flex items-center gap-2 text-[9px] text-j-text-muted/40 font-black uppercase bg-j-background px-3 py-1.5 rounded-sm border border-j-border tracking-tight" title="Settlement Reference">
                          REF: {payout.bankRef.toUpperCase()}
                        </div>
                      )}
                      {(payout.status === 'SUCCESS' || payout.status === 'COMPLETED') && !payout.bankRef && (
                        <div className="w-10 h-10 bg-green-50 text-j-success rounded-sm flex items-center justify-center border border-green-100 ml-auto">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(!isLoading && filteredPayouts?.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-j-background rounded-full flex items-center justify-center border border-j-border mb-2 opacity-20">
                          <Banknote size={32} />
                        </div>
                        <h3 className="text-xl font-black text-j-text uppercase tracking-tight">Queue All Clear</h3>
                        <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">All seller payout requests have been processed and logged.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info Section */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <Gavel size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Payment <span className="text-jumia-orange">Standards</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  All payout authorizations are final and securely logged to the audit system. Ensure bank details are verified before approving large settlements.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">System Active</span>
              <Activity size={16} className="text-jumia-orange animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
