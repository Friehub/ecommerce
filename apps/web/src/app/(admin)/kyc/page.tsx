'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/trpc/react';
import { Shield, CheckCircle, XCircle, FileText, ExternalLink, Clock, User, Building, AlertCircle, Search, MoreHorizontal, ArrowRight, Fingerprint, Loader2, Activity, Gavel } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

function AdminKYCContent() {
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

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4"><Skeleton className="h-[600px] w-full rounded-sm" /></div>
          <div className="lg:col-span-8"><Skeleton className="h-[600px] w-full rounded-sm" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
                <Shield size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Compliance Hub</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Seller <span className="text-jumia-orange">Verification</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Review and verify new seller registrations</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <Activity size={16} className="text-jumia-orange animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Queue Active: {queue?.length || 0} Pending</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Seller Queue List */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-j-border flex items-center gap-3 bg-j-background/30">
                <Clock size={16} className="text-jumia-orange" />
                <h3 className="text-[10px] font-black text-j-text uppercase tracking-widest">Pending Review</h3>
              </div>
              <div className="divide-y divide-j-border max-h-[600px] overflow-y-auto custom-scrollbar">
                {queue?.map((seller) => (
                  <button
                    key={seller.id}
                    onClick={() => setSelectedSellerId(seller.id)}
                    className={`w-full text-left p-6 hover:bg-j-background/50 transition-all flex items-center gap-4 relative group ${selectedSellerId === seller.id ? 'bg-orange-50/30' : ''}`}
                  >
                    {selectedSellerId === seller.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-jumia-orange" />}
                    <div className={`w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 transition-all ${selectedSellerId === seller.id ? 'bg-jumia-orange text-white border-jumia-orange shadow-md' : 'bg-j-background border-j-border text-j-text-muted/40'}`}>
                      <Building size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-black uppercase tracking-tight truncate text-sm transition-colors ${selectedSellerId === seller.id ? 'text-jumia-orange' : 'text-j-text'}`}>{seller.businessName}</p>
                      <div className="flex items-center gap-3 mt-1 opacity-60">
                        <p className="text-[9px] text-j-text-muted font-black uppercase tracking-widest">
                          {seller.documents.length} Docs
                        </p>
                        <div className="w-1 h-1 bg-j-border rounded-full" />
                        <p className="text-[9px] text-j-text-muted font-black uppercase tracking-widest">
                          Tier {seller.tier}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className={`text-jumia-orange transition-all ${selectedSellerId === seller.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
                  </button>
                ))}
                {queue?.length === 0 && (
                  <div className="py-20 text-center px-6">
                    <div className="w-16 h-16 bg-j-background rounded-full flex items-center justify-center mx-auto mb-4 opacity-20 border border-j-border">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-sm font-black text-j-text uppercase">Queue Empty</h3>
                    <p className="text-[9px] font-black text-j-text-muted uppercase mt-2 tracking-widest opacity-60">All sellers have been reviewed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Detail */}
          <div className="lg:col-span-8">
            {selectedSeller ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-white rounded-sm border border-j-border shadow-sm p-8 lg:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/30 rounded-full blur-[80px] -mr-32 -mt-32" />
                  
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12 pb-8 border-b border-j-border relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-jumia-orange text-white rounded-sm flex items-center justify-center shadow-lg border border-orange-400/20 shrink-0">
                        <Fingerprint size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-j-text uppercase tracking-tight mb-2">{selectedSeller.businessName}</h2>
                        <div className="flex items-center gap-4">
                          <p className="text-[9px] font-black text-j-text-muted uppercase tracking-widest opacity-60">ID: {selectedSeller.id.toUpperCase()}</p>
                          <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                            <div className="w-1.5 h-1.5 bg-jumia-orange rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-jumia-orange uppercase tracking-widest">Urgent Review</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => approveSeller.mutate({ sellerId: selectedSeller.id })}
                      disabled={approveSeller.isPending}
                      className="h-16 px-10 bg-jumia-orange text-white rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group/btn"
                    >
                      {approveSeller.isPending ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                      Approve Seller <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 mb-6">
                        <FileText size={18} className="text-jumia-orange" />
                        <h4 className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">Document Review</h4>
                      </div>
                      <div className="space-y-8">
                        {selectedSeller.documents.map((doc) => (
                          <div key={doc.id} className="bg-j-background/30 border border-j-border rounded-sm p-6 space-y-6 hover:border-jumia-orange/30 transition-all group/card">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white border border-j-border rounded-sm flex items-center justify-center text-j-text-muted/20 group-hover/card:text-jumia-orange transition-colors shadow-sm">
                                  <FileText size={24} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-j-text uppercase tracking-tight mb-1">{doc.type.replace(/_/g, ' ')}</p>
                                  <p className="text-[9px] text-j-text-muted font-black uppercase tracking-widest opacity-40">Uploaded: {format(new Date(doc.createdAt), 'MMM dd, yyyy')}</p>
                                </div>
                              </div>
                              <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                                doc.status === 'APPROVED' ? 'bg-green-50 text-j-success border-green-100' :
                                doc.status === 'REJECTED' ? 'bg-red-50 text-j-error border-red-100' :
                                'bg-orange-50 text-jumia-orange border-orange-100 animate-pulse'
                              }`}>
                                {doc.status}
                              </span>
                            </div>

                            <div className="aspect-video bg-white rounded-sm border border-j-border overflow-hidden relative group/img shadow-sm">
                              <img src={doc.url} alt={doc.type} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105 p-2 opacity-90" />
                              <div className="absolute inset-0 bg-j-text/80 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="h-10 px-6 bg-white text-j-text rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-jumia-orange hover:text-white transition-all shadow-lg"
                                >
                                  <ExternalLink size={14} />
                                  View Document
                                </a>
                              </div>
                            </div>

                            {doc.status === 'PENDING' && (
                              <div className="flex flex-col gap-4 pt-2">
                                <textarea 
                                  placeholder="Provide reason for rejection (optional for approval)..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="w-full bg-white border border-j-border rounded-sm p-4 text-[10px] font-bold text-j-text focus:border-jumia-orange outline-none min-h-[100px] transition-all"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                  <button 
                                    onClick={() => reviewDoc.mutate({ documentId: doc.id, decision: 'APPROVED' })}
                                    disabled={reviewDoc.isPending}
                                    className="h-12 bg-white text-j-success border border-j-border rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-j-success hover:text-white hover:border-j-success transition-all shadow-sm active:scale-95"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => reviewDoc.mutate({ documentId: doc.id, decision: 'REJECTED', rejectionReason })}
                                    disabled={reviewDoc.isPending || !rejectionReason}
                                    className="h-12 bg-white text-j-error border border-j-border rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-j-error hover:text-white hover:border-j-error transition-all shadow-sm active:scale-95 disabled:opacity-30"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-j-background border border-j-border rounded-sm p-8 shadow-inner">
                        <div className="flex items-center gap-3 mb-8">
                          <Gavel size={20} className="text-jumia-orange" />
                          <h4 className="text-[10px] font-black text-j-text uppercase tracking-widest">Verification Guidelines</h4>
                        </div>
                        <ul className="space-y-8">
                          {[
                            'Verify identity details against system records.',
                            'Ensure bank account details match the business entity.',
                            'Audit document validity and check expiry dates.',
                            'Verify document clarity and reject blurry uploads.'
                          ].map((rule, i) => (
                            <li key={i} className="flex gap-4 group/item">
                              <div className="w-8 h-8 bg-white border border-j-border rounded-sm flex items-center justify-center shrink-0 text-jumia-orange font-black text-xs shadow-sm">
                                {i + 1}
                              </div>
                              <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest leading-relaxed opacity-60 pt-1">
                                {rule}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-j-text text-white rounded-sm p-8 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <Activity size={18} className="text-jumia-orange animate-pulse" />
                          <p className="text-[9px] font-black text-jumia-orange uppercase tracking-widest">Automatic Activation</p>
                        </div>
                        <p className="text-[11px] font-black text-white/40 leading-relaxed uppercase tracking-widest relative z-10">
                          Sellers are automatically activated upon successful validation of all identity documents and financial records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-sm border border-j-border border-dashed py-48 flex flex-col items-center justify-center text-center px-12 shadow-sm">
                <div className="w-24 h-24 bg-j-background rounded-full flex items-center justify-center text-j-text-muted/10 mb-8 border border-j-border shadow-inner">
                  <Shield size={48} className="opacity-20" />
                </div>
                <h3 className="text-2xl font-black text-j-text uppercase tracking-tight mb-2">No Seller Selected</h3>
                <p className="text-[10px] text-j-text-muted font-black uppercase tracking-widest opacity-60 max-w-xs leading-relaxed">
                  Select a seller from the pending queue to begin the verification process.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminKYCPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1184px] mx-auto py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-jumia-orange/20 border-t-jumia-orange rounded-full animate-spin" />
        <p className="text-[10px] font-black text-jumia-orange uppercase tracking-widest animate-pulse">Loading Queue...</p>
      </div>
    }>
      <AdminKYCContent />
    </Suspense>
  );
}
