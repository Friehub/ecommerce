'use client';

import React from 'react';
import { api } from '../../../trpc/react';
import { Banknote, CheckCircle, Clock, AlertTriangle, ExternalLink, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPayoutsPage() {
  const utils = api.useUtils();
  const { data: payouts, isLoading } = api.revenue.listAllPayouts.useQuery();
  
  const approvePayout = api.revenue.approvePayout.useMutation({
    onSuccess: () => {
      utils.revenue.listAllPayouts.invalidate();
      alert('Payout approved and transfer initiated!');
    },
    onError: (err) => {
      alert(`Approval failed: ${err.message}`);
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Banknote size={28} className="text-[#f68b1e]" />
            Payout Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve seller withdrawal requests.</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by business name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Requested On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : payouts?.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{payout.seller.businessName}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {payout.id.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ₦{Number(payout.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {format(new Date(payout.createdAt), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      payout.status === 'SUCCESS' 
                        ? 'bg-green-100 text-green-700' 
                        : payout.status === 'FAILED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payout.status === 'PENDING' && (
                      <button 
                        onClick={() => approvePayout.mutate({ payoutId: payout.id })}
                        disabled={approvePayout.isLoading}
                        className="bg-[#282828] text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                      >
                        {approvePayout.isLoading && (approvePayout as any).variables?.payoutId === payout.id ? 'Approving...' : 'Approve & Pay'}
                      </button>
                    )}
                    {payout.bankRef && (
                      <div className="text-[10px] text-gray-400 font-mono" title="Bank Reference">
                        Ref: {payout.bankRef}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && payouts?.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm italic">
              No payout requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
