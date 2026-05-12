'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Banknote, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface uppercase tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-primary-container/10 rounded-2xl">
              <Banknote size={32} className="text-primary-container" />
            </div>
            Payout Approvals
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 font-medium italic">Review and authorize premium seller withdrawal requests.</p>
        </div>
        
        <div className="relative group w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-container transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by business name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-outline-variant rounded-2xl focus:outline-none focus:border-primary-container text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[32px] shadow-soft border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant">
                <th className="px-8 py-6">Seller Details</th>
                <th className="px-8 py-6">Requested Amount</th>
                <th className="px-8 py-6">Date & Time</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredPayouts?.map((payout, idx) => (
                <tr key={payout.id} className="hover:bg-surface-container-low/50 transition-all group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="px-8 py-6">
                    <div className="font-black text-on-surface uppercase tracking-tight">{payout.seller.businessName}</div>
                    <div className="text-[10px] text-on-surface-variant font-black uppercase mt-1 tracking-widest bg-surface-container-low inline-block px-2 py-0.5 rounded-lg border border-outline-variant">ID: {payout.id.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-lg font-black text-on-surface tracking-tighter">
                      ₦{Number(payout.amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-on-surface uppercase tracking-tight">{format(new Date(payout.createdAt), 'dd MMM yyyy')}</span>
                      <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">{format(new Date(payout.createdAt), 'HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                      payout.status === 'SUCCESS' || payout.status === 'COMPLETED'
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : payout.status === 'FAILED'
                        ? 'bg-error-container text-error border-error/20'
                        : payout.status === 'PROCESSING'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        payout.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 
                        payout.status === 'PROCESSING' ? 'bg-blue-500 animate-spin' :
                        (payout.status === 'SUCCESS' || payout.status === 'COMPLETED') ? 'bg-green-500' : 'bg-error'
                      }`} />
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {payout.status === 'PENDING' && (
                      <button 
                        onClick={() => approvePayout.mutate({ payoutId: payout.id })}
                        disabled={approvePayout.isLoading}
                        className="bg-primary-container text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50"
                      >
                        {approvePayout.isLoading && (approvePayout as any).variables?.payoutId === payout.id ? 'Processing...' : 'Authorize Payout'}
                      </button>
                    )}
                    {payout.bankRef && (
                      <div className="inline-flex items-center gap-2 text-[10px] text-on-surface-variant font-black uppercase tracking-widest bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant" title="Bank Reference">
                        Ref: {payout.bankRef}
                      </div>
                    )}
                    {(payout.status === 'SUCCESS' || payout.status === 'COMPLETED') && !payout.bankRef && (
                       <CheckCircle2 size={18} className="text-green-500 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
              {(!isLoading && filteredPayouts?.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center border-2 border-outline-variant/30">
                        <Banknote size={40} className="text-outline-variant" strokeWidth={1} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">No Payouts Found</h3>
                        <p className="text-xs text-on-surface-variant font-medium italic">All seller withdrawal requests have been processed.</p>
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

