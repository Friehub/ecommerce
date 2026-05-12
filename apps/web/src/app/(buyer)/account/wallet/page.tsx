'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  History,
  ChevronLeft,
  Loader2,
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = api.useContext();
  
  const [isTopUpOpen, setIsTopUpOpen] = React.useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [amount, setAmount] = React.useState('');

  const { data: wallet, isLoading: walletLoading } = api.payment.getWallet.useQuery(undefined, {
    enabled: !!session
  });

  const fundWallet = api.payment.fundWallet.useMutation({
    onSuccess: (data: any) => {
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  const withdraw = api.payment.withdraw.useMutation({
    onSuccess: () => {
      setIsWithdrawOpen(false);
      setAmount('');
      alert('Withdrawal request submitted successfully.');
      utils.payment.getWallet.invalidate();
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  if (status === 'loading' || walletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FA]">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const transactions = (wallet as any)?.transactions || [];

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      alert('Minimum top up amount is ₦100');
      return;
    }
    fundWallet.mutate({ amount: numAmount });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      alert('Minimum withdrawal amount is ₦1,000');
      return;
    }
    withdraw.mutate({ amount: numAmount });
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#F68B1E] font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Account
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Wallet Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1A1A1A] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-black/20">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/10">
                      <Wallet size={20} className="text-[#F68B1E]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Jumia Wallet</span>
                  </div>
                  <CreditCard size={24} className="text-white/20" />
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Available Balance</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                    ₦{(wallet as any)?.balance?.toLocaleString() || '0.00'}
                  </h2>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsTopUpOpen(true)}
                    className="flex-1 bg-[#F68B1E] hover:bg-[#E07A1A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Top Up
                  </button>
                  <button 
                    onClick={() => setIsWithdrawOpen(true)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <History size={18} className="text-[#F68B1E]" /> Transaction History
                </h3>
              </div>

              <div className="divide-y divide-gray-50">
                {transactions.length > 0 ? (
                  transactions.map((tx: any) => (
                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          tx.type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{tx.description || tx.type}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${
                          tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">{tx.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <History className="mx-auto text-gray-100 mb-4" size={48} />
                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-6">
              <TrendingUp className="text-[#F68B1E] mb-4" size={24} />
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Smart Savings</h4>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Fund your wallet to enjoy faster checkout and exclusive discounts on selected Jumia Express items.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Security Tip</span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                Never share your wallet PIN or login credentials with anyone. Jumia will never ask for your password via phone or email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(isTopUpOpen || isWithdrawOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                  {isTopUpOpen ? 'Wallet Top Up' : 'Request Withdrawal'}
                </h3>
                <button 
                  onClick={() => {
                    setIsTopUpOpen(false);
                    setIsWithdrawOpen(false);
                    setAmount('');
                  }}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={isTopUpOpen ? handleTopUp : handleWithdraw} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Enter Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₦</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-10 pr-4 font-black text-xl focus:border-[#F68B1E] focus:outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {isTopUpOpen 
                    ? 'You will be redirected to our secure payment gateway to complete your transaction.' 
                    : 'Withdrawals are processed within 24-48 business hours to your registered bank account.'}
                </p>

                <button 
                  type="submit"
                  disabled={fundWallet.isLoading || withdraw.isLoading}
                  className="w-full bg-[#F68B1E] hover:bg-[#E07A1A] disabled:bg-gray-200 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {(fundWallet.isLoading || withdraw.isLoading) ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>Confirm {isTopUpOpen ? 'Payment' : 'Withdrawal'}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
