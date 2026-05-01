'use client';

import { api } from '@/trpc/react';
import { 
  Wallet, 
  ArrowUpRight, 
  Info,
  Download,
  Loader2
} from 'lucide-react';
import { useState } from 'react';

export default function SellerFinance() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { data: stats, isLoading: statsLoading } = api.revenue.getMyStats.useQuery();
  const { data: payouts, isLoading: payoutsLoading } = api.revenue.listMyPayouts.useQuery();
  
  const utils = api.useUtils();
  const requestPayout = api.revenue.requestPayout.useMutation({
    onSuccess: () => {
      utils.revenue.getMyStats.invalidate();
      utils.revenue.listMyPayouts.invalidate();
      setIsWithdrawing(false);
      alert('Payout request submitted successfully!');
    },
    onError: (err) => {
      alert(err.message || 'Failed to request payout');
      setIsWithdrawing(false);
    }
  });

  const handleWithdraw = () => {
    const amountStr = prompt('Enter amount to withdraw (₦):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsWithdrawing(true);
    requestPayout.mutate({ amount });
  };

  if (statsLoading || payoutsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#f68b1e]" size={32} />
      </div>
    );
  }

  const financeStats = [
    { 
      name: 'Total Balance', 
      value: `₦${(Number(stats?.availableBalance || 0) + Number(stats?.pendingBalance || 0)).toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-gray-900' 
    },
    { 
      name: 'Available for Withdrawal', 
      value: `₦${Number(stats?.availableBalance || 0).toLocaleString()}`, 
      icon: ArrowUpRight, 
      color: 'text-green-600' 
    },
    { 
      name: 'Pending Escrow', 
      value: `₦${Number(stats?.pendingBalance || 0).toLocaleString()}`, 
      icon: Info, 
      color: 'text-[#f68b1e]' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Track your earnings, commissions, and withdrawals.</p>
        </div>
        <button 
          onClick={handleWithdraw}
          disabled={isWithdrawing || !stats?.availableBalance || Number(stats.availableBalance) <= 0}
          className="bg-[#f68b1e] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#e67e17] transition-all shadow-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isWithdrawing && <Loader2 className="animate-spin" size={16} />}
          Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {financeStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded bg-gray-50 text-gray-400">
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
            <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Payout Requests</h3>
          <button className="text-gray-400 hover:text-gray-600 transition-all">
            <Download size={18} />
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Request ID & Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payouts?.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-50/50 transition-all">
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-gray-900">{payout.id}</div>
                  <div className="text-gray-400 text-[10px] mt-1">{new Date(payout.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-6 py-5 font-bold text-gray-900 text-xs">
                  ₦{Number(payout.amount).toLocaleString()}
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    payout.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 
                    payout.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!payouts || payouts.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500 text-xs italic">
                  No payout requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
