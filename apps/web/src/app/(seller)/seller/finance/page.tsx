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
 Cpu,
 TrendingDown
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
        title: 'Withdrawal Requested',
        description: 'Your payout request has been submitted successfully.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Withdrawal Failed',
        description: err.message || 'There was an error processing your request.',
        variant: 'destructive',
      });
      setIsWithdrawing(false);
    }
  });

  const updateAccount = api.revenue.updatePayoutAccount.useMutation({
    onSuccess: () => {
      utils.revenue.getPayoutAccount.invalidate();
      toast({
        title: 'Account Updated',
        description: 'Your bank account details have been saved.',
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
    a.download = `jumia-finance-statement-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }
    if (amount > Number(stats?.availableBalance || 0)) {
      toast({ title: 'Insufficient Funds', description: 'Amount exceeds available balance.', variant: 'destructive' });
      return;
    }
    
    setIsWithdrawing(true);
    requestPayout.mutate({ amount });
  };

  if (statsLoading || payoutsLoading || ledgerLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-sm" />
          ))}
        </div>
        <div className="space-y-12">
          <Skeleton className="h-[400px] w-full rounded-sm" />
          <Skeleton className="h-[300px] w-full rounded-sm" />
        </div>
      </div>
    );
  }

  const financeStats = [
    { 
      name: 'Total Balance', 
      value: `₦${(Number(stats?.availableBalance || 0) + Number(stats?.pendingBalance || 0)).toLocaleString()}`, 
      icon: Banknote, 
      color: 'text-j-text',
      badge: 'bg-j-background text-j-text-muted border-j-border',
      description: 'TOTAL CAPITAL'
    },
    { 
      name: 'Available for Payout', 
      value: `₦${Number(stats?.availableBalance || 0).toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-j-success',
      badge: 'bg-green-50 text-j-success border-green-100',
      description: 'WITHDRAWABLE'
    },
    { 
      name: 'Pending Balance', 
      value: `₦${Number(stats?.pendingBalance || 0).toLocaleString()}`, 
      icon: Lock, 
      color: 'text-jumia-orange',
      badge: 'bg-orange-50 text-jumia-orange border-orange-100',
      description: 'IN ESCROW'
    },
  ];

  return (
    <div className="max-w-[1184px] mx-auto space-y-12 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
              <CreditCard size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Financial Overview</span>
          </div>
          <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
            Payouts & <span className="text-jumia-orange">Revenue</span>
          </h1>
          <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage your earnings and withdrawal settings</p>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          disabled={!stats?.availableBalance || Number(stats.availableBalance) <= 0}
          className="bg-jumia-orange text-white px-8 h-14 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-20 flex items-center gap-3 group"
        >
          <ArrowUpRight size={18} />
          Request Payout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {financeStats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-sm border border-j-border flex flex-col justify-between h-[180px] hover:border-jumia-orange/30 transition-all shadow-sm group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-sm bg-j-background flex items-center justify-center border border-j-border group-hover:bg-white transition-colors">
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${stat.badge}`}>
                {stat.description}
              </span>
            </div>
            <div>
              <p className="text-j-text-muted text-[9px] font-black uppercase mb-1">{stat.name}</p>
              <h3 className={`text-2xl font-black tracking-tight leading-none ${stat.color}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* History Sections */}
      <div className="space-y-12">
        {/* Transaction History */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border">
                <History size={20} className="text-j-text-muted" />
              </div>
              <div>
                <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Transaction History</h3>
                <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Detailed record of all transactions</p>
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="bg-white text-j-text border border-j-border px-5 h-10 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-j-background transition-all shadow-sm"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-j-border text-j-text-muted text-[9px] font-black uppercase tracking-widest bg-j-background/30">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Transaction Type</th>
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {ledger?.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-j-background/50 transition-colors group">
                    <td className="px-8 py-6 text-j-text-muted text-[10px] font-black uppercase">
                      {format(new Date(entry.createdAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-sm flex items-center justify-center border ${Number(entry.amount) >= 0 ? 'bg-green-50 border-green-100 text-j-success' : 'bg-red-50 border-red-100 text-j-error'}`}>
                          {Number(entry.amount) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        </div>
                        <span className="text-[11px] font-black text-j-text uppercase tracking-tight">{entry.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-j-text-muted text-[10px] font-black uppercase">
                      {entry.orderLineId ? `#${entry.orderLineId.slice(-8).toUpperCase()}` : 'Payout'}
                    </td>
                    <td className={`px-8 py-6 text-right font-black text-lg tracking-tight ${Number(entry.amount) >= 0 ? 'text-j-success' : 'text-j-error'}`}>
                      {Number(entry.amount) >= 0 ? '+' : ''}₦{Number(entry.amount).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        entry.status === 'AVAILABLE' ? 'bg-green-50 text-j-success border-green-100' : 'bg-j-background text-j-text-muted border-j-border'
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

        {/* Payout History */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border">
                <Receipt size={20} className="text-j-text-muted" />
              </div>
              <div>
                <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Payout History</h3>
                <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Status of your withdrawal requests</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-j-border text-j-text-muted text-[9px] font-black uppercase tracking-widest bg-j-background/30">
                  <th className="px-8 py-5">Request ID</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {payouts?.map((payout) => (
                  <tr key={payout.id} className="hover:bg-j-background/50 transition-colors group">
                    <td className="px-8 py-6 text-[11px] font-black text-j-text uppercase">#{payout.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-8 py-6 text-j-text-muted text-[10px] font-black uppercase">
                      {format(new Date(payout.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-8 py-6 font-black text-j-text text-xl tracking-tight">
                      ₦{Number(payout.amount).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        payout.status === 'COMPLETED' ? 'bg-green-50 text-j-success border-green-100' : 
                        payout.status === 'REJECTED' ? 'bg-red-50 text-j-error border-red-100' :
                        'bg-orange-50 text-jumia-orange border-orange-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${payout.status === 'COMPLETED' ? 'bg-j-success' : payout.status === 'REJECTED' ? 'bg-j-error' : 'bg-jumia-orange animate-pulse'}`} />
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Account Settings */}
        <div className="bg-j-text rounded-sm shadow-lg overflow-hidden border border-black">
          <div className="p-8 border-b border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center border border-white/20">
                <Building2 size={20} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase leading-none mb-1">Bank Account Details</h3>
                <p className="text-[9px] font-black text-white/30 uppercase">Where your payouts are sent</p>
              </div>
            </div>
          </div>
          <div className="p-10">
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
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Bank Name</label>
                <div className="relative">
                  <select 
                    name="bankCode" 
                    defaultValue={account?.bankCode || ''}
                    className="w-full h-12 bg-white/10 border border-white/10 rounded-sm px-4 text-[12px] font-black text-white uppercase outline-none focus:border-jumia-orange transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-j-text">Select Bank</option>
                    <option value="044" className="bg-j-text">Access Bank</option>
                    <option value="058" className="bg-j-text">GTBank</option>
                    <option value="011" className="bg-j-text">First Bank</option>
                    <option value="033" className="bg-j-text">UBA</option>
                    <option value="057" className="bg-j-text">Zenith Bank</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Account Number</label>
                <input 
                  name="accountNumber" 
                  type="text" 
                  defaultValue={account?.bankAccountNumber || ''}
                  placeholder="0000000000"
                  className="w-full h-12 bg-white/10 border border-white/10 rounded-sm px-4 text-[12px] font-black text-white uppercase outline-none focus:border-jumia-orange transition-all placeholder:text-white/20"
                  required 
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Account Name</label>
                <input 
                  name="accountName" 
                  type="text" 
                  defaultValue={account?.bankAccountName || ''}
                  placeholder="Account Holder Name"
                  className="w-full h-12 bg-white/10 border border-white/10 rounded-sm px-4 text-[12px] font-black text-white uppercase outline-none focus:border-jumia-orange transition-all placeholder:text-white/20"
                  required 
                />
              </div>
              <div className="md:col-span-3 pt-6 flex justify-end">
                <button 
                  type="submit"
                  disabled={updateAccount.isPending}
                  className="bg-white text-j-text h-12 px-8 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-jumia-orange hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-20 flex items-center gap-3"
                >
                  {updateAccount.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 text-jumia-orange rounded-sm flex items-center justify-center border border-orange-100 shadow-inner">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-j-text uppercase leading-none mb-1">Request Withdrawal</h3>
                  <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Transfer funds to your bank</p>
                </div>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-j-text-muted hover:text-j-error transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="bg-j-background p-6 rounded-sm border border-j-border">
                <p className="text-[9px] font-black text-j-text-muted uppercase mb-4 tracking-widest">Bank Destination</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white text-jumia-orange rounded-sm flex items-center justify-center border border-j-border shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-j-text uppercase tracking-tight">{account?.bankAccountName || 'No account linked'}</h4>
                    <p className="text-[10px] font-black text-j-text-muted uppercase opacity-60">{account?.bankAccountNumber || '••••••••••'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black text-j-text-muted uppercase tracking-widest">Amount to Withdraw</label>
                  <p className="text-[9px] font-black text-j-success uppercase opacity-80">Available: ₦{Number(stats?.availableBalance || 0).toLocaleString()}</p>
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-j-text-muted opacity-20">₦</span>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 bg-j-background border border-j-border rounded-sm pl-12 pr-6 text-3xl font-black text-j-text outline-none focus:border-jumia-orange transition-all placeholder:text-j-text-muted/10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-sm border border-orange-100">
                <Info size={18} className="text-jumia-orange shrink-0" />
                <p className="text-[9px] font-black text-j-text-muted uppercase leading-relaxed opacity-80">
                  Payments are typically processed within <span className="text-jumia-orange">24-48 business hours</span> after approval.
                </p>
              </div>

              <button 
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount}
                className="w-full bg-jumia-orange text-white h-14 rounded-sm text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
              >
                {isWithdrawing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
