'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { 
 ChevronLeft, 
 Send, 
 User, 
 Store, 
 ShieldAlert, 
 CheckCircle,
 Clock,
 AlertCircle,
 FileText,
 ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DisputeThreadPage() {
 const { id } = useParams() as { id: string };
 const utils = api.useUtils();
 const { toast } = useToast();
 const [message, setMessage] = useState('');

 const { data: dispute, isLoading } = api.dispute.getThread.useQuery({ disputeId: id });
 
 const sendMessage = api.dispute.respond.useMutation({
 onSuccess: () => {
 setMessage('');
 utils.dispute.getThread.invalidate({ disputeId: id });
 toast({ title: 'Message Sent', message: 'Your response has been recorded.', type: 'success' });
 }
 });

 const escalate = api.dispute.escalate.useMutation({
 onSuccess: () => {
 utils.dispute.getThread.invalidate({ disputeId: id });
 toast({ title: 'Dispute Escalated', message: 'This case is now under support review.', type: 'warning' });
 }
 });

 const { data: session } = useSession();
 const isAdmin = session?.user?.role === 'ADMIN';

 const resolveDispute = api.admin.resolveDispute.useMutation({
 onSuccess: () => {
 utils.dispute.getThread.invalidate({ disputeId: id });
 toast({ title: 'Case Resolved', message: 'The dispute has been officially closed.', type: 'success' });
 }
 });

 if (isLoading) {
 return (
 <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
 <Skeleton className="h-4 w-48 rounded-lg" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <Skeleton className="h-48 w-full rounded-[32px]" />
 <Skeleton className="h-24 w-2/3 rounded-[24px]" />
 <Skeleton className="h-24 w-2/3 ml-auto rounded-[24px]" />
 </div>
 <Skeleton className="h-64 w-full rounded-[32px]" />
 </div>
 </div>
 );
 }

 if (!dispute) {
 return (
 <div className="max-w-5xl mx-auto px-4 py-24 text-center">
 <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter mb-4">Dispute Not Found</h2>
 <Link href="/disputes" className="text-primary-container font-black uppercase tracking-widest hover:underline">Back to Dispute Center</Link>
 </div>
 );
 }

 const handleSend = (e: React.FormEvent) => {
 e.preventDefault();
 if (!message.trim()) return;
 sendMessage.mutate({ disputeId: id, content: message });
 };

 return (
 <div className="min-h-screen pb-32 bg-surface-container-lowest/50">
 <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
 <Link href="/disputes" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-all font-black text-[10px] uppercase tracking-[0.2em] group">
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Back to Dispute Center
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 {/* Header / Info */}
 <div className="bg-surface-container-low rounded-[40px] border-4 border-surface-container-lowest shadow-soft p-8 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl" />
 <div className="relative z-10">
 <div className="flex items-center justify-between mb-6">
 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 ${
 dispute.status === 'OPEN' ? 'bg-error-container/10 text-error border-error/20' :
 dispute.status === 'UNDER_REVIEW' ? 'bg-warning-container/10 text-warning border-warning/20' :
 'bg-success-container/10 text-success border-success/20'
 }`}>
 {dispute.status.replace('_', ' ')}
 </span>
 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-60">
 Reference #{dispute.orderId.slice(-8).toUpperCase()}
 </span>
 </div>
 <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tighter leading-none mb-6 uppercase">{dispute.reason}</h1>
 <div className="flex flex-wrap items-center gap-6">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant/30">
 <User size={14} className="text-primary-container" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">{dispute.buyer.firstName} {dispute.buyer.lastName}</span>
 </div>
 <div className="w-1.5 h-1.5 bg-outline-variant rounded-full opacity-30" />
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant/30">
 <Store size={14} className="text-secondary" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">{dispute.seller.businessName}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Message Thread */}
 <div className="space-y-6">
 {dispute.messages.map((msg: any, idx: number) => {
 const isMe = msg.senderId === dispute.buyerId;
 return (
 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`} style={{ animationDelay: `${idx * 100}ms` }}>
 <div className={`max-w-[85%] rounded-[28px] p-6 shadow-soft border-2 ${
 isMe 
 ? 'bg-on-surface text-white border-transparent rounded-tr-none shadow-on-surface/10' 
 : 'bg-surface-container-low text-on-surface border-surface-container-lowest rounded-tl-none'
 }`}>
 <p className="text-sm font-medium leading-relaxed opacity-90">{msg.content}</p>
 <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-3">
 <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isMe ? 'text-white/40' : 'text-on-surface-variant'}`}>
 {format(new Date(msg.createdAt), 'HH:mm • dd MMM yyyy')}
 </p>
 {isMe ? <CheckCircle size={10} className="text-primary-container" /> : <Clock size={10} className="text-on-surface-variant opacity-40" />}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Reply Area */}
 {dispute.status !== 'RESOLVED' && (
 <form onSubmit={handleSend} className="bg-surface-container-lowest rounded-[32px] border-4 border-surface-container-low shadow-2xl p-4 flex gap-4 items-end">
 <textarea 
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="Elaborate on your case..."
 rows={2}
 className="flex-1 bg-surface-container-low border-2 border-transparent focus:border-primary-container/30 focus:bg-surface-container-lowest rounded-[24px] p-4 text-sm font-medium transition-all outline-none resize-none placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 <button 
 type="submit"
 disabled={sendMessage.isLoading || !message.trim()}
 className="bg-primary-container text-white w-16 h-16 rounded-[24px] shadow-2xl shadow-primary-container/40 flex items-center justify-center hover:-translate-y-1 hover:shadow-primary-container/60 transition-all active:scale-90 disabled:opacity-50 flex-shrink-0"
 >
 <Send size={24} className="-rotate-12" />
 </button>
 </form>
 )}
 </div>

 <div className="space-y-8">
 <div className="bg-surface-container-low rounded-[40px] border-4 border-surface-container-lowest shadow-soft p-8">
 <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
 <ShieldAlert size={18} className="text-primary-container" /> Strategic Control
 </h3>
 
 {isAdmin && dispute.status !== 'RESOLVED' && (
 <div className="space-y-6">
 <div className="p-6 bg-primary-container/5 border-2 border-primary-container/20 rounded-[28px]">
 <p className="text-[9px] font-black text-primary-container uppercase tracking-[0.2em] mb-6 italic">Authority Console</p>
 <div className="space-y-5">
 <div className="space-y-2">
 <label className="text-[8px] font-black uppercase text-on-surface-variant tracking-widest opacity-60 px-2">Resolution Amount</label>
 <input 
 type="number" 
 placeholder="0.00"
 id="refundAmount"
 className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 rounded-2xl p-4 text-sm font-black focus:border-primary-container outline-none transition-all"
 />
 </div>
 <div className="flex flex-col gap-3">
 <button 
 onClick={() => {
 const amount = (document.getElementById('refundAmount') as HTMLInputElement)?.value;
 resolveDispute.mutate({ 
 disputeId: id, 
 resolution: 'RESOLVED', 
 refundAmount: amount ? parseFloat(amount) : undefined 
 });
 }}
 disabled={resolveDispute.isLoading}
 className="w-full bg-primary-container text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-container/30 hover:-translate-y-1 transition-all"
 >
 Authorize Refund
 </button>
 <button 
 onClick={() => resolveDispute.mutate({ disputeId: id, resolution: 'REJECTED' })}
 disabled={resolveDispute.isLoading}
 className="w-full bg-error text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-error/30 hover:-translate-y-1 transition-all"
 >
 Dismiss Claim
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 <div className="space-y-4">
 {dispute.status === 'OPEN' && !isAdmin && (
 <div className="p-6 bg-warning-container/10 border-2 border-warning/20 rounded-[28px]">
 <p className="text-[9px] font-black text-warning uppercase tracking-[0.2em] leading-relaxed italic">
 Communication stalled? Escalate to Support for immediate intervention.
 </p>
 <button 
 onClick={() => escalate.mutate({ disputeId: id })}
 disabled={escalate.isLoading}
 className="mt-6 w-full bg-on-surface text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95"
 >
 Escalate Now
 </button>
 </div>
 )}

 {dispute.status === 'ESCALATED' && (
 <div className="p-6 bg-primary-container/10 border-2 border-primary-container/20 rounded-[28px] flex gap-4">
 <Clock size={24} className="text-primary-container shrink-0" />
 <div>
 <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.2em]">Priority Review</p>
 <p className="text-[9px] font-medium text-on-surface-variant mt-1 leading-relaxed italic">An elite moderator is auditing this transaction thread.</p>
 </div>
 </div>
 )}

 {dispute.status === 'RESOLVED' && (
 <div className="p-6 bg-success-container/10 border-2 border-success/20 rounded-[28px] flex gap-4">
 <CheckCircle size={24} className="text-success shrink-0" />
 <div>
 <p className="text-[10px] font-black text-success uppercase tracking-[0.2em]">Case Finalized</p>
 <p className="text-[9px] font-medium text-on-surface-variant mt-1 italic">Resolution has been successfully implemented.</p>
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="bg-on-surface rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl border-4 border-surface-container-low">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl" />
 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 opacity-60">
 <ShieldCheck size={20} className="text-primary-container" /> Jumia Guarantee
 </h3>
 <p className="text-[11px] font-medium opacity-70 leading-relaxed italic">
 Your purchase is protected. If the item deviates from the description or fails to arrive, a full reconciliation is guaranteed.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

