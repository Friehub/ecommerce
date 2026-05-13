'use client';

import { api } from '@/trpc/react';
import { useState, useEffect } from 'react';
import { 
  Share2, 
  Link as LinkIcon, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  Clock, 
  Loader2, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  MousePointer2, 
  Target,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AffiliatePortal() {
  const { data: session } = useSession();
  const utils = api.useUtils();
  
  const { data: profile, isLoading } = api.affiliate.getMyProfile.useQuery(undefined, {
    enabled: !!session?.user
  });

  const registerMutation = api.affiliate.register.useMutation({
    onSuccess: () => utils.affiliate.getMyProfile.invalidate()
  });

  const generateMutation = api.affiliate.generateLink.useMutation({
    onSuccess: () => utils.affiliate.getMyProfile.invalidate()
  });

  const [targetType, setTargetType] = useState<'PRODUCT' | 'CATEGORY' | 'HOME'>('HOME');
  const [targetId, setTargetId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data: stats } = api.affiliate.getMyStats.useQuery(undefined, {
    enabled: !!session?.user
  });

  const { data: commissionsData, isLoading: isLoadingComms } = api.affiliate.getMyCommissions.useQuery({
    limit,
    offset: page * limit
  }, {
    enabled: !!session?.user
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!session?.user) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="bg-surface-container-lowest p-12 rounded-[40px] shadow-soft border-4 border-surface-container-low text-center max-w-sm animate-in fade-in zoom-in-95">
          <Share2 className="mx-auto text-on-surface-variant/20 mb-8" size={64} />
          <h2 className="text-xl font-black text-on-surface uppercase tracking-tight mb-3">Exclusive Portal</h2>
          <p className="text-on-surface-variant/60 text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed italic">Authentication required to initialize partner telemetry.</p>
          <Link href="/login" className="block w-full py-5 bg-on-surface text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-container transition-all shadow-xl active:scale-95">
            Access Terminal
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Activity className="text-primary-container animate-pulse" size={48} />
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-on-surface-variant/40 italic">Syncing Partner Ledger...</p>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION / ONBOARDING VIEW
  if (!profile) {
    return (
      <div className="bg-background min-h-screen pb-20 selection:bg-primary-container/30">
        <div className="bg-on-surface text-white py-32 overflow-hidden relative border-b-8 border-primary-container/20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px] animate-pulse" />
          <div className="container relative z-10 text-center max-w-4xl mx-auto px-6">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-2xl border-2 border-white/10 mb-12 animate-in slide-in-from-top-8 duration-700">
              <Sparkles size={16} className="text-primary-container" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 italic">Monetize Your Influence</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-10 animate-in fade-in duration-1000">
              Partner with <br />
              <span className="text-primary-container italic">Jumia Network.</span>
            </h1>
            <p className="text-white/40 font-black text-[11px] uppercase tracking-[0.2em] max-w-md mx-auto mb-16 leading-relaxed italic opacity-80">
              Unlock elite revenue nodes and command up to <span className="text-white font-black">10% commission</span> on referred telemetry.
            </p>

            <div className="bg-white/5 backdrop-blur-xl rounded-[40px] border-2 border-white/10 p-10 md:p-16 text-left max-w-2xl mx-auto animate-in slide-in-from-bottom-12 duration-1000">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white mb-8 flex items-center gap-4">
                <ShieldCheck size={20} className="text-primary-container" />
                Partner Agreement
              </h2>
              <div className="space-y-6 mb-12 max-h-48 overflow-y-auto pr-4 custom-scrollbar text-[10px] font-medium text-white/40 uppercase tracking-widest leading-relaxed">
                <p>1. THE PARTNER AGREES TO REPRESENT THE JUMIA CLONE BRAND WITH INTEGRITY ACROSS ALL DIGITAL CHANNELS.</p>
                <p>2. COMMISSIONS ARE CALCULATED BASED ON NET SALES VALUE, EXCLUDING SHIPPING AND TAXES.</p>
                <p>3. SPAM, FRAUDULENT CLICKS, OR MISLEADING ADVERTISING WILL RESULT IN IMMEDIATE TERMINATION OF THE PARTNER NODE.</p>
                <p>4. SETTLEMENTS ARE PROCESSED ON A 30-DAY ROLLING WINDOW FOLLOWING ORDER COMPLETION.</p>
                <p>5. JUMIA CLONE RESERVES THE RIGHT TO ADJUST COMMISSION RATES BASED ON PERFORMANCE TIERS.</p>
              </div>

              <div className="flex items-start gap-4 mb-12 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-primary-container border-primary-container' : 'border-white/20 group-hover:border-white/40'}`}>
                  {agreedToTerms && <CheckCircle size={14} className="text-white" />}
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">I acknowledge the terms of the Jumia Network Partnership Protocol.</p>
              </div>

              <button 
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isLoading || !agreedToTerms}
                className="w-full bg-primary-container text-white py-6 rounded-[24px] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white hover:text-on-surface transition-all transform active:scale-95 shadow-[0_0_50px_rgba(246,139,30,0.3)] disabled:opacity-20 disabled:cursor-not-allowed group flex items-center justify-center gap-4"
              >
                {registerMutation.isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Initialize Partnership <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="container mx-auto px-6 max-w-6xl -mt-20 relative z-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap size={24} />, title: 'Instant Nodes', desc: 'Generate unique tracking slugs for any product or category instantly.' },
            { icon: <TrendingUp size={24} />, title: 'High Yield', desc: 'Command high commission rates that scale with your referral performance.' },
            { icon: <BarChart3 size={24} />, title: 'Live Telemetry', desc: 'Monitor your network pulse with real-time click and conversion data.' }
          ].map((benefit, i) => (
            <div key={i} className="bg-surface-container-lowest p-10 rounded-[40px] border-4 border-surface-container-low shadow-soft hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center text-primary-container mb-8">
                {benefit.icon}
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface mb-4">{benefit.title}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 leading-relaxed italic">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  const totalEarned = stats?.confirmed || 0;
  const pendingEarned = stats?.pending || 0;
  const totalClicks = stats?.totalClicks || 0;

  const commissions = commissionsData?.items || [];
  const totalCommissions = commissionsData?.total || 0;
  const totalPages = Math.ceil(totalCommissions / limit);

  return (
    <div className="bg-background min-h-screen pb-20 select-none animate-in fade-in duration-1000">
      {/* Header */}
      <div className="bg-on-surface pt-16 pb-32 border-b border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-30" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="animate-in slide-in-from-left-8 duration-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary-container/20 backdrop-blur-xl p-2.5 rounded-2xl border-2 border-primary-container/30">
                  <Activity size={24} className="text-primary-container" />
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Partner <span className="text-primary-container italic">Terminal.</span></h1>
              </div>
              <div className="flex items-center gap-6">
                <div className="bg-white/5 px-6 py-2.5 rounded-2xl border-2 border-white/10 flex items-center gap-3">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Protocol Tier</span>
                  <span className="text-[10px] font-black text-primary-container uppercase italic tracking-[0.2em]">{profile.tier}</span>
                </div>
                <div className="bg-white/5 px-6 py-2.5 rounded-2xl border-2 border-white/10 flex items-center gap-3">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Yield Rate</span>
                  <span className="text-[10px] font-black text-white uppercase italic tracking-[0.2em]">{Number(profile.commissionRate)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border-2 border-white/10 shadow-2xl animate-in slide-in-from-right-8 duration-700">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 italic">Active Identity</p>
                <p className="text-xs font-black text-white uppercase tracking-tighter italic">{session?.user?.name || session?.user?.email}</p>
              </div>
              <div className="w-14 h-14 bg-primary-container text-white rounded-2xl flex items-center justify-center font-black text-xl border-4 border-white/5 shadow-xl">
                {session.user?.name?.[0].toUpperCase() || 'P'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl -mt-16 relative z-20">
        {/* Statistics Grid / Earnings Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {[
            { label: 'Confirmed Yield', val: `₦${totalEarned.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'text-success', badge: 'bg-success/10 border-success/20' },
            { label: 'Pending Settlement', val: `₦${pendingEarned.toLocaleString()}`, icon: <Clock size={24} />, color: 'text-primary-container', badge: 'bg-primary-container/10 border-primary-container/20' },
            { label: 'Network Pulse', val: totalClicks.toLocaleString(), icon: <Activity size={24} />, color: 'text-secondary', badge: 'bg-secondary/10 border-secondary/20' }
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container-lowest p-10 rounded-[48px] border-4 border-surface-container-low shadow-soft hover:translate-y-[-10px] transition-all duration-700 group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="flex items-center justify-between mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">{stat.label}</span>
                <div className={`${stat.color} ${stat.badge} p-3 rounded-2xl border-2 transition-transform group-hover:scale-110 duration-500`}>{stat.icon}</div>
              </div>
              <p className={`text-4xl font-black ${stat.color} tracking-tighter leading-none`}>{stat.val}</p>
              <div className="w-full h-1 bg-surface-container-low rounded-full mt-8 overflow-hidden">
                <div className={`h-full ${stat.color.replace('text-', 'bg-')} opacity-20`} style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Link Generator */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest p-10 rounded-[48px] border-4 border-surface-container-low shadow-soft sticky top-32">
              <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.4em] mb-10 pb-6 border-b-2 border-surface-container-low flex items-center gap-4">
                <LinkIcon size={18} className="text-primary-container" />
                Link Generator
              </h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] ml-2 italic">Destination Target</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'HOME', label: 'Home', icon: <Target size={14} /> },
                      { type: 'PRODUCT', label: 'Product', icon: <MousePointer2 size={14} /> },
                      { type: 'CATEGORY', label: 'Cat', icon: <TrendingUp size={14} /> }
                    ].map((btn) => (
                      <button
                        key={btn.type}
                        onClick={() => setTargetType(btn.type as any)}
                        className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all ${targetType === btn.type ? 'bg-on-surface text-white border-on-surface' : 'bg-surface-container-low/30 border-surface-container-low text-on-surface-variant hover:border-on-surface-variant'}`}
                      >
                        {btn.icon} {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
                {targetType !== 'HOME' && (
                  <div className="space-y-3">
                    <label className="block text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] ml-2 italic">Asset ID / Slug</label>
                    <input 
                      type="text" 
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder={targetType === 'PRODUCT' ? 'e.g. prod_123' : 'e.g. fashion-electronics'}
                      className="w-full h-14 px-6 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl focus:border-primary-container focus:ring-4 focus:ring-primary-container/5 text-xs font-bold text-on-surface outline-none transition-all placeholder:font-normal placeholder:text-on-surface-variant/50"
                    />
                  </div>
                )}
                <button 
                  onClick={() => generateMutation.mutate({ targetType, targetId: targetId || undefined })}
                  disabled={generateMutation.isLoading}
                  className="w-full bg-primary-container text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-on-surface transition-all transform active:scale-95 shadow-xl shadow-primary-container/20 flex items-center justify-center gap-3 group"
                >
                  {generateMutation.isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                    <>
                      Initialize Tracker <Zap size={16} className="group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            {/* Referral Link List */}
            <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden">
              <div className="px-10 py-8 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-on-surface/5 rounded-xl flex items-center justify-center border-2 border-outline-variant/10">
                    <LinkIcon size={18} className="text-on-surface-variant opacity-40" />
                  </div>
                  <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em]">Active Trackers</h3>
                </div>
              </div>
              <div className="divide-y-4 divide-surface-container-low max-h-[600px] overflow-y-auto custom-scrollbar">
                {profile.links.map(link => (
                  <div key={link.id} className="p-10 flex items-center justify-between hover:bg-surface-container-low/20 transition-all duration-500 group">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-on-surface uppercase tracking-tighter group-hover:text-primary-container transition-colors">taas.link/{link.slug}</p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(`https://friehub.cloud/r/${link.slug}`, link.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${copiedId === link.id ? 'bg-success text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-on-surface hover:text-white'}`}
                          >
                            {copiedId === link.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                          <a 
                            href={`https://friehub.cloud/r/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary-container hover:text-white transition-all"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black text-white px-2 py-1 bg-on-surface rounded-md uppercase tracking-[0.1em]">{link.targetType}</span>
                        {link.targetId && <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">{link.targetId}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-on-surface tracking-tighter leading-none group-hover:scale-110 transition-transform origin-right duration-500">{(link as any)._count?.clicks || 0}</p>
                      <p className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest mt-2">Telemetry Pulses</p>
                    </div>
                  </div>
                ))}
                {profile.links.length === 0 && (
                  <div className="py-32 text-center">
                    <LinkIcon size={48} className="mx-auto text-on-surface-variant opacity-5 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/30 italic">No trackers initialized in current sector.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Commission Matrix / Table */}
            <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden">
              <div className="px-10 py-8 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-on-surface/5 rounded-xl flex items-center justify-center border-2 border-outline-variant/10">
                    <DollarSign size={18} className="text-on-surface-variant opacity-40" />
                  </div>
                  <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em]">Yield Log (Commission Ledger)</h3>
                </div>
              </div>
              
              {commissions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/5 border-b-2 border-surface-container-low">
                          <th className="px-10 py-6 text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Status</th>
                          <th className="px-10 py-6 text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Transaction ID</th>
                          <th className="px-10 py-6 text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Timestamp</th>
                          <th className="px-10 py-6 text-right text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Yield</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-surface-container-low/50">
                        {commissions.map(comm => (
                          <tr key={comm.id} className="hover:bg-surface-container-low/10 transition-colors group">
                            <td className="px-10 py-8">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest ${
                                comm.status === 'CONFIRMED' || comm.status === 'PAID' 
                                  ? 'bg-success/5 text-success border-success/10' 
                                  : comm.status === 'CANCELLED'
                                  ? 'bg-error/5 text-error border-error/10'
                                  : 'bg-primary-container/5 text-primary-container border-primary-container/10'
                              }`}>
                                {comm.status === 'CONFIRMED' || comm.status === 'PAID' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                {comm.status}
                              </div>
                            </td>
                            <td className="px-10 py-8 text-[10px] font-black text-on-surface uppercase tracking-tight">#{comm.orderId.slice(-12).toUpperCase()}</td>
                            <td className="px-10 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">{new Date(comm.createdAt).toLocaleDateString()}</td>
                            <td className="px-10 py-8 text-right text-base font-black text-on-surface tracking-tighter group-hover:text-success transition-colors">₦{Number(comm.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="px-10 py-8 border-t-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/5">
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">
                        Sector {page + 1} of {totalPages}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setPage(p => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="w-12 h-12 flex items-center justify-center bg-surface-container-low rounded-xl text-on-surface-variant hover:bg-on-surface hover:text-white transition-all disabled:opacity-20"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={page >= totalPages - 1}
                          className="w-12 h-12 flex items-center justify-center bg-surface-container-low rounded-xl text-on-surface-variant hover:bg-on-surface hover:text-white transition-all disabled:opacity-20"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-32 text-center">
                  <DollarSign size={48} className="mx-auto text-on-surface-variant opacity-5 mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/30 italic">No yield recorded in ledger history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
