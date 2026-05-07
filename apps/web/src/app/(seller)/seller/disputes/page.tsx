'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { AlertCircle, ChevronRight, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SellerDisputesPage() {
  const { data: disputes, isLoading } = api.dispute.listMyDisputes.useQuery();

  return (
    <div className="space-y-12 select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="bg-[#1A1A1A] p-2 rounded-xl">
               <AlertCircle size={20} className="text-white" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Dispute <span className="text-[#F68B1E]">Center</span></h1>
          </div>
          <p className="text-sm text-gray-500 font-medium max-w-lg leading-relaxed">
            Protect your seller rating by resolving buyer issues quickly. Professional and fair mediation for all transactions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Resolutions</h3>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{disputes?.length || 0} Open Cases</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : disputes && disputes.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {disputes.map((dispute) => (
              <Link 
                key={dispute.id} 
                href={`/seller/disputes/${dispute.id}`}
                className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${
                    dispute.status === 'OPEN' 
                      ? 'bg-orange-100 text-orange-600 shadow-orange-500/10' 
                      : dispute.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-600 shadow-green-500/10'
                      : 'bg-blue-100 text-blue-600 shadow-blue-500/10'
                  }`}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-gray-900 uppercase tracking-tight text-lg">Case #{dispute.order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${
                        dispute.status === 'OPEN' 
                          ? 'bg-orange-100 text-orange-700' 
                          : dispute.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium italic mb-3">"{dispute.reason}"</p>
                    <div className="flex items-center gap-4 text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        Last Update {format(new Date(dispute.updatedAt), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-[#F68B1E] group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight mb-2">Operational Excellence</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium italic">Your store has no active disputes. Keep up the great service!</p>
          </div>
        )}
      </div>
    </div>
  );
}
