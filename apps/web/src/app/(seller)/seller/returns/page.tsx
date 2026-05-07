'use client';

import React from 'react';
import { 
  RotateCcw, 
  Package, 
  User, 
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';
import { api } from '@/trpc/react';
import Link from 'next/link';

export default function SellerReturnsPage() {
  const { data: returns, isLoading } = api.return.listForSeller.useQuery();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#f68b1e]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <RotateCcw className="text-[#f68b1e]" /> Return Management
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage customer return requests and quality control.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:border-[#f68b1e] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {returns && returns.length > 0 ? (
          returns.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#f68b1e]/30 transition-all group">
              <div className="flex flex-col md:flex-row">
                {/* Product Image */}
                <div className="w-full md:w-32 h-32 bg-gray-50 border-r border-gray-50 shrink-0">
                  <img 
                    src={req.orderLine.variant.product.media[0]?.url || 'https://via.placeholder.com/128'} 
                    alt="" 
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="p-4 md:p-6 flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product & Order</p>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{req.orderLine.variant.product.title}</h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Ord #{req.orderLine.package.order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason for Return</p>
                    <p className="text-xs font-bold text-gray-700 italic">"{req.reason}"</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar size={12} className="text-gray-300" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-50 rounded-full flex items-center justify-center text-[#f68b1e]">
                        <User size={12} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {req.orderLine.package.order.user.firstName} {req.orderLine.package.order.user.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="p-4 md:p-6 bg-gray-50/50 border-l border-gray-50 flex items-center justify-between md:flex-col md:justify-center md:gap-4 md:w-48">
                  <div className="flex items-center gap-2">
                    {req.status === 'PENDING' ? (
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle size={12} /> Pending QC
                      </span>
                    ) : req.status === 'APPROVED' ? (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                  </div>
                  
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#f68b1e] hover:underline flex items-center gap-1">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
            <RotateCcw className="mx-auto text-gray-100 mb-4" size={48} />
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No Return Requests</h3>
            <p className="text-sm text-gray-400 font-medium italic">You're all caught up! No customers have requested returns for your products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
