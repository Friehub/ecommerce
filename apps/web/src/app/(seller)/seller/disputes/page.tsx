'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { AlertCircle, ChevronRight, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SellerDisputesPage() {
  const { data: disputes, isLoading } = api.dispute.listMyDisputes.useQuery();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-3">
          <AlertCircle size={28} className="text-[#f68b1e]" />
          Dispute Center
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage and respond to disputes from your buyers.</p>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Active Disputes</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : disputes && disputes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {disputes.map((dispute) => (
              <Link 
                key={dispute.id} 
                href={`/seller/disputes/${dispute.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    dispute.status === 'OPEN' 
                      ? 'bg-orange-100 text-orange-600' 
                      : dispute.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">Order #{dispute.order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        dispute.status === 'OPEN' 
                          ? 'bg-orange-100 text-orange-700' 
                          : dispute.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{dispute.reason}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        Updated {format(new Date(dispute.updatedAt), 'dd MMM')}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">No disputes found</h3>
            <p className="text-gray-500 text-sm mt-1">You're all caught up! No active disputes to show.</p>
          </div>
        )}
      </div>
    </div>
  );
}
