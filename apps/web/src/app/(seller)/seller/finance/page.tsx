'use client';

import { trpc } from '@/utils/trpc';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Info,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const financeStats = [
  { name: 'Total Balance', value: '₦1,240,500', icon: Wallet, color: 'text-gray-900' },
  { name: 'Available for Withdrawal', value: '₦850,000', icon: ArrowUpRight, color: 'text-green-600' },
  { name: 'Pending Escrow', value: '₦390,500', icon: Info, color: 'text-[#f68b1e]' },
];

export default function SellerFinance() {
  // Mocking ledger data for now, would typically fetch from ledgerService via TRPC
  const transactions = [
    { id: 'TX-1001', type: 'SALE', amount: 12500, fee: 1250, net: 11250, date: new Date(), status: 'SUCCESS' },
    { id: 'TX-1002', type: 'SALE', amount: 45000, fee: 4500, net: 40500, date: new Date(), status: 'PENDING' },
    { id: 'TX-1003', type: 'WITHDRAWAL', amount: -200000, fee: 0, net: -200000, date: new Date(), status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Track your earnings, commissions, and withdrawals.</p>
        </div>
        <button className="bg-[#f68b1e] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#e67e17] transition-all shadow-sm uppercase">
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
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Transaction History</h3>
          <button className="text-gray-400 hover:text-gray-600 transition-all">
            <Download size={18} />
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Transaction ID & Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Gross Amount</th>
              <th className="px-6 py-4">Commission</th>
              <th className="px-6 py-4">Net Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-all">
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-gray-900">{tx.id}</div>
                  <div className="text-gray-400 text-[10px] mt-1">{format(tx.date, 'MMM d, yyyy • HH:mm')}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[10px] font-bold uppercase ${
                    tx.type === 'SALE' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-5 font-bold text-gray-900 text-xs">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-5 text-orange-600 text-xs font-bold">
                  {tx.fee > 0 ? `-₦${tx.fee.toLocaleString()}` : '—'}
                </td>
                <td className="px-6 py-5 font-bold text-gray-900 text-xs">
                  ₦{tx.net.toLocaleString()}
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
