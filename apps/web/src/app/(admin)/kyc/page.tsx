'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/trpc/react';
import { Shield, CheckCircle, XCircle, FileText, ExternalLink, Clock, User, Building, AlertCircle, Search, MoreHorizontal, ArrowRight, Fingerprint, Loader2, Activity, Gavel } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

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
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Verification Pipeline</p>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-[1600px] mx-auto px-6 space-y-12">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-surface-container-low pb-12">
 <div className="animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="flex items-center gap-6 mb-4">
 <div className="w-16 h-16 bg-primary-container/10 border-4 border-primary-container/20 rounded-[24px] flex items-center justify-center text-primary-container shadow-2xl shadow-primary-container/5">
 <Shield size={32} />
 </div>
 <div>
 <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">KYC <span className="text-primary-container">Protocol</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Entity Identity Verification and Artifact Validation Matrix.</p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-surface-container-low/30 px-8 py-4 rounded-[24px] border-2 border-surface-container-low">
 <Activity size={20} className="text-primary-container animate-pulse" />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Pipeline Active: {queue?.length || 0} Entities Awaiting</span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
 {/* Queue List */}
 <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
 <div className="p-8 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/30">
 <div className="flex items-center gap-4">
 <Clock size={20} className="text-primary-container" />
 <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em]">Pending Registry Sync</h3>
 </div>
 </div>
 <div className="divide-y-4 divide-surface-container-low max-h-[700px] overflow-y-auto no-scrollbar">
 {queue?.map((seller) => (
 <button
 key={seller.id}
 onClick={() => setSelectedSellerId(seller.id)}
 className={`w-full text-left p-8 hover:bg-surface-container-low/20 transition-all flex items-center gap-8 group relative ${selectedSellerId === seller.id ? 'bg-primary-container/5' : ''}`}
 >
 {selectedSellerId === seller.id && <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary-container" />}
 <div className={`w-14 h-14 rounded-[22px] border-4 flex items-center justify-center shrink-0 transition-all duration-500 ${selectedSellerId === seller.id ? 'bg-on-surface text-white border-white/10 shadow-2xl' : 'bg-surface-container-low border-surface-container-low text-on-surface-variant/40'}`}>
 <Building size={24} />
 </div>
 <div className="min-w-0 flex-1">
 <p className={`font-black uppercase tracking-tighter truncate text-lg transition-colors ${selectedSellerId === seller.id ? 'text-primary-container' : 'text-on-surface'}`}>{seller.businessName}</p>
 <div className="flex items-center gap-4 mt-2">
 <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest italic leading-none">
 {seller.documents.length} ARTIFACTS
 </p>
 <div className="w-1 h-1 bg-surface-container-low rounded-full" />
 <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest italic leading-none">
 TIER {seller.tier}
 </p>
 </div>
 </div>
 <ArrowRight size={20} className={`text-primary-container transition-all duration-500 ${selectedSellerId === seller.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
 </button>
 ))}
 {queue?.length === 0 && (
 <div className="py-40 text-center px-10">
 <div className="w-24 h-24 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto mb-10 opacity-20 border-4 border-surface-container-low">
 <CheckCircle size={48} />
 </div>
 <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter">Queue Nominal</h3>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-6 italic leading-relaxed">ALL VENDOR ENTITIES HAVE BEEN SYSTEMICALLY AUDITED AND CLEARED.</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Review Detail */}
 <div className="lg:col-span-8">
 {selectedSeller ? (
 <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
 <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low shadow-soft p-12 lg:p-20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/5 rounded-full blur-[150px] -mr-64 -mt-64" />
 
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 mb-16 pb-16 border-b-4 border-surface-container-low relative z-10">
 <div className="flex items-center gap-8">
 <div className="w-24 h-24 bg-on-surface text-white rounded-[32px] flex items-center justify-center shadow-2xl border-4 border-white/10 shrink-0">
 <Fingerprint size={48} />
 </div>
 <div>
 <h2 className="text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tighter leading-none mb-4">{selectedSeller.businessName}</h2>
 <div className="flex flex-wrap items-center gap-6">
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic">Identity: {selectedSeller.id.toUpperCase()}</p>
 <div className="flex items-center gap-3 px-4 py-2 bg-primary-container/10 rounded-full border-2 border-primary-container/10">
 <div className="w-2 h-2 bg-primary-container rounded-full animate-pulse" />
 <span className="text-[9px] font-black text-primary-container uppercase tracking-[0.3em]">PRIORITY ALPHA</span>
 </div>
 </div>
 </div>
 </div>
 <button 
 onClick={() => approveSeller.mutate({ sellerId: selectedSeller.id })}
 disabled={approveSeller.isLoading}
 className="h-24 px-12 bg-on-surface text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] hover:bg-primary-container transition-all shadow-2xl active:scale-95 disabled:opacity-30 flex items-center gap-6 group/btn shrink-0"
 >
 {approveSeller.isLoading ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
 Authorize Entry <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
 </button>
 </div>

 <div className="grid grid-cols-1 2xl:grid-cols-2 gap-16 relative z-10">
 <div className="space-y-12">
 <div className="flex items-center gap-4 mb-8">
 <FileText size={20} className="text-primary-container" />
 <h4 className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.5em] italic">Payload Validation Matrix</h4>
 </div>
 <div className="space-y-10">
 {selectedSeller.documents.map((doc, dIdx) => (
 <div key={doc.id} className="bg-surface-container-low/30 border-4 border-surface-container-low rounded-[48px] p-10 space-y-8 hover:border-primary-container/20 transition-all duration-500 group/card animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${dIdx * 100}ms` }}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 bg-surface-container-lowest border-4 border-surface-container-low rounded-[24px] flex items-center justify-center text-on-surface-variant/20 group-hover/card:text-primary-container transition-colors duration-500 shadow-inner">
 <FileText size={32} />
 </div>
 <div>
 <p className="text-xl font-black text-on-surface uppercase tracking-tighter leading-none mb-2">{doc.type.replace('_', ' ')}</p>
 <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-[0.3em] italic">Logged: {format(new Date(doc.createdAt), 'dd MMM yyyy').toUpperCase()}</p>
 </div>
 </div>
 <span className={`text-[9px] h-10 px-6 rounded-full flex items-center justify-center font-black uppercase tracking-[0.4em] border-2 shadow-xl ${
 doc.status === 'APPROVED' ? 'bg-success/5 text-success border-success/10' :
 doc.status === 'REJECTED' ? 'bg-error/5 text-error border-error/10' :
 'bg-primary-container/5 text-primary-container border-primary-container/10 animate-pulse'
 }`}>
 {doc.status}
 </span>
 </div>

 <div className="aspect-video bg-surface-container-lowest rounded-[32px] border-4 border-surface-container-low overflow-hidden relative group/img shadow-inner">
 <img src={doc.url} alt={doc.type} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110 p-4 opacity-80" />
 <div className="absolute inset-0 bg-on-surface/90 opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6 backdrop-blur-md">
 <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/10 mb-2">
 <Search size={40} className="text-white" />
 </div>
 <a 
 href={doc.url} 
 target="_blank" 
 rel="noreferrer"
 className="h-16 px-10 bg-white text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl"
 >
 <ExternalLink size={20} />
 Original Artifact
 </a>
 </div>
 </div>

 {doc.status === 'PENDING' && (
 <div className="flex flex-col gap-6 animate-in slide-in-from-top-6 duration-500">
 <div className="relative">
 <textarea 
 placeholder="SPECIFY REJECTION DISCREPANCIES..."
 value={rejectionReason}
 onChange={(e) => setRejectionReason(e.target.value)}
 className="w-full bg-surface-container-lowest border-4 border-surface-container-low rounded-[32px] p-8 text-[11px] font-black uppercase tracking-widest focus:border-error transition-all min-h-[160px] outline-none text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 leading-loose italic"
 />
 </div>
 <div className="grid grid-cols-2 gap-6">
 <button 
 onClick={() => reviewDoc.mutate({ documentId: doc.id, decision: 'APPROVED' })}
 disabled={reviewDoc.isLoading}
 className="h-20 bg-on-surface text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-success transition-all active:scale-95 disabled:opacity-30 shadow-2xl group/approve"
 >
 Authorize Valid <CheckCircle size={18} className="inline ml-2 group-hover/approve:scale-125 transition-transform" />
 </button>
 <button 
 onClick={() => reviewDoc.mutate({ documentId: doc.id, decision: 'REJECTED', rejectionReason })}
 disabled={reviewDoc.isLoading || !rejectionReason}
 className="h-20 bg-error/5 text-error border-4 border-error/10 rounded-[24px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-error hover:text-white transition-all active:scale-95 disabled:opacity-30 group/reject"
 >
 Reject Data <XCircle size={18} className="inline ml-2 group-hover/reject:scale-125 transition-transform" />
 </button>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-12">
 <div className="bg-surface-container-low/30 border-4 border-surface-container-low rounded-[56px] p-12 lg:p-16 shadow-inner">
 <div className="flex items-center gap-4 mb-12">
 <Gavel size={24} className="text-primary-container" />
 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.5em] italic leading-none">Verification Protocols</h4>
 </div>
 <ul className="space-y-10">
 {[
 'CROSS-REFERENCE IDENTITY HASH WITH CORE DATABASE NODES.',
 'VERIFY BANK SETTLEMENT NODES MATCH THE REGISTERED ENTITY.',
 'DOCUMENT EXPIRATION AUDIT: ENSURE 90+ DAY VALIDITY REMAINING.',
 'ARTIFACT INTEGRITY: REJECT PAYLOADS WITH VISUAL NOISE OR OCCLUSION.'
 ].map((rule, i) => (
 <li key={i} className="flex gap-8 group/item">
 <div className="w-12 h-12 bg-surface-container-lowest border-4 border-surface-container-low rounded-[18px] flex items-center justify-center shrink-0 text-primary-container font-black text-lg shadow-xl group-hover/item:scale-110 transition-transform">
 {i + 1}
 </div>
 <p className="text-[11px] font-black text-on-surface uppercase tracking-widest leading-loose opacity-60 italic pt-1">
 {rule}
 </p>
 </li>
 ))}
 </ul>
 </div>

 <div className="bg-on-surface text-white rounded-[56px] p-12 lg:p-16 relative overflow-hidden group shadow-2xl">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
 <div className="flex items-center gap-6 mb-8 relative z-10">
 <Activity size={24} className="text-primary-container animate-pulse" />
 <p className="text-[11px] font-black text-primary-container uppercase tracking-[0.5em] italic">Systemic Auto-Sync</p>
 </div>
 <p className="text-[13px] font-black text-white/40 leading-relaxed uppercase tracking-[0.2em] italic relative z-10">
 THE PROTOCOL AUTOMATICALLY TRIGGERS ENTITY ACTIVATION UPON SUCCESSFUL VALIDATION OF ALL CORE IDENTITY ARTIFACTS AND FINANCIAL PAYLOADS.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low border-dashed py-72 flex flex-col items-center justify-center text-center px-20 shadow-soft animate-in zoom-in-95 duration-1000">
 <div className="w-32 h-32 bg-surface-container-low rounded-[48px] flex items-center justify-center text-on-surface-variant/10 mb-12 border-4 border-surface-container-lowest shadow-inner">
 <Shield size={64} className="opacity-20" />
 </div>
 <h3 className="text-4xl font-black text-on-surface uppercase tracking-tighter mb-4">Null <span className="text-primary-container">Entity</span></h3>
 <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.5em] mt-6 max-w-sm italic leading-relaxed">
 AWAITING ENTITY SELECTION FROM THE VERIFICATION PIPELINE FOR SYSTEMIC AUDIT.
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
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 </div>
 }>
 <AdminKYCContent />
 </Suspense>
 );
}
