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
 ArrowRight
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
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Ledger Nodes</p>
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
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-5xl mx-auto px-6">
 <Link 
 href="/account" 
 className="flex items-center gap-3 text-on-surface-variant/40 hover:text-on-surface transition-colors font-semibold text-[10px] uppercase tracking-[0.4em] mb-12 group"
 >
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Back to Core Profile
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Main Wallet Card */}
 <div className="lg:col-span-8 space-y-10">
 <div className="bg-jumia-orange rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-jumia-orange/20 rounded-full blur-[120px] animate-pulse" />
 <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-success/10 rounded-full blur-[120px]" />
 
 <div className="relative z-10">
 <div className="flex items-center justify-between mb-12">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-white/5 backdrop-blur-2xl rounded-sm flex items-center justify-center border-2 border-white/10 shadow-2xl">
 <Wallet size={24} className="text-jumia-orange" />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/40 mb-1">Financial Node</span>
 <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/20">LOGGED AS {session?.user?.email?.toUpperCase()}</span>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border-2 border-white/10">
 <ShieldCheck size={18} className="text-jumia-orange" />
 <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Secured</span>
 </div>
 </div>

 <div className="mb-12">
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/30 mb-4 italic">Liquid Capital Reserves</p>
 <h2 className="text-6xl md:text-8xl font-semibold tracking-tighter leading-none">
 ₦{(wallet as any)?.balance?.toLocaleString() || '0.00'}
 </h2>
 </div>

 <div className="flex flex-col sm:flex-row gap-6">
 <button 
 onClick={() => setIsTopUpOpen(true)}
 className="h-20 flex-1 bg-jumia-orange text-white rounded font-semibold text-xs uppercase tracking-[0.4em] transition-all transform active:scale-95 flex items-center justify-center gap-4 shadow-2xl shadow-primary-container/20 group/btn"
 >
 <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" /> Inject Capital
 </button>
 <button 
 onClick={() => setIsWithdrawOpen(true)}
 className="h-20 flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded font-semibold text-xs uppercase tracking-[0.4em] transition-all transform active:scale-95 backdrop-blur-xl"
 >
 Withdraw Funds
 </button>
 </div>
 </div>
 </div>

 {/* Transaction History */}
 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
 <div className="p-10 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/30">
 <div className="flex items-center gap-4">
 <History size={24} className="text-jumia-orange" />
 <h3 className="text-sm font-semibold text-on-surface uppercase tracking-[0.3em]">Ledger History</h3>
 </div>
 <div className="text-[9px] font-semibold text-on-surface-variant/20 uppercase tracking-[0.4em] italic">Notifications Active</div>
 </div>

 <div className="divide-y-2 divide-surface-container-low">
 {transactions.length > 0 ? (
 transactions.map((tx: any, idx: number) => (
 <div key={tx.id} 
 className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-container-low/20 transition-all duration-500 group"
 >
 <div className="flex items-center gap-6 mb-4 md:mb-0">
 <div className={`w-14 h-14 rounded-sm flex items-center justify-center border-2 transition-all ${
 tx.type === 'CREDIT' ? 'bg-success/5 text-success border-success/10' : 'bg-jumia-orange/5 text-on-surface border-on-surface/10'
 }`}>
 {tx.type === 'CREDIT' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
 </div>
 <div>
 <p className="font-semibold text-lg text-on-surface uppercase tracking-tighter leading-none mb-2 group-hover:text-jumia-orange transition-colors">{tx.description?.toUpperCase() || tx.type}</p>
 <div className="flex items-center gap-3">
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-widest italic">
 {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
 </p>
 <div className="w-1 h-1 bg-surface-container-low rounded-full" />
 <p className="text-[9px] font-semibold text-on-surface-variant/20 uppercase tracking-[0.2em]">NODE: {tx.id.slice(-6).toUpperCase()}</p>
 </div>
 </div>
 </div>
 <div className="text-left md:text-right">
 <p className={`text-2xl font-semibold tracking-tighter ${
 tx.type === 'CREDIT' ? 'text-success' : 'text-on-surface'
 }`}>
 {tx.type === 'CREDIT' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
 </p>
 <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[8px] font-semibold uppercase tracking-widest border ${
 tx.status === 'COMPLETED' ? 'bg-success/5 text-success border-success/10' : 'bg-jumia-orange/5 text-jumia-orange border-jumia-orange/10'
 }`}>
 {tx.status}
 </span>
 </div>
 </div>
 ))
 ) : (
 <div className="p-32 text-center">
 <History className="mx-auto text-surface-container-low mb-10 opacity-40" size={80} />
 <p className="text-[10px] font-semibold text-on-surface-variant/20 uppercase tracking-[0.4em] italic">NO TRANSACTIONAL TELEMETRY DETECTED IN LEDGER.</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Sidebar Info */}
 <div className="lg:col-span-4 space-y-10">
 <div className="bg-surface-container-low border border-surface-container-low rounded p-10 animate-in fade-in slide-in-from-right-8 duration-700">
 <Zap className="text-jumia-orange mb-8" size={32} />
 <h4 className="text-[10px] font-semibold text-on-surface uppercase tracking-[0.4em] mb-4">Capital Velocity</h4>
 <p className="text-[11px] text-on-surface-variant/60 font-semibold uppercase tracking-widest leading-loose italic">
 FUND YOUR WALLET TO ACHIEVE NEAR-ZERO LATENCY CHECKOUTS AND UNLOCK SYSTEMIC DISCOUNTS ON ALL JUMIA EXPRESS INFRASTRUCTURE.
 </p>
 </div>

 <div className="bg-surface-container-lowest border border-surface-container-low rounded p-10 shadow-soft">
 <div className="flex items-center gap-3 text-on-surface-variant/40 mb-6">
 <AlertCircle size={20} />
 <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Security Protocol</span>
 </div>
 <p className="text-[11px] text-on-surface-variant/40 font-semibold uppercase tracking-widest leading-loose italic">
 NEVER TRANSMIT YOUR PIN OR CORE CREDENTIALS VIA NON-SECURE CHANNELS. JUMIA CENTRAL COMMAND WILL NEVER REQUEST ACCESS TO YOUR ENCRYPTED KEYSPACES.
 </p>
 </div>
 
 <div className="flex items-center gap-4 bg-jumia-orange text-white p-8 rounded shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-jumia-orange/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
 <Activity size={24} className="text-jumia-orange shrink-0 animate-pulse" />
 <p className="text-[9px] font-semibold uppercase tracking-[0.3em] opacity-60 leading-relaxed">REAL-TIME FINANCIAL SYNC ACTIVE ACROSS ALL NODES.</p>
 </div>
 </div>
 </div>
 </div>

 {/* Modals */}
 {(isTopUpOpen || isWithdrawOpen) && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-jumia-orange/80 backdrop-blur-2xl animate-in fade-in duration-500">
 <div className="bg-surface-container-lowest rounded-[64px] border-8 border-surface-container-low w-full max-w-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
 <div className="p-12 md:p-16">
 <div className="flex items-center justify-between mb-16">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-jumia-orange/10 text-jumia-orange rounded-2xl flex items-center justify-center border-2 border-jumia-orange/10">
 <Plus size={24} />
 </div>
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter">
 {isTopUpOpen ? 'Inject <span className="text-jumia-orange">Capital</span>' : 'Request <span className="text-jumia-orange">Withdrawal</span>'}
 </h3>
 </div>
 <button 
 onClick={() => {
 setIsTopUpOpen(false);
 setIsWithdrawOpen(false);
 setAmount('');
 }}
 className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error hover:text-white transition-all transform active:scale-90"
 >
 <Plus size={32} className="rotate-45" />
 </button>
 </div>

 <form onSubmit={isTopUpOpen ? handleTopUp : handleWithdraw} className="space-y-12">
 <div className="space-y-4">
 <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 block ml-2 italic">
 Transaction Magnitude (₦)
 </label>
 <div className="relative group">
 <span className="absolute left-10 top-1/2 -translate-y-1/2 font-semibold text-3xl text-on-surface-variant/20 group-focus-within:text-jumia-orange transition-colors">₦</span>
 <input 
 type="number"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 placeholder="0.00"
 className="w-full h-32 bg-surface-container-low/30 border border-surface-container-low rounded pl-24 pr-10 font-semibold text-5xl focus:border-jumia-orange focus:outline-none transition-all text-on-surface tracking-tighter"
 autoFocus
 />
 </div>
 </div>

 <div className="bg-jumia-orange/5 border-2 border-jumia-orange/10 p-8 rounded flex gap-5">
 <div className="w-10 h-10 bg-surface-container-lowest rounded-xl flex items-center justify-center text-jumia-orange shrink-0 border-2 border-jumia-orange/10">
 <ShieldCheck size={20} />
 </div>
 <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest leading-loose italic">
 {isTopUpOpen 
 ? 'YOU WILL BE ROUTED TO THE SECURE PAYMENT GATEWAY TO AUTHORIZE CAPITAL INJECTION.' 
 : 'WITHDRAWALS ARE PROCESSED WITHIN 24-48 HOURS TO YOUR REGISTERED FINANCIAL IDENTITY.'}
 </p>
 </div>

 <button 
 type="submit"
 disabled={fundWallet.isLoading || withdraw.isLoading}
 className="w-full h-24 bg-jumia-orange text-white rounded font-semibold text-sm uppercase tracking-[0.5em] transition-all shadow-2xl hover:bg-jumia-orange-dark active:scale-95 disabled:opacity-30 flex items-center justify-center gap-6 group"
 >
 {(fundWallet.isLoading || withdraw.isLoading) ? (
 <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
 ) : (
 <>Authorize Sequence <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></>
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
