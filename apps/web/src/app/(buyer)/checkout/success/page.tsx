'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
 CheckCircle2, 
 ArrowRight, 
 PackageCheck, 
 Truck, 
 CalendarCheck, 
 ShieldCheck,
 ShoppingBag,
 Activity,
 Zap,
 Box
} from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
 const searchParams = useSearchParams();
 const orderId = searchParams.get('orderId');

 return (
 <div className="w-full max-w-2xl px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="bg-surface-container-lowest rounded-[64px] border-8 border-surface-container-low shadow-soft overflow-hidden relative group">
 {/* Animated Background Pulse */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-[100px] animate-pulse" />
 
 {/* Header Section */}
 <div className="bg-surface-container-low/30 h-64 flex flex-col items-center justify-center relative overflow-hidden border-b-4 border-surface-container-low">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-success/5 via-transparent to-transparent opacity-50" />
 <div className="relative">
 <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full scale-150 animate-pulse" />
 <div className="relative w-28 h-28 bg-jumia-orange text-success rounded flex items-center justify-center border border-success/20 shadow-2xl transform hover:scale-110 transition-all duration-700">
 <CheckCircle2 size={56} strokeWidth={1.5} className="animate-in zoom-in duration-500 delay-300" />
 </div>
 </div>
 </div>

 <div className="p-12 md:p-16 text-center space-y-12">
 <div className="space-y-4">
 <h1 className="text-4xl md:text-5xl font-semibold text-on-surface uppercase tracking-tighter leading-none">
 Mission <span className="text-success">Accomplished</span>
 </h1>
 <div className="flex flex-col items-center gap-4">
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase tracking-[0.4em] opacity-40 italic">Order Pipeline Initialized</p>
 <div className="bg-jumia-orange text-white px-8 py-3 rounded-2xl shadow-xl border border-white/5 flex items-center gap-4 group/ref">
 <Box size={16} className="text-jumia-orange group-hover/ref:rotate-12 transition-transform" />
 <span className="font-semibold text-xl tracking-tighter">#{orderId?.substring(0, 16).toUpperCase() || 'CANONICAL-ID'}</span>
 </div>
 </div>
 </div>

 <p className="text-on-surface-variant font-medium italic text-sm max-w-md mx-auto leading-relaxed opacity-80">
 The central grid has confirmed your acquisition. Logistics nodes are currently synchronizing for immediate fulfillment and dispatch.
 </p>

 {/* Fulfillment Matrix */}
 <div className="space-y-8 bg-surface-container-low/20 p-10 rounded-[48px] border border-surface-container-low">
 <div className="flex items-center gap-4">
 <Activity size={16} className="text-jumia-orange animate-pulse" />
 <p className="text-[10px] font-semibold text-on-surface uppercase tracking-[0.4em]">Operational Sequence</p>
 <div className="h-1 bg-surface-container-low flex-1 rounded-full overflow-hidden">
 <div className="h-full bg-jumia-orange w-1/3 animate-in slide-in-from-left duration-1000" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { icon: PackageCheck, title: 'Verification', status: 'Active' },
 { icon: Truck, title: 'Logistics', status: 'Pending' },
 { icon: CalendarCheck, title: 'Handover', status: 'Scheduled' }
 ].map((step, i) => (
 <div key={i} className="bg-surface-container-lowest p-6 rounded border-2 border-surface-container-low shadow-sm hover:translate-y-[-4px] transition-all group">
 <div className="w-12 h-12 bg-jumia-orange/5 text-on-surface-variant rounded-2xl flex items-center justify-center mb-4 border-2 border-outline-variant/10 group-hover:bg-jumia-orange-dark group-hover:text-white transition-all">
 <step.icon size={22} strokeWidth={1.5} />
 </div>
 <h4 className="text-[11px] font-semibold text-on-surface uppercase tracking-[0.2em] mb-1">{step.title}</h4>
 <p className="text-[9px] font-semibold text-jumia-orange uppercase tracking-widest italic opacity-60">{step.status}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Primary Actions */}
 <div className="flex flex-col sm:flex-row gap-6 pt-4">
 <Link 
 href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
 className="flex-1 h-20 bg-jumia-orange text-white font-semibold px-10 rounded hover:bg-jumia-orange transition-all transform active:scale-95 shadow-2xl shadow-primary-container/20 text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 group"
 >
 Track Order
 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </Link>
 <Link 
 href="/"
 className="flex-1 h-20 bg-surface-container-low text-on-surface font-semibold px-10 rounded hover:bg-surface-container-lowest border border-surface-container-lowest transition-all text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4"
 >
 <ShoppingBag size={20} />
 Continue
 </Link>
 </div>
 </div>

 {/* Security Matrix Footer */}
 <div className="bg-jumia-orange p-10 border-t-8 border-jumia-orange/20 flex flex-col md:flex-row items-center justify-between gap-8">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-white/5 text-success rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-2xl">
 <ShieldCheck size={28} />
 </div>
 <div className="text-left">
 <p className="text-[11px] font-semibold text-white uppercase tracking-widest mb-1">Encrypted Settlement</p>
 <p className="text-[9px] text-white/30 font-semibold uppercase tracking-[0.2em] italic">NODE-TO-NODE VERIFIED</p>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-full border-2 border-white/5 backdrop-blur-xl">
 <Zap size={16} className="text-jumia-orange animate-pulse" />
 <span className="text-[10px] font-semibold uppercase text-white/60 tracking-[0.3em]">Status: Priority Fulfillment</span>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function SuccessPage() {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center p-6 md:p-12 select-none overflow-hidden relative">
 {/* Decorative Elements */}
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-20" />
 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-20" />
 
 <Suspense fallback={
 <div className="flex flex-col items-center gap-8 animate-pulse">
 <div className="w-32 h-32 bg-surface-container-low rounded" />
 <div className="space-y-4">
 <div className="h-4 w-64 bg-surface-container-low rounded-full mx-auto" />
 <div className="h-3 w-48 bg-surface-container-low rounded-full mx-auto opacity-50" />
 </div>
 </div>
 }>
 <SuccessContent />
 </Suspense>
 </div>
 );
}
