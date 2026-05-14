'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { AlertCircle, ChevronLeft, Send, ShieldAlert, Activity, ArrowRight, Gavel } from 'lucide-react';
import Link from 'next/link';

function NewDisputePageContent() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const orderId = searchParams.get('orderId');
 const [reason, setReason] = useState('');
 const [description, setDescription] = useState('');

 const { data: order, isLoading } = api.order.get.useQuery(
 { orderId: orderId || '' },
 { enabled: !!orderId }
 );

 const createDispute = api.dispute.openDispute.useMutation({
 onSuccess: (dispute) => {
 router.push(`/disputes/${dispute.id}`);
 }
 });

 if (!orderId) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center p-6">
 <div className="bg-surface-container-lowest p-16 rounded-[48px] border border-surface-container-low shadow-soft text-center max-w-lg w-full">
 <AlertCircle className="mx-auto text-error mb-8" size={64} />
 <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Null <span className="text-error">Context</span></h2>
 <p className="text-on-surface-variant/40 text-[11px] font-semibold uppercase tracking-[0.3em] mb-10 italic">NO ORDER IDENTITY PROVIDED FOR DISPUTE INITIALIZATION.</p>
 <Link href="/account/orders" className="h-16 px-12 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase tracking-[0.4em] hover:bg-jumia-orange-dark transition-all flex items-center justify-center gap-4 mx-auto w-fit">
 Return to Orders <ArrowRight size={18} />
 </Link>
 </div>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant opacity-40">Fetching Order Manifest</p>
 </div>
 </div>
 );
 }

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 createDispute.mutate({
 orderId: orderId,
 reason: `${reason}: ${description}`
 });
 };

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-3xl mx-auto px-6">
 <Link href={`/account/orders/${orderId}`} className="flex items-center gap-3 text-on-surface-variant/40 hover:text-on-surface transition-colors font-semibold text-[10px] uppercase tracking-[0.4em] mb-12 group">
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Back to Order Manifest
 </Link>

 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low shadow-soft overflow-hidden p-10 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="flex items-center gap-6 mb-12 pb-10 border-b-4 border-surface-container-low">
 <div className="w-16 h-16 bg-error/10 text-error rounded flex items-center justify-center border-2 border-error/10 shadow-xl shadow-error/5">
 <ShieldAlert size={32} />
 </div>
 <div>
 <h1 className="text-4xl font-semibold text-on-surface tracking-tighter uppercase leading-none">Initiate <span className="text-error">Conflict</span></h1>
 <div className="flex items-center gap-3 mt-3">
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic">Node #{orderId.slice(-8).toUpperCase()}</p>
 </div>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-10">
 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-[0.3em] ml-2 italic">Conflict Taxonomy</label>
 <select 
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 required
 className="w-full h-16 px-6 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl focus:border-jumia-orange text-[11px] font-semibold uppercase tracking-widest text-on-surface outline-none appearance-none"
 >
 <option value="">SELECT REASON CLASSIFICATION...</option>
 <option value="ITEM_NOT_RECEIVED">ITEM NOT RECEIVED</option>
 <option value="WRONG_ITEM">WRONG ITEM RECEIVED</option>
 <option value="DAMAGED_ITEM">ITEM DAMAGED ON ARRIVAL</option>
 <option value="NOT_AS_DESCRIBED">ITEM NOT AS DESCRIBED</option>
 <option value="PARTIAL_DELIVERY">MISSING ITEMS FROM PACKAGE</option>
 <option value="OTHER">OTHER OPERATIONAL ISSUE</option>
 </select>
 </div>

 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-[0.3em] ml-2 italic">Incident Log</label>
 <textarea 
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 required
 rows={6}
 placeholder="DESCRIBE THE TRANSACTIONAL ANOMALY IN DETAIL..."
 className="w-full px-6 py-6 bg-surface-container-low/30 border-2 border-surface-container-low rounded focus:border-jumia-orange text-[11px] font-semibold uppercase tracking-widest text-on-surface outline-none placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 </div>

 <div className="bg-jumia-orange/5 border-2 border-jumia-orange/10 p-8 rounded flex gap-5 group">
 <div className="w-10 h-10 bg-surface-container-lowest rounded-xl flex items-center justify-center text-jumia-orange shrink-0 border-2 border-jumia-orange/10">
 <Gavel size={20} />
 </div>
 <p className="text-[10px] font-semibold text-on-surface-variant/60 leading-relaxed uppercase tracking-widest italic">
 THIS DISPUTE WILL BE ROUTED TO THE VENDOR NODE FIRST. IF NO SETTLEMENT IS REACHED WITHIN <span className="text-jumia-orange">72 HOURS</span>, SYSTEMIC ESCALATION TO CENTRAL RESOLUTIONS WILL FIRE AUTOMATICALLY.
 </p>
 </div>

 <button 
 type="submit"
 disabled={createDispute.isLoading}
 className="w-full h-20 bg-jumia-orange text-white rounded font-semibold uppercase tracking-[0.4em] text-xs transition-all flex items-center justify-center gap-4 shadow-2xl hover:bg-jumia-orange-dark active:scale-95 disabled:opacity-30 group"
 >
 {createDispute.isLoading ? 'Initalizing Node...' : (
 <>
 Transmit Conflict Log <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </>
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
}

export default function NewDisputePage() {
 return (
 <Suspense fallback={
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 </div>
 }>
 <NewDisputePageContent />
 </Suspense>
 );
}
