'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { AlertCircle, ChevronRight, MessageSquare, Clock, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function ModeratorDisputesDashboard() {
  const utils = api.useUtils();
  const { data: disputes, isLoading } = api.dispute.listAllDisputes.useQuery();
  const resolveMutation = api.dispute.resolveDispute.useMutation({
    onSuccess: () => {
      utils.dispute.listAllDisputes.invalidate();
      setSelectedDispute(null);
    }
  });

  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  const handleResolve = (status: 'RESOLVED' | 'REJECTED') => {
    if (!selectedDispute || !resolution) return;
    resolveMutation.mutate({
      disputeId: selectedDispute.id,
      resolution,
      status,
      refundAmount: refundAmount || 0
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
          <ShieldAlert className="text-[#F68B1E]" size={28} />
          MODERATOR DISPUTE CONTROL CENTER
        </h1>
        <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
          Review, analyze, and finalize escalated dispute cases between platform buyers and sellers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Ongoing Dispute Cases</h2>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 border border-gray-100/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : disputes && disputes.length > 0 ? (
            <div className="divide-y divide-gray-100/60">
              {disputes.map((dispute: any) => (
                <div 
                  key={dispute.id} 
                  onClick={() => setSelectedDispute(dispute)}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50/50 cursor-pointer duration-200 transition-all ${
                    selectedDispute?.id === dispute.id ? 'bg-orange-50/40 border-l-4 border-[#F68B1E]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${
                      dispute.status === 'OPEN' 
                        ? 'bg-orange-50 text-orange-600 border-orange-100/60' 
                        : dispute.status === 'RESOLVED'
                        ? 'bg-green-50 text-green-600 border-green-100/60'
                        : 'bg-blue-50 text-blue-600 border-blue-100/60'
                    }`}>
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-xs md:text-sm text-gray-900 tracking-tight">Case ID: {dispute.id.slice(-8).toUpperCase()}</span>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                          dispute.status === 'OPEN' 
                            ? 'bg-orange-50 text-orange-700 border-orange-100/60' 
                            : dispute.status === 'RESOLVED'
                            ? 'bg-green-50 text-green-700 border-green-100/60'
                            : 'bg-blue-50 text-blue-700 border-blue-100/60'
                        }`}>
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1">{dispute.reason}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wide">
                        Buyer: {dispute.buyer?.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
              No active dispute cases found.
            </div>
          )}
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
          <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-100/80 pb-3">
            Case Resolution Action
          </h2>
          {selectedDispute ? (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Dispute Reason</span>
                <p className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  {selectedDispute.reason}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Resolution Justification</label>
                <textarea
                  placeholder="Explain your case ruling clearly..."
                  rows={4}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F68B1E] text-xs font-bold text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Refund Amount (₦, if any)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F68B1E] text-xs font-bold text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleResolve('RESOLVED')}
                  disabled={!resolution || resolveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-2 justify-center cursor-pointer select-none disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> Mark Resolved
                </button>
                <button
                  onClick={() => handleResolve('REJECTED')}
                  disabled={!resolution || resolveMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-2 justify-center cursor-pointer select-none disabled:opacity-50"
                >
                  <XCircle size={16} /> Mark Rejected
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
              Select a dispute case to submit a ruling.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
