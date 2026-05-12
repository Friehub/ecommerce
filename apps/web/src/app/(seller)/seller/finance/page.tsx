'use client';

import { api } from '@/trpc/react';
import { 
  Wallet, 
  ArrowUpRight, 
  Info,
  Download,
  Loader2,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  History,
  TrendingUp,
  ExternalLink,
  Lock,
  ArrowDownLeft,
  Receipt,
  PiggyBank,
  Sparkles,
  Zap,
  Globe,
  Banknote,
  Cpu
} from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function SellerFinance() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const { data: stats, isLoading: statsLoading } = api.revenue.getMyStats.useQuery();
  const { data: payouts, isLoading: payoutsLoading } = api.revenue.listMyPayouts.useQuery();
  const { data: account } = api.revenue.getPayoutAccount.useQuery();
  const { data: ledger, isLoading: ledgerLoading } = api.revenue.getLedger.useQuery({ limit: 10 });
  const { refetch: fetchExportData } = api.revenue.exportLedger.useQuery(undefined, { enabled: false });

  const { toast } = useToast();
  const utils = api.useUtils();

  const requestPayout = api.revenue.requestPayout.useMutation({
    onSuccess: () => {
      utils.revenue.getMyStats.invalidate();
      utils.revenue.listMyPayouts.invalidate();
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      toast({
        title: 'PAYOUT INITIATED',
        description: 'Your withdrawal request has been queued for processing.',
        variant: 'default',
      });
    },
    onError: (err) => {
      toast({
        title: 'PAYOUT FAILED',
        description: err.message || 'Verification system encountered an error.',
        variant: 'destructive',
      });
      setIsWithdrawing(false);
    }
  });

  const updateAccount = api.revenue.updatePayoutAccount.useMutation({
    onSuccess: () => {
      utils.revenue.getPayoutAccount.invalidate();
      toast({
        title: 'ACCOUNT SYNCHRONIZED',
        description: 'Your payout credentials have been updated successfully.',
      });
    }
  });

  const handleExport = async () => {
    const { data } = await fetchExportData();
    if (!data) return;
    
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Status', 'Reference'];
    const rows = data.map(e => [
      e.id,
      format(new Date(e.date), 'yyyy-MM-dd HH:mm:ss'),
      e.type,
      e.amount,
      e.currency,
      e.status,
      e.reference
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-statement-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'INVALID AMOUNT', description: 'Please specify a valid numeric value.', variant: 'destructive' });
      return;
    }
    if (amount > Number(stats?.availableBalance || 0)) {
      toast({ title: 'INSUFFICIENT FUNDS', description: 'Amount exceeds your available withdrawal balance.', variant: 'destructive' });
      return;
    }
    
    setIsWithdrawing(true);
    requestPayout.mutate({ amount });
  };

  if (statsLoading || payoutsLoading || ledgerLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
            <Skeleton className="h-16 w-96 rounded-[24px]" />
            <Skeleton className="h-6 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-20 w-80 rounded-[32px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-[48px]" />
          ))}
        </div>
        <div className="space-y-16">
          <Skeleton className="h-[600px] w-full rounded-[64px]" />
          <Skeleton className="h-[400px] w-full rounded-[64px]" />
        </div>
      </div>
    );
  }

  const financeStats = [
    { 
      name: 'Total Liquidity', 
      value: `₦${(Number(stats?.availableBalance || 0) + Number(stats?.pendingBalance || 0)).toLocaleString()}`, 
      icon: Banknote, 
      color: 'text-on-surface',
      badge: 'bg-surface-container-low text-on-surface-variant/40 border-outline-variant/10',
      description: 'TOTAL CAPITAL VALUE'
    },
    { 
      name: 'Withdrawal Ready', 
      value: `₦${Number(stats?.availableBalance || 0).toLocaleString()}`, 
      icon: Zap, 
      color: 'text-success',
      badge: 'bg-success-container/10 text-success border-success/20',
      description: 'AVAILABLE FOR PAYOUT'
    },
    { 
      name: 'Escrow Holdings', 
      value: `₦${Number(stats?.pendingBalance || 0).toLocaleString()}`, 
      icon: Lock, 
      color: 'text-primary-container',
      badge: 'bg-primary-container/10 text-primary-container border-primary-container/20',
      description: 'AWAITING MATURITY'
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="animate-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-primary-container/20 backdrop-blur-xl rounded-2xl border border-primary-container/30">
              <Cpu size={24} className="text-primary-container" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-container italic">Automated Capital Management Nexus</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-on-surface uppercase tracking-tighter leading-[0.85]">
            Financial <br />
            <span className="text-primary-container italic">Engine.</span>
          </h1>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] mt-8 opacity-40 italic border-l-4 border-primary-container pl-8">Real-time Settlement Control • Advanced Revenue Synchronization</p>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          disabled={!stats?.availableBalance || Number(stats.availableBalance) <= 0}
          className="bg-on-surface text-white px-12 py-6 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-container transition-all shadow-2xl active:scale-95 disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center gap-4 group animate-in slide-in-from-right-8 duration-1000"
        >
          <ArrowUpRight size={20} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
          Execute Withdrawal
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {financeStats.map((stat, idx) => (
          <div key={stat.name} className="bg-surface-container-lowest p-10 rounded-[48px] border-4 border-surface-container-low flex flex-col justify-between h-[220px] hover:translate-y-[-12px] transition-all duration-700 shadow-soft group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 rounded-[24px] bg-surface-container-low flex items-center justify-center border-2 border-outline-variant/5 group-hover:scale-110 group-hover:border-primary-container/20 transition-all duration-1000 shadow-inner`}>
                <stat.icon className={stat.color} size={28} strokeWidth={2.5} />
              </div>
              <span className={`text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest border-2 italic shadow-sm ${stat.badge}`}>
                {stat.description}
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant/40 text-[9px] font-black uppercase tracking-[0.4em] mb-3 italic">{stat.name}</p>
              <h3 className={`text-3xl font-black tracking-tighter leading-none ${stat.color}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* History Sections */}
      <div className="space-y-16">
        {/* Ledger */}
        <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="p-12 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-on-surface/5 rounded-2xl flex items-center justify-center border-2 border-on-surface/10">
                <History size={24} className="text-on-surface-variant" />
              </div>
              <div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.4em] leading-none mb-2">Audit Trail</h3>
                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] italic">Granular Resource Allocation Log</p>
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="bg-on-surface text-white px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all hover:bg-primary-container active:scale-95 shadow-lg group italic"
            >
              <Download size={16} className="group-hover:translate-y-0.5 transition-transform duration-500" />
              Export Assets
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b-4 border-surface-container-low text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] bg-surface-container-low/20 italic">
                  <th className="px-12 py-8">Timestamp</th>
                  <th className="px-12 py-8">Operation</th>
                  <th className="px-12 py-8">Resource ID</th>
                  <th className="px-12 py-8 text-right">Magnitude</th>
                  <th className="px-12 py-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-surface-container-low">
                {ledger?.entries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-surface-container-low/30 transition-all duration-700 group animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-12 py-10 text-on-surface-variant/40 text-[11px] font-black uppercase tracking-tight italic">
                      {format(new Date(entry.createdAt), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${Number(entry.amount) >= 0 ? 'bg-success/5 border-success/10 text-success' : 'bg-error/5 border-error/10 text-error'}`}>
                          {Number(entry.amount) >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                        </div>
                        <span className="text-[13px] font-black text-on-surface uppercase tracking-widest">{entry.type}</span>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-on-surface-variant/40 text-[11px] font-black uppercase tracking-[0.2em] italic">
                      {entry.orderLineId ? `#${entry.orderLineId.slice(-8).toUpperCase()}` : 'SYSTEM'}
                    </td>
                    <td className={`px-12 py-10 text-right font-black text-2xl tracking-tighter ${Number(entry.amount) >= 0 ? 'text-success' : 'text-error'}`}>
                      {Number(entry.amount) >= 0 ? '+' : ''}₦{Number(entry.amount).toLocaleString()}
                    </td>
                    <td className="px-12 py-10">
                      <span className={`inline-flex items-center px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border-2 shadow-sm italic ${
                        entry.status === 'AVAILABLE' ? 'bg-success-container/10 text-success border-success/20' : 'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payouts */}
        <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="p-12 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-on-surface/5 rounded-2xl flex items-center justify-center border-2 border-on-surface/10">
                <Receipt size={24} className="text-on-surface-variant" />
              </div>
              <div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.4em] leading-none mb-2">Settlement Pipeline</h3>
                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] italic">Active Capital Extraction Logistics</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b-4 border-surface-container-low text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] bg-surface-container-low/20 italic">
                  <th className="px-12 py-8">Request ID</th>
                  <th className="px-12 py-8">Execution Timestamp</th>
                  <th className="px-12 py-8">Net Settlement</th>
                  <th className="px-12 py-8">Authorization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-surface-container-low">
                {payouts?.map((payout, idx) => (
                  <tr key={payout.id} className="hover:bg-surface-container-low/30 transition-all duration-700 group animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-12 py-10">
                      <div className="text-[13px] font-black text-on-surface tracking-tighter uppercase leading-none italic opacity-60 group-hover:opacity-100 transition-opacity duration-500">#{payout.id.slice(0, 12).toUpperCase()}</div>
                    </td>
                    <td className="px-12 py-10 text-on-surface-variant/40 text-[11px] font-black uppercase tracking-tight italic">
                      {format(new Date(payout.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-12 py-10 font-black text-on-surface text-3xl tracking-tighter">
                      ₦{Number(payout.amount).toLocaleString()}
                    </td>
                    <td className="px-12 py-10">
                      <span className={`inline-flex items-center px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border-2 shadow-sm italic transition-all duration-700 ${
                        payout.status === 'COMPLETED' ? 'bg-success-container/10 text-success border-success/20' : 
                        payout.status === 'REJECTED' ? 'bg-error-container/10 text-error border-error/20' :
                        'bg-primary-container/10 text-primary-container border-primary-container/20'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${payout.status === 'COMPLETED' ? 'bg-success' : payout.status === 'REJECTED' ? 'bg-error' : 'bg-primary-container animate-pulse'}`} />
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout Credentials */}
        <div className="bg-on-surface rounded-[64px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 border-4 border-surface-container-low relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px]" />
          <div className="relative z-10">
            <div className="p-12 border-b-2 border-white/5 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-inner">
                  <CreditCard size={24} className="text-primary-container" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] leading-none mb-2">Settlement Nexus</h3>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">Institutional Credential Configuration</p>
                </div>
              </div>
            </div>
            <div className="p-14">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateAccount.mutate({
                    bankCode: formData.get('bankCode') as string,
                    accountNumber: formData.get('accountNumber') as string,
                    accountName: formData.get('accountName') as string,
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-12"
              >
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic ml-1">Merchant Institution</label>
                  <div className="relative group">
                    <Building2 size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-container transition-all duration-500" />
                    <select 
                      name="bankCode" 
                      defaultValue={account?.bankCode || ''}
                      className="w-full bg-white/5 border-4 border-white/5 rounded-[28px] pl-16 pr-8 py-6 text-[14px] font-black text-white uppercase tracking-tighter focus:outline-none focus:border-primary-container/20 focus:ring-8 focus:ring-primary-container/5 transition-all appearance-none cursor-pointer hover:bg-white/10"
                      required
                    >
                      <option value="" className="bg-on-surface">SELECT INSTITUTION</option>
                      <option value="044" className="bg-on-surface">ACCESS BANK</option>
                      <option value="058" className="bg-on-surface">GTBANK</option>
                      <option value="011" className="bg-on-surface">FIRST BANK</option>
                      <option value="033" className="bg-on-surface">UNITED BANK FOR AFRICA</option>
                      <option value="057" className="bg-on-surface">ZENITH BANK</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic ml-1">Vault Sequence</label>
                  <input 
                    name="accountNumber" 
                    type="text" 
                    defaultValue={account?.bankAccountNumber || ''}
                    placeholder="0000000000"
                    className="w-full bg-white/5 border-4 border-white/5 rounded-[28px] px-8 py-6 text-[14px] font-black text-white uppercase tracking-[0.3em] focus:outline-none focus:border-primary-container/20 focus:ring-8 focus:ring-primary-container/5 transition-all hover:bg-white/10 placeholder:text-white/10"
                    required 
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic ml-1">Legal Identity</label>
                  <input 
                    name="accountName" 
                    type="text" 
                    defaultValue={account?.bankAccountName || ''}
                    placeholder="MERCHANT NAME"
                    className="w-full bg-white/5 border-4 border-white/5 rounded-[28px] px-8 py-6 text-[14px] font-black text-white uppercase tracking-tighter focus:outline-none focus:border-primary-container/20 focus:ring-8 focus:ring-primary-container/5 transition-all hover:bg-white/10 placeholder:text-white/10"
                    required 
                  />
                </div>
                <div className="md:col-span-3 pt-10 border-t-2 border-white/5 flex justify-end">
                  <button 
                    type="submit"
                    disabled={updateAccount.isLoading}
                    className="bg-white text-on-surface px-14 py-6 rounded-[28px] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary-container hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center gap-6 group"
                  >
                    {updateAccount.isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} className="group-hover:scale-125 transition-transform duration-500" />}
                    Synchronize Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/90 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-[64px] border-8 border-surface-container-low shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 relative">
            <div className="p-12 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center border-2 border-primary-container/20 shadow-inner">
                  <PiggyBank size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.4em] leading-none mb-2">Settlement Request</h3>
                  <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] italic">Execute Capital Extraction</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="w-12 h-12 rounded-full hover:bg-error/10 hover:text-error flex items-center justify-center transition-all duration-500 border-2 border-transparent hover:border-error/20"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-14 space-y-12">
              <div className="bg-surface-container-low p-10 rounded-[40px] border-2 border-outline-variant/5 shadow-inner">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-6 italic ml-1">Institutional Destination</p>
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-on-surface text-white rounded-[24px] flex items-center justify-center shadow-2xl border-4 border-surface-container-low">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">{account?.bankAccountName || 'NO ACCOUNT LINKED'}</h4>
                    <p className="text-[11px] font-black text-on-surface-variant/40 tracking-[0.3em] uppercase italic flex items-center gap-3">
                      <Globe size={14} className="opacity-40" /> {account?.bankAccountNumber || '••••••••••'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end px-4">
                  <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic">Request Magnitude (₦)</label>
                  <p className="text-[10px] font-black text-success uppercase tracking-[0.3em] border-b-2 border-success/20 pb-1 italic">MAX: ₦{Number(stats?.availableBalance || 0).toLocaleString()}</p>
                </div>
                <div className="relative group">
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-on-surface-variant/10 group-focus-within:text-primary-container/20 transition-colors duration-500 italic">₦</span>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-container-low border-4 border-outline-variant/5 rounded-[36px] pl-20 pr-10 py-10 text-6xl font-black text-on-surface tracking-tighter focus:outline-none focus:border-primary-container/20 focus:ring-[24px] focus:ring-primary-container/5 transition-all shadow-inner placeholder:text-on-surface-variant/5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 p-8 bg-primary-container/5 rounded-[32px] border-2 border-primary-container/10 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                  <Info size={20} className="text-primary-container" />
                </div>
                <p className="text-[11px] font-black text-on-surface-variant/60 uppercase tracking-[0.1em] italic leading-relaxed">
                  Institutional latency typically range between <span className="text-primary-container">24-48 business cycles</span> for full synchronization of assets.
                </p>
              </div>

              <button 
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount}
                className="w-full bg-on-surface text-white py-8 rounded-[36px] text-[13px] font-black uppercase tracking-[0.5em] hover:bg-primary-container transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-6 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                {isWithdrawing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} className="group-hover:scale-125 transition-transform duration-500" />}
                <span className="relative z-10 italic">Authorize Extraction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
