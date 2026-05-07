'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { AlertTriangle, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function DisputeCenter() {
  const { data: disputes, isLoading } = api.dispute.listMyDisputes.useQuery();

  if (isLoading) {
    return <div className="container py-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Disputes...</div>;
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Dispute Center</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track your order disputes.</p>
      </div>

      {(!disputes || disputes.length === 0) ? (
        <div className="bg-white p-12 rounded shadow-sm text-center border border-gray-200">
          <AlertTriangle className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">No Active Disputes</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            You currently have no open disputes. If you have an issue with an order, you can open a dispute from the order details page.
          </p>
          <Link href="/orders" className="inline-block mt-6 bg-[#282828] text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
            View Orders
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      dispute.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' :
                      dispute.status === 'UNDER_REVIEW' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {dispute.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Order #{dispute.orderId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{dispute.reason}</h3>
                  <p className="text-gray-500 text-xs mt-1 font-medium">
                    Opened on {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <Link href={`/disputes/${dispute.id}`} className="inline-flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 rounded text-xs font-bold text-gray-700 hover:border-[#f68b1e] hover:text-[#f68b1e] transition-all uppercase tracking-widest bg-white w-full md:w-auto">
                  View Thread <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
