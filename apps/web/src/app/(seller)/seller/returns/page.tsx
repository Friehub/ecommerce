'use client';

import React from 'react';
import Image from 'next/image';
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
 Search,
 SearchCode,
 ArrowUpRight,
 History,
 ShieldCheck,
 UserCheck,
 Sparkles,
 ArrowRight
} from 'lucide-react';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function SellerReturnsPage() {
 const { data: returns, isLoading } = api.return.listForSeller.useQuery();

 if (isLoading) {
 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="space-y-6">
 <Skeleton className="h-16 w-96 rounded" />
 <Skeleton className="h-6 w-64 rounded-xl" />
 </div>
 <Skeleton className="h-20 w-80 rounded" />
 </div>
 <div className="space-y-8">
 {[...Array(3)].map((_, i) => (
 <Skeleton key={i} className="h-40 w-full rounded" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <RotateCcw size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Reverse Logistics Protocol</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Asset <br />
 <span className="text-jumia-orange italic">Reclamation.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Client Ingestion & Quality Assurance Authorization</p>
 </div>
 
 <div className="relative group w-full md:w-96 animate-in slide-in-from-right-8 duration-1000">
 <SearchCode className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-focus-within:opacity-100 transition-all duration-500" size={24} />
 <input 
 type="text" 
 placeholder="LOCATE RECLAMATION ID..."
 className="w-full pl-20 pr-8 py-6 bg-surface-container-low border border-surface-container-lowest rounded focus:outline-none focus:border-jumia-orange/50 focus:ring-8 focus:ring-primary-container/5 text-xs font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50  transition-all shadow-soft"
 />
 </div>
 </div>

 <div className="space-y-8">
 {returns && returns.length > 0 ? (
 returns.map((req: any, idx: number) => (
 <div key={req.id} className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft overflow-hidden hover:translate-y-[-8px] transition-all duration-700 group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex flex-col lg:flex-row">
 {/* Product Section */}
 <div className="p-10 lg:w-[35%] flex items-center gap-10 border-r-4 border-surface-container-low">
 <div className="w-28 h-28 bg-surface-container-low rounded flex items-center justify-center border-2 border-outline-variant/5 shrink-0 group-hover:scale-105 transition-transform duration-1000 overflow-hidden shadow-inner relative">
 <Image 
 src={req.orderLine.variant.product.media[0]?.url || ''} 
 alt={req.orderLine.variant.product.title}
 fill
 sizes="112px"
 className="object-contain p-4"
 />
 </div>
 <div className="min-w-0">
 <h4 className="font-semibold text-on-surface text-lg leading-none uppercase truncate mb-4 tracking-tighter group-hover:text-jumia-orange transition-colors duration-500">{req.orderLine.variant.product.title}</h4>
 <div className="flex items-center gap-4">
 <span className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  bg-surface-container-low px-3 py-1.5 rounded-xl italic">ORD #{req.orderLine.package.order.id.slice(-12).toUpperCase()}</span>
 <History size={16} className="text-on-surface-variant opacity-20" />
 </div>
 </div>
 </div>

 {/* Logistics Detail */}
 <div className="p-10 lg:w-[30%] border-r-4 border-surface-container-low flex flex-col justify-center">
 <div className="flex items-center gap-3 mb-4">
 <Sparkles size={14} className="text-jumia-orange" />
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  italic leading-none">Reclamation Payload</p>
 </div>
 <p className="text-sm font-semibold text-on-surface uppercase tracking-tighter italic mb-4 leading-relaxed line-clamp-2 opacity-80">"{req.reason}"</p>
 <div className="flex items-center gap-3">
 <Calendar size={14} className="text-on-surface-variant opacity-20" />
 <span className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  italic">
 {format(new Date(req.createdAt), 'MMM dd, yyyy')}
 </span>
 </div>
 </div>

 {/* Client Intelligence */}
 <div className="p-10 lg:w-[20%] border-r-4 border-surface-container-low flex flex-col justify-center">
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  mb-6 italic">Origin Consumer</p>
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-jumia-orange text-white rounded-sm flex items-center justify-center border border-surface-container-low shadow-2xl transition-transform duration-700 group-hover:-rotate-12">
 <UserCheck size={24} />
 </div>
 <div>
 <span className="text-sm font-semibold text-on-surface uppercase tracking-tight leading-none block mb-2">
 {req.orderLine.package.order.user.firstName} {req.orderLine.package.order.user.lastName.charAt(0)}.
 </span>
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
 <p className="text-[9px] font-semibold text-success uppercase  italic">Node Verified</p>
 </div>
 </div>
 </div>
 </div>

 {/* Operational State */}
 <div className="p-10 lg:flex-1 bg-surface-container-low/20 flex items-center justify-between lg:flex-col lg:justify-center lg:gap-8">
 <div className="flex items-center gap-4">
 {req.status === 'PENDING' ? (
 <span className="bg-jumia-orange/10 text-jumia-orange px-8 py-3 rounded-full text-[9px] font-semibold uppercase  border-2 border-jumia-orange/20 shadow-sm flex items-center gap-3 italic">
 <AlertCircle size={16} className="animate-pulse" /> PENDING QA
 </span>
 ) : req.status === 'APPROVED' ? (
 <span className="bg-success-container/10 text-success px-8 py-3 rounded-full text-[9px] font-semibold uppercase  border-2 border-success/20 shadow-sm flex items-center gap-3 italic">
 <CheckCircle2 size={16} /> AUTHORIZED
 </span>
 ) : (
 <span className="bg-error-container/10 text-error px-8 py-3 rounded-full text-[9px] font-semibold uppercase  border-2 border-error/20 shadow-sm flex items-center gap-3 italic">
 <XCircle size={16} /> REJECTED
 </span>
 )}
 </div>
 
 <button className="flex items-center gap-3 text-[10px] font-semibold uppercase  text-on-surface-variant hover:text-jumia-orange transition-all duration-500 group/inspect">
 INSPECT NODE <ArrowRight size={18} className="group-hover/inspect:translate-x-2 transition-transform duration-500" />
 </button>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="bg-surface-container-low/30 rounded-[64px] border border-dashed border-outline-variant/30 p-40 text-center animate-in fade-in zoom-in-95 duration-1000">
 <div className="w-32 h-32 bg-surface-container-low border border-surface-container-lowest rounded flex items-center justify-center mx-auto mb-10 shadow-inner group">
 <ShieldCheck size={64} strokeWidth={1} className="text-on-surface-variant opacity-10 group-hover:scale-110 transition-transform duration-1000" />
 </div>
 <h3 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none mb-6">Logistics Integrity High</h3>
 <p className="text-[10px] font-semibold text-on-surface-variant uppercase  max-w-md mx-auto italic leading-relaxed opacity-40">
 No reclamation requests detected in the current cycle. All consumer nodes reporting successful fulfillment telemetry.
 </p>
 </div>
 )}
 </div>
 </div>
 );
}
