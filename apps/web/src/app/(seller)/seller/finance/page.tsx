'use client';

import { api } from '@/trpc/react';
import { 
  Wallet, 
  ArrowUpRight, 
  Info,
  Download,
  Loader2,
  CheckCircle2
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
      <div className="flex items-center justify-center h-64 select-none">
        <Loader2 className="animate-spin text-[#F68B1E]" size={32} />
      </div>
    );
  }

  const financeStats = [
    { 
      name: 'Total Balance', 
      value: `₦${(Number(stats?.availableBalance || 0) + Number(stats?.pendingBalance || 0)).toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-gray-900',
      bgColor: 'bg-orange-50 text-[#F68B1E] border-orange-100/50'
    },
    { 
      name: 'Available for Withdrawal', 
      value: `₦${Number(stats?.availableBalance || 0).toLocaleString()}`, 
      icon: ArrowUpRight, 
      color: 'text-green-600',
      bgColor: 'bg-green-50 text-green-600 border-green-100/50'
    },
    { 
      name: 'Pending Escrow', 
      value: `₦${Number(stats?.pendingBalance || 0).toLocaleString()}`, 
      icon: Info, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100/50'
    },
  ];

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial Overview</h1>
          <p className="text-gray-400 font-medium text-sm mt-1">Track your earnings, commissions, and payouts securely.</p>
        </div>
        <button 
          onClick={handleWithdraw}
          disabled={isWithdrawing || !stats?.availableBalance || Number(stats.availableBalance) <= 0}
          className="bg-[#F68B1E] hover:bg-[#e07a1a] text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed select-none h-11"
        >
          {isWithdrawing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          Request Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {financeStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start mb-2">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon size={22} />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-wide leading-tight mb-1">{stat.name}</p>
              <h3 className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all shadow-md overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide select-none">Payout Requests</h3>
          <button className="text-gray-400 hover:text-[#F68B1E] transition-all duration-200">
            <Download size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs font-extrabold uppercase tracking-wide bg-gray-50/30">
                <th className="px-6 py-4">Request ID & Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payouts?.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50/40 transition-all duration-150">
                  <td className="px-6 py-5">
                    <div className="text-xs font-extrabold text-gray-900 tracking-tight">#{payout.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-gray-400 text-xs font-medium mt-1">{new Date(payout.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-5 font-black text-gray-800 text-sm tracking-tight">
                    ₦{Number(payout.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-tight border ${
                      payout.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' : 
                      payout.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!payouts || payouts.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-xs font-medium italic">
                    No payout requests found.
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
