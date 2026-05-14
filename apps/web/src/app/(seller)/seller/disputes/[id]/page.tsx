'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { ArrowLeft, Send, Upload, ShieldAlert, MessageSquare, ExternalLink, Activity, User, Scale } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function SellerDisputeDetailPage() {
 const { data: session } = useSession();
 const { id: disputeId } = useParams() as { id: string };
 const [message, setMessage] = useState('');
 
 const utils = api.useUtils();
 const { data: dispute, isLoading } = api.dispute.getThread.useQuery({ disputeId });
 
 const respondMutation = api.dispute.respond.useMutation({
 onSuccess: () => {
 setMessage('');
 utils.dispute.getThread.invalidate({ disputeId });
 }
 });

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Establishing Secure Thread</p>
 </div>
 </div>
 );
 }

 if (!dispute) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center p-6">
 <div className="bg-surface-container-lowest p-16 rounded-[48px] border border-surface-container-low shadow-soft text-center max-w-lg w-full">
 <ShieldAlert className="mx-auto text-error mb-8" size={64} />
 <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Thread <span className="text-error">Null</span></h2>
 <p className="text-on-surface-variant/40 text-[11px] font-semibold uppercase tracking-[0.3em] mb-10 italic">THE REQUESTED CONFLICT THREAD DOES NOT EXIST IN THE CURRENT DATASET.</p>
 <Link href="/seller/disputes" className="h-16 px-12 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase tracking-[0.4em] hover:bg-jumia-orange-dark transition-all flex items-center justify-center gap-4 mx-auto w-fit">
 Return to Matrix <ArrowLeft size={18} />
 </Link>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-6xl mx-auto px-6">
 <Link href="/seller/disputes" className="inline-flex items-center gap-3 text-on-surface-variant/40 hover:text-on-surface font-semibold text-[10px] uppercase tracking-[0.4em] mb-12 group">
 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Back to Conflict Matrix
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 <div className="lg:col-span-8 space-y-8">
 <div className="bg-surface-container-lowest rounded-[48px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="p-8 border-b-4 border-surface-container-low bg-surface-container-low/30 flex items-center justify-between">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-error/10 text-error rounded-sm flex items-center justify-center border-2 border-error/10">
 <ShieldAlert size={28} />
 </div>
 <div>
 <h1 className="text-2xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Conflict <span className="text-error">Diagnostic</span></h1>
 <div className="flex items-center gap-3 mt-2">
 <span className={`text-[9px] px-3 py-1 rounded-full font-semibold uppercase border-2 ${
 dispute.status === 'OPEN' ? 'bg-error/5 text-error border-error/10' : 'bg-success/5 text-success border-success/10'
 }`}>
 {dispute.status.replace('_', ' ')}
 </span>
 </div>
 </div>
 </div>
 <div className="text-right">
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] italic">Operational ID</p>
 <p className="text-sm font-semibold text-on-surface">#{dispute.orderId.slice(-8).toUpperCase()}</p>
 </div>
 </div>

 {/* Chat Interface */}
 <div className="p-8 bg-surface-container-lowest min-h-[500px] max-h-[700px] overflow-y-auto flex flex-col gap-10 custom-scrollbar">
 <div className="bg-error/5 p-8 rounded border-2 border-error/10 animate-in zoom-in-95 duration-500">
 <div className="flex items-center gap-3 mb-4 text-error">
 <Scale size={18} />
 <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">PRIMARY CONFLICT REASON</p>
 </div>
 <p className="text-sm font-semibold text-on-surface leading-relaxed uppercase tracking-tighter italic">{dispute.reason}</p>
 </div>

 {dispute.messages.map((msg) => {
 const isMe = msg.senderId === session?.user?.id;
 const isModerator = msg.senderId !== dispute.buyerId && msg.senderId !== dispute.sellerId;
 
 return (
 <div key={msg.id} className={`flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
 <div className="flex items-center gap-3 mb-3">
 <span className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic">
 {isModerator ? 'Central Moderator' : msg.senderId === dispute.buyerId ? 'Consumer Node' : 'Vendor Node (YOU)'}
 </span>
 <div className="w-1 h-1 bg-jumia-orange-variant/20 rounded-full" />
 <span className="text-on-surface-variant/40 text-[9px] font-semibold uppercase tracking-widest">{format(new Date(msg.createdAt), 'dd MMM, HH:mm')}</span>
 </div>
 <div className={`p-6 rounded text-[11px] font-semibold uppercase tracking-widest leading-relaxed shadow-soft border-2 ${
 isModerator ? 'bg-jumia-orange/10 border-jumia-orange/20 text-jumia-orange' :
 isMe ? 'bg-jumia-orange text-white border-on-surface rounded-tr-none' : 'bg-surface-container-low border-surface-container-low rounded-tl-none text-on-surface'
 }`}>
 {msg.content.toUpperCase()}
 </div>
 </div>
 );
 })}
 </div>

 {/* Reply Box */}
 {dispute.status !== 'RESOLVED' && (
 <div className="p-8 border-t-4 border-surface-container-low bg-surface-container-low/30 flex items-center gap-6">
 <div className="flex-1 relative">
 <input
 type="text"
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="PROVIDE PROFESSIONAL RESOLUTION LOG..."
 className="w-full h-16 px-8 border-2 border-surface-container-low focus:border-jumia-orange rounded-2xl outline-none font-semibold text-[10px] uppercase tracking-widest text-on-surface bg-surface-container-lowest transition-all"
 onKeyDown={(e) => {
 if (e.key === 'Enter' && message.trim()) {
 respondMutation.mutate({ disputeId, content: message });
 }
 }}
 />
 </div>
 <button 
 onClick={() => message.trim() && respondMutation.mutate({ disputeId, content: message })}
 disabled={respondMutation.isLoading || !message.trim()}
 className="h-16 px-10 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase tracking-[0.3em] hover:bg-jumia-orange-dark transition-all active:scale-95 shadow-xl flex items-center gap-4 disabled:opacity-30 group"
 >
 Reply <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Sidebar */}
 <div className="lg:col-span-4 space-y-8">
 <div className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft p-10 animate-in fade-in slide-in-from-right-8 duration-700">
 <h2 className="text-[10px] font-semibold text-on-surface uppercase tracking-[0.4em] mb-10 border-b-2 border-surface-container-low pb-6">Node Metadata</h2>
 <div className="space-y-8">
 <div className="group">
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-2 italic">Counterparty Identity</p>
 <p className="text-sm font-semibold text-on-surface uppercase tracking-tighter group-hover:text-jumia-orange transition-colors">{dispute.buyer.firstName} {dispute.buyer.lastName}</p>
 </div>
 <div>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-2 italic">Sequence Initialization</p>
 <p className="text-sm font-semibold text-on-surface uppercase tracking-tighter">{format(new Date(dispute.createdAt), 'PPP').toUpperCase()}</p>
 </div>
 <div>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-2 italic">Last Protocol Sync</p>
 <p className="text-sm font-semibold text-on-surface uppercase tracking-tighter">{format(new Date(dispute.updatedAt), 'PPP').toUpperCase()}</p>
 </div>
 <div className="pt-8 border-t-2 border-surface-container-low">
 <Link href={`/seller/orders/${dispute.orderId}`} className="text-jumia-orange font-semibold flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] hover:opacity-70 transition-all group">
 Audit Order <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
 </Link>
 </div>
 </div>
 </div>
 
 <div className="bg-jumia-orange text-white rounded p-8 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-jumia-orange/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
 <p className="text-[9px] font-semibold uppercase tracking-[0.4em] mb-4 opacity-40">Systemic SLA</p>
 <p className="text-[10px] font-semibold uppercase tracking-[0.2em] leading-relaxed italic relative z-10">
 RESPOND WITHIN 24H TO PREVENT AUTOMATIC ESCALATION TO CENTRAL ARBITRATION.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
