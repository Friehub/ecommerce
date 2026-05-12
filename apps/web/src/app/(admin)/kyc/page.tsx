'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Shield, CheckCircle, XCircle, FileText, ExternalLink, Clock, User, Building, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

export default function AdminKYCPage() {
  const searchParams = useSearchParams();
  const sellerIdParam = searchParams.get('sellerId');
  const utils = api.useUtils();

  const { data: queue, isLoading } = api.admin.getPendingKYCQueue.useQuery();
  
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(sellerIdParam);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const reviewDoc = api.admin.reviewDocument.useMutation({
    onSuccess: () => {
      utils.admin.getPendingKYCQueue.invalidate();
      setRejectionReason('');
    }
  });

  const approveSeller = api.admin.approveSeller.useMutation({
    onSuccess: () => {
      utils.admin.getPendingKYCQueue.invalidate();
      setSelectedSellerId(null);
    }
  });

  const selectedSeller = queue?.find(s => s.id === (selectedSellerId || sellerIdParam));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Shield size={28} className="text-[#f68b1e]" />
            KYC VERIFICATION QUEUE
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">
            Review and validate seller identity documents to activate platform access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending Review ({queue?.length || 0})</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                ))
              ) : queue?.map((seller) => (
                <button
                  key={seller.id}
                  onClick={() => setSelectedSellerId(seller.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 ${selectedSellerId === seller.id ? 'bg-orange-50/50 border-l-4 border-[#f68b1e]' : ''}`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <Building size={18} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm uppercase">{seller.businessName}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                      {seller.documents.length} Documents Submitted
                    </p>
                  </div>
                </button>
              ))}
              {!isLoading && queue?.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Queue is empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Detail */}
        <div className="lg:col-span-8">
          {selectedSeller ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-50">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#f68b1e]/10 text-[#f68b1e] rounded-2xl flex items-center justify-center">
                      <Building size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedSeller.businessName}</h2>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Tier: {selectedSeller.tier} | ID: {selectedSeller.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => approveSeller.mutate({ sellerId: selectedSeller.id })}
                      disabled={approveSeller.isLoading}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {approveSeller.isLoading ? 'Processing...' : 'Final Approve'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Identity Verification</h4>
                      {selectedSeller.documents.map(doc => (
                        <div key={doc.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center">
                                <FileText size={16} className="text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{doc.type.replace('_', ' ')}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Submitted {format(new Date(doc.createdAt), 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                              doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {doc.status}
                            </span>
                          </div>

                          <div className="aspect-video bg-white rounded-xl border border-gray-100 overflow-hidden relative group">
                            <img src={doc.url} alt={doc.type} className="w-full h-full object-cover" />
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-[10px] font-black uppercase tracking-widest"
                            >
                              <ExternalLink size={16} />
                              View Original
                            </a>
                          </div>

                          {doc.status === 'PENDING' && (
                            <div className="flex flex-col gap-3">
                              <textarea 
                                placeholder="Rejection reason (if rejecting)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[10px] font-bold focus:outline-none focus:border-red-300 min-h-[60px]"
                              />
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => reviewDoc.mutate({ documentId: doc.id, decision: 'APPROVED' })}
                                  disabled={reviewDoc.isLoading}
                                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                >
                                  APPROVE
                                </button>
                                <button 
                                  onClick={() => reviewDoc.mutate({ documentId: doc.id, decision: 'REJECTED', rejectionReason })}
                                  disabled={reviewDoc.isLoading || !rejectionReason}
                                  className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                  REJECT
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                   </div>

                   <div className="space-y-6">
                      <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                           <AlertCircle size={14} /> Verification Guidelines
                         </h4>
                         <ul className="space-y-4">
                           {[
                             'Verify that the NIN name matches the business owner name.',
                             'Check that the bank statement clearly shows the business or owner name.',
                             'Ensure documents are not expired and are clearly legible.',
                             'Reject if the image is blurry or contains overlapping text.'
                           ].map((rule, i) => (
                             <li key={i} className="flex gap-3 text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                               <div className="w-5 h-5 bg-white border border-gray-100 rounded flex items-center justify-center shrink-0 text-[10px] text-[#f68b1e]">
                                 {i + 1}
                               </div>
                               {rule}
                             </li>
                           ))}
                         </ul>
                      </div>

                      <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
                         <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Clock size={14} /> Auto-Activation Note
                         </p>
                         <p className="text-[10px] font-bold text-orange-600/80 leading-relaxed uppercase tracking-tight">
                           THE SYSTEM WILL AUTOMATICALLY ACTIVATE THE SELLER ACCOUNT ONCE AT LEAST ONE [NIN] AND ONE [BANK] DOCUMENT ARE APPROVED.
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 border-dashed py-32 flex flex-col items-center justify-center text-center px-12">
              <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-200 mb-6">
                <Shield size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Select a Seller</h3>
              <p className="text-sm text-gray-400 font-medium mt-2 max-w-xs uppercase tracking-wider">
                Choose a seller from the left queue to begin reviewing their identity and business verification documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
