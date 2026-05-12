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
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
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
      showToast(err.message, 'error');
    }
  });

  const withdraw = api.payment.withdraw.useMutation({
    onSuccess: () => {
      setIsWithdrawOpen(false);
      setAmount('');
      showToast('Withdrawal request submitted successfully.');
      utils.payment.getWallet.invalidate();
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || walletLoading) {
    return (
      <div className="bg-background min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-[32px]" />
              <Skeleton className="h-96 rounded-[32px]" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 rounded-[24px]" />
              <Skeleton className="h-40 rounded-[24px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const transactions = (wallet as any)?.transactions || [];

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      showToast('Minimum top up amount is ₦100', 'error');
      return;
    }
    fundWallet.mutate({ amount: numAmount });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      showToast('Minimum withdrawal amount is ₦1,000', 'error');
      return;
    }
    withdraw.mutate({ amount: numAmount });
  };

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container font-black text-xs uppercase tracking-widest mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Account
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Wallet Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1A1A1A] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/10">
                      <Wallet size={20} className="text-primary-container" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Jumia Wallet</span>
                  </div>
                  <CreditCard size={24} className="text-white/20" />
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Available Balance</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                    ₦{(wallet as any)?.balance?.toLocaleString() || '0.00'}
                  </h2>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsTopUpOpen(true)}
                    className="flex-1 bg-primary-container hover:opacity-90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20"
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
            <div className="bg-surface-container-lowest rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest flex items-center gap-2">
                  <History size={18} className="text-primary-container" /> Transaction History
                </h3>
              </div>

              <div className="divide-y divide-outline-variant/30">
                {transactions.length > 0 ? (
                  transactions.map((tx: any, idx: number) => (
                    <div key={tx.id} 
                      className="p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors animate-in fade-in slide-in-from-left-4 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          tx.type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{tx.description || tx.type}</p>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${
                          tx.type === 'CREDIT' ? 'text-green-600' : 'text-on-surface'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-0.5">{tx.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <History className="mx-auto text-outline-variant mb-4" size={48} />
                    <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest">No transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-surface-container-low border border-primary-container/20 rounded-[24px] p-6">
              <TrendingUp className="text-primary-container mb-4" size={24} />
              <h4 className="text-xs font-black text-on-surface uppercase tracking-widest mb-2">Smart Savings</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                Fund your wallet to enjoy faster checkout and exclusive discounts on selected Jumia Express items.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Security Tip</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">
                Never share your wallet PIN or login credentials with anyone. Jumia will never ask for your password via phone or email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(isTopUpOpen || isWithdrawOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-on-surface uppercase tracking-widest">
                  {isTopUpOpen ? 'Wallet Top Up' : 'Request Withdrawal'}
                </h3>
                <button 
                  onClick={() => {
                    setIsTopUpOpen(false);
                    setIsWithdrawOpen(false);
                    setAmount('');
                  }}
                  className="text-on-surface-variant hover:text-on-surface p-1 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={isTopUpOpen ? handleTopUp : handleWithdraw} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block mb-2">
                    Enter Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-on-surface-variant">₦</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-surface-container-low border-2 border-outline-variant rounded-2xl py-4 pl-10 pr-4 font-black text-xl focus:border-primary-container focus:outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTopUpOpen 
                    ? 'You will be redirected to our secure payment gateway to complete your transaction.' 
                    : 'Withdrawals are processed within 24-48 business hours to your registered bank account.'}
                </p>

                <button 
                  type="submit"
                  disabled={fundWallet.isLoading || withdraw.isLoading}
                  className="w-full bg-primary-container hover:opacity-90 disabled:bg-surface-container text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
                >
                  {(fundWallet.isLoading || withdraw.isLoading) ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
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
