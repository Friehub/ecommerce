'use client';

import { api } from '@/trpc/react';
import { useState } from 'react';
import { Share2, Link as LinkIcon, DollarSign, Activity, CheckCircle, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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

  if (!session?.user) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 text-center max-w-sm">
          <Share2 className="mx-auto text-gray-200 mb-6" size={64} />
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Exclusive Portal</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">Please log in to your account to access the affiliate dashboard and start earning.</p>
          <Link href="/auth/login" className="block w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#F68B1E] transition-all">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen">
        <div className="container py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Syncing Partner Ledger...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen pb-20">
        <div className="bg-[#1A1A1A] text-white py-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#F68B1E]/10 rounded-full blur-3xl" />
          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 mb-8">
              <Activity size={16} className="text-[#F68B1E]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Monetize Your Influence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
              Partner with <br />
              <span className="text-[#F68B1E]">Jumia Network</span>
            </h1>
            <p className="text-gray-400 font-medium max-w-md mx-auto mb-12 leading-relaxed">
              Earn up to 10% commission on every successful order you refer. Turn your audience into a sustainable engine of revenue.
            </p>
            <button 
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isLoading}
              className="bg-white text-black px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#F68B1E] hover:text-white transition-all transform active:scale-95 shadow-2xl shadow-orange-500/20 disabled:opacity-50"
            >
              {registerMutation.isLoading ? 'Processing...' : 'Become a Partner'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalEarned = profile.commissions
    .filter(c => c.status === 'CONFIRMED' || c.status === 'PAID')
    .reduce((acc, c) => acc + Number(c.amount), 0);

  const pendingEarned = profile.commissions
    .filter(c => c.status === 'PENDING')
    .reduce((acc, c) => acc + Number(c.amount), 0);

  const totalClicks = profile.links.reduce((acc, l) => acc + (l as any)._count?.clicks || 0, 0);

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-20 select-none">
      <div className="bg-[#1A1A1A] pt-12 pb-24 border-b border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#F68B1E] p-1.5 rounded-lg">
                  <Activity size={18} className="text-white" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Partner Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                   <span className="text-[10px] font-black text-gray-500 uppercase">Tier</span>
                   <span className="text-[10px] font-black text-[#F68B1E] uppercase">{profile.tier}</span>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                   <span className="text-[10px] font-black text-gray-500 uppercase">Rate</span>
                   <span className="text-[10px] font-black text-white uppercase">{Number(profile.commissionRate)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Profile placeholder */}
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated Partner</p>
                <p className="text-sm font-black text-white uppercase">{session?.user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Total Earnings', val: `₦${totalEarned.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'text-green-500' },
            { label: 'Pending Payout', val: `₦${pendingEarned.toLocaleString()}`, icon: <Clock size={20} />, color: 'text-[#F68B1E]' },
            { label: 'Network Clicks', val: totalClicks.toLocaleString(), icon: <Activity size={20} />, color: 'text-blue-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</span>
                <div className={`${stat.color} bg-current/10 p-2 rounded-xl`}>{stat.icon}</div>
              </div>
              <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 pb-4 border-b border-gray-50">Generate Link</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Link Destination</label>
                  <select 
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F68B1E] text-xs font-bold uppercase tracking-widest appearance-none"
                  >
                    <option value="HOME">Homepage</option>
                    <option value="PRODUCT">Specific Product</option>
                    <option value="CATEGORY">Category Page</option>
                  </select>
                </div>
                {targetType !== 'HOME' && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ID / Slug</label>
                    <input 
                      type="text" 
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder={targetType === 'PRODUCT' ? 'e.g. prod_123' : 'e.g. tech-gear'}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F68B1E] text-xs font-bold"
                    />
                  </div>
                )}
                <button 
                  onClick={() => generateMutation.mutate({ targetType, targetId: targetId || undefined })}
                  disabled={generateMutation.isLoading}
                  className="w-full bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#F68B1E] transition-all transform active:scale-95 shadow-xl shadow-black/10"
                >
                  {generateMutation.isLoading ? 'Generating...' : 'Create Tracker'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Trackers</h3>
                <LinkIcon size={16} className="text-gray-300" />
              </div>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {profile.links.map(link => (
                  <div key={link.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">taas.link/{link.slug}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://friehub.cloud/r/${link.slug}`);
                          }}
                          className="text-[#F68B1E] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <LinkIcon size={14} />
                        </button>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Target: {link.targetType}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-[#F68B1E] transition-colors">{(link as any)._count?.clicks || 0}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Clicks</p>
                    </div>
                  </div>
                ))}
                {profile.links.length === 0 && (
                  <div className="p-20 text-center text-gray-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No links generated yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Commission History</h3>
                <DollarSign size={16} className="text-gray-300" />
              </div>
              <div className="divide-y divide-gray-50">
                {profile.commissions.slice(0, 5).map(comm => (
                  <div key={comm.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${comm.status === 'CONFIRMED' || comm.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {comm.status === 'CONFIRMED' || comm.status === 'PAID' ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Order #{comm.orderId.slice(-8).toUpperCase()}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{new Date(comm.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900 tracking-tighter">₦{Number(comm.amount).toLocaleString()}</p>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${comm.status === 'CONFIRMED' || comm.status === 'PAID' ? 'text-green-600' : 'text-[#F68B1E]'}`}>
                        {comm.status}
                      </p>
                    </div>
                  </div>
                ))}
                {profile.commissions.length === 0 && (
                  <div className="p-20 text-center text-gray-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No commissions earned yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
      `}</style>
    </div>
  );
}

