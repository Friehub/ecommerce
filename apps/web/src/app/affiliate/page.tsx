'use client';

import { api } from '../../trpc/react';
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
    return <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Please log in to access the affiliate portal.</div>;
  }

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="container py-16 max-w-2xl text-center">
        <div className="bg-white p-12 rounded shadow-sm border border-gray-200">
          <Share2 className="mx-auto text-[#f68b1e] mb-6" size={48} />
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight mb-4">Join the Affiliate Network</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            Earn up to 10% commission on every successful order you refer. Turn your audience into an engine of revenue today.
          </p>
          <button 
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isLoading}
            className="bg-[#282828] text-white px-8 py-3 rounded font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
          >
            {registerMutation.isLoading ? 'Registering...' : 'Become an Affiliate'}
          </button>
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

  const totalClicks = profile.links.reduce((acc, l) => acc + l._count.clicks, 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container py-12 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Affiliate Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tier: <span className="font-bold text-[#f68b1e]">{profile.tier}</span> • 
              Commission Rate: <span className="font-bold text-gray-900">{Number(profile.commissionRate)}%</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <DollarSign size={18} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Total Earnings</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">₦{totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Clock size={18} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Pending Commissions</h3>
            </div>
            <p className="text-3xl font-bold text-orange-500">₦{pendingEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Activity size={18} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Total Clicks</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Generate Link</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Target Type</label>
                  <select 
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
                  >
                    <option value="HOME">Homepage</option>
                    <option value="PRODUCT">Specific Product</option>
                    <option value="CATEGORY">Category Page</option>
                  </select>
                </div>
                {targetType !== 'HOME' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Target ID / Slug</label>
                    <input 
                      type="text" 
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder={targetType === 'PRODUCT' ? 'Product ID' : 'Category ID'}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
                    />
                  </div>
                )}
                <button 
                  onClick={() => generateMutation.mutate({ targetType, targetId: targetId || undefined })}
                  disabled={generateMutation.isLoading}
                  className="w-full bg-[#f68b1e] text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#e07a1a] transition-colors"
                >
                  {generateMutation.isLoading ? 'Generating...' : 'Generate Tracker'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Your Tracking Links</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                {profile.links.map(link => (
                  <div key={link.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        taas.link/{link.slug}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://friehub.cloud/r/${link.slug}`);
                            alert('Link copied to clipboard!');
                          }}
                          className="text-[#f68b1e] hover:text-[#e07a1a]"
                          title="Copy Link"
                        >
                          <LinkIcon size={14} />
                        </button>
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        Target: {link.targetType} {link.targetId && `(${link.targetId})`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#f68b1e]">{link._count.clicks}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Clicks</p>
                    </div>
                  </div>
                ))}
                {profile.links.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                    No links generated yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Recent Commissions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {profile.commissions.slice(0, 5).map(comm => (
                  <div key={comm.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${comm.status === 'CONFIRMED' || comm.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {comm.status === 'CONFIRMED' || comm.status === 'PAID' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Order #{comm.orderId.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{new Date(comm.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₦{Number(comm.amount).toLocaleString()}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${comm.status === 'CONFIRMED' || comm.status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                        {comm.status}
                      </p>
                    </div>
                  </div>
                ))}
                {profile.commissions.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                    No commissions earned yet.
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
          padding: 0 16px;
        }
      `}</style>
    </div>
  );
}
