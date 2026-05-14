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
 AlertCircle,
 Activity,
 ShieldCheck,
 Zap,
 ArrowRight,
 X
} from 'lucide-react';
import { format } from 'date-fns';
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
      <div className="bg-j-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-j-border border-t-jumia-orange rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase text-j-text-muted tracking-widest animate-pulse">Loading Wallet...</p>
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
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8">
        <Link 
          href="/account" 
          className="flex items-center gap-2 text-j-text-muted hover:text-j-text transition-colors font-black text-[10px] uppercase tracking-widest mb-8 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Account
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Wallet Card */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-j-text rounded-sm p-10 text-white relative overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-64 h-64 bg-jumia-orange/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center border border-white/10 shadow-lg">
                      <Wallet size={24} className="text-jumia-orange" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Jumia Wallet</span>
                      <span className="text-[9px] font-black uppercase text-white/20 tracking-tighter">{session?.user?.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-sm border border-white/10">
                    <ShieldCheck size={16} className="text-j-success" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Secure</span>
                  </div>
                </div>

                <div className="mb-10">
                  <p className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Available Balance</p>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-white">
                    ₦{(wallet as any)?.balance?.toLocaleString() || '0.00'}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setIsTopUpOpen(true)}
                    className="h-14 flex-1 bg-jumia-orange text-white rounded-sm font-black text-[11px] uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg hover:bg-orange-600"
                  >
                    <Plus size={20} /> Top Up Wallet
                  </button>
                  <button 
                    onClick={() => setIsWithdrawOpen(true)}
                    className="h-14 flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-sm font-black text-[11px] uppercase tracking-widest transition-all transform active:scale-95"
                  >
                    Withdraw Funds
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-background">
                <div className="flex items-center gap-3">
                  <History size={20} className="text-jumia-orange" />
                  <h3 className="text-sm font-black text-j-text uppercase tracking-widest">Transaction History</h3>
                </div>
                <div className="text-[9px] font-black text-j-text-muted uppercase tracking-widest opacity-40">Last 30 Days</div>
              </div>

              <div className="divide-y divide-j-border">
                {transactions.length > 0 ? (
                  transactions.map((tx: any, idx: number) => (
                    <div key={tx.id} 
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-j-background transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center border transition-all ${
                          tx.type === 'CREDIT' ? 'bg-green-50 text-j-success border-green-100' : 'bg-orange-50 text-jumia-orange border-orange-100'
                        }`}>
                          {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-sm text-j-text uppercase tracking-tight mb-1 group-hover:text-jumia-orange transition-colors">{tx.description || tx.type}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-black text-j-text-muted uppercase tracking-tighter">
                              {format(new Date(tx.createdAt), 'dd MMM yyyy')}
                            </p>
                            <span className="w-1 h-1 bg-j-border rounded-full" />
                            <p className="text-[9px] font-black text-j-text-muted/40 uppercase tracking-tighter">ID: {tx.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className={`text-xl font-black tracking-tight ${
                          tx.type === 'CREDIT' ? 'text-j-success' : 'text-j-text'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                        </p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${
                          tx.status === 'COMPLETED' ? 'bg-green-50 text-j-success border-green-100' : 'bg-orange-50 text-jumia-orange border-orange-100'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <History className="mx-auto text-j-border mb-6 opacity-30" size={64} />
                    <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-40 italic">No transactions found in your history.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-j-border rounded-sm p-8 shadow-sm">
              <Zap className="text-jumia-orange mb-6" size={28} />
              <h4 className="text-[11px] font-black text-j-text uppercase mb-3 tracking-widest">Speed & Convenience</h4>
              <p className="text-[10px] text-j-text-muted font-bold uppercase tracking-tight leading-relaxed opacity-70">
                Fund your wallet for faster checkouts and exclusive rewards on every purchase.
              </p>
            </div>

            <div className="bg-j-background border border-j-border rounded-sm p-8 border-dashed">
              <div className="flex items-center gap-3 text-j-text-muted mb-4 opacity-60">
                <AlertCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Security Tip</span>
              </div>
              <p className="text-[10px] text-j-text-muted font-bold uppercase tracking-tight leading-relaxed opacity-60 italic">
                Never share your wallet PIN or login details. Jumia will never ask for your password.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-orange-50 text-jumia-orange p-6 rounded-sm border border-orange-100 shadow-sm group">
              <Activity size={20} className="shrink-0 animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">System Status: All services are operational.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(isTopUpOpen || isWithdrawOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-sm border border-j-border w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-jumia-orange rounded-sm flex items-center justify-center border border-orange-100">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-xl font-black text-j-text uppercase tracking-tight">
                    {isTopUpOpen ? 'Top Up <span className="text-jumia-orange">Wallet</span>' : 'Withdraw <span className="text-jumia-orange">Funds</span>'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setIsTopUpOpen(false);
                    setIsWithdrawOpen(false);
                    setAmount('');
                  }}
                  className="p-2 hover:bg-j-background rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={isTopUpOpen ? handleTopUp : handleWithdraw} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-j-text-muted tracking-widest block ml-1 opacity-60">
                    Enter Amount (₦)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-j-text-muted opacity-20 group-focus-within:opacity-100 transition-opacity">₦</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-24 bg-j-background border-2 border-j-border rounded-sm pl-16 pr-6 font-black text-4xl focus:border-jumia-orange focus:outline-none transition-all text-j-text tracking-tighter"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-6 rounded-sm flex gap-4">
                  <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-jumia-orange shrink-0 border border-orange-100 shadow-sm">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="text-[9px] font-black text-j-text-muted uppercase tracking-widest leading-relaxed opacity-70 italic">
                    {isTopUpOpen 
                      ? 'You will be redirected to our secure payment partner to complete this transaction.' 
                      : 'Withdrawals are processed within 24-48 business hours to your linked bank account.'}
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={fundWallet.isLoading || withdraw.isLoading}
                  className="w-full h-16 bg-jumia-orange text-white rounded-sm font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:bg-orange-600 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
                >
                  {(fundWallet.isLoading || withdraw.isLoading) ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Proceed <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
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
