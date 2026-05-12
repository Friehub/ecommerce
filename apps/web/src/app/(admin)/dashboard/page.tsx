'use client';

import { api } from '@/trpc/react';
import { ShieldCheck, Users, AlertTriangle, ArrowRight, CheckCircle, Activity, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: metrics } = api.ops.getGlobalMetrics.useQuery();
  const { data: pendingSellers } = api.admin.getPendingSellers.useQuery();
  const { data: disputes } = api.admin.getDisputeQueue.useQuery();

  const approveSellerMutation = api.admin.approveSeller.useMutation({
    onSuccess: () => {
      api.useUtils().admin.getPendingSellers.invalidate();
    }
  });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#f68b1e]" /> Ops Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">Platform administration and moderation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#282828] text-white p-6 rounded shadow-sm border border-gray-800">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Activity size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Active Sessions</h3>
          </div>
          <p className="text-3xl font-bold">{metrics?.activeSessions || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <DollarSign size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">30d GMV</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦{Number(metrics?.totalGmv30d || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Users size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Active Sellers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics?.activeSellers || 0}</p>
        </div>
        <Link href="/admin/disputes" className="bg-red-50 p-6 rounded shadow-sm border border-red-100 hover:shadow-md transition-all group block">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <AlertTriangle size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Open Disputes</h3>
            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-3xl font-bold text-red-600">{metrics?.openDisputes || 0}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Pending KYC Approvals</h3>
            <span className="bg-[#f68b1e] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pendingSellers?.length || 0}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingSellers?.map(seller => (
              <div key={seller.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900">{seller.businessName}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    {seller.user.firstName} {seller.user.lastName} • {seller.user.email}
                  </p>
                </div>
                <button
                  onClick={() => approveSellerMutation.mutate({ sellerId: seller.id })}
                  disabled={approveSellerMutation.isLoading}
                  className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={14} /> Approve
                </button>
              </div>
            ))}
            {(!pendingSellers || pendingSellers.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                No pending approvals
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Dispute Moderation Queue</h3>
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {disputes?.length || 0}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {disputes?.map(dispute => (
              <div key={dispute.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {dispute.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Ord #{dispute.orderId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900">{dispute.reason}</h4>
                </div>
                <Link
                  href={`/disputes/${dispute.id}`} // Admin uses the same thread view as buyer/seller, but authorized as admin
                  className="border border-gray-200 text-gray-600 hover:border-[#f68b1e] hover:text-[#f68b1e] px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  Review <ArrowRight size={14} />
                </Link>
              </div>
            ))}
            {(!disputes || disputes.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                Queue is clear
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
