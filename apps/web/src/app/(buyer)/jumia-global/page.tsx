'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ChevronRight, ShoppingBag, ShieldCheck, ArrowRight, Zap, Ship, Plane } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';

export default function JumiaGlobalPage() {
 const { data, isLoading } = api.catalog.listProducts.useQuery({
 limit: 20,
 sortBy: 'newest',
 isGlobal: true // Filter for international products
 });

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Establishing Trans-Atlantic Link</p>
 </div>
 </div>
 );
 }

 const products = data?.results || [];

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 {/* Hero Header */}
 <div className="bg-on-surface text-white py-24 md:py-32 relative overflow-hidden">
 {/* Background Visual */}
 <div className="absolute inset-0 opacity-10 grayscale brightness-50">
 <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200" className="w-full h-full object-cover" alt="Global Trade" />
 </div>
 <div className="absolute inset-0 bg-gradient-to-t from-on-surface to-transparent z-10" />
 <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-primary-container/20 rounded-full blur-[180px] translate-x-1/3 -translate-y-1/3 z-20" />
 
 <div className="container relative z-30 mx-auto px-6">
 <div className="max-w-4xl">
 <div className="flex flex-wrap items-center gap-4 mb-10">
 <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-white/10 transition-all hover:bg-white/10 shadow-2xl">
 <Plane size={18} className="text-primary-container" />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Global Air-Link</span>
 </div>
 <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-white/10 transition-all hover:bg-white/10 shadow-2xl">
 <Ship size={18} className="text-primary-container" />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Trans-Port Customs</span>
 </div>
 </div>
 
 <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8">
 World <br />
 <span className="text-primary-container">Market</span>
 </h1>
 
 <p className="text-sm md:text-xl text-white/40 font-black uppercase tracking-[0.2em] leading-relaxed max-w-2xl mb-12 italic">
 DIRECT ACCESS TO GLOBAL LOGISTICS NETWORKS. MILLIONS OF INTERNATIONAL NODES DISPATCHED TO YOUR SPECIFIC COORDINATES.
 </p>
 </div>
 </div>
 </div>

 <div className="container mx-auto px-6 py-16">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <Globe size={24} className="text-primary-container" />
 <h2 className="text-[10px] font-black text-primary-container uppercase tracking-[0.4em]">Global Operations</h2>
 </div>
 <h2 className="text-4xl font-black text-on-surface uppercase tracking-tighter leading-none">International <span className="text-primary-container">Catalog</span></h2>
 </div>
 <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">
 <span className="px-4 py-2 bg-surface-container-low rounded-xl border-2 border-surface-container-low text-on-surface">External Nodes: {products.length}</span>
 <span className="hidden md:inline">Cross-Border Clearance Authorized</span>
 </div>
 </div>

 {products.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
 {products.map((product: any, index: number) => (
 <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 50}ms` }}>
 <ProductCard product={product} />
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-surface-container-lowest rounded-[56px] border-4 border-surface-container-low p-24 text-center shadow-soft">
 <Globe className="mx-auto text-surface-container-low mb-10" size={80} />
 <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter mb-4">Port <span className="text-primary-container">Congestion</span></h2>
 <p className="text-on-surface-variant/40 text-[11px] max-w-sm mx-auto mb-12 font-black uppercase tracking-[0.3em] leading-relaxed italic">
 GLOBAL LOGISTICS PIPELINE IS CURRENTLY UNDERGOING SYSTEMIC SYNCHRONIZATION. INTERNATIONAL INVENTORY RE-CONNECTING SHORTLY.
 </p>
 <Link href="/" className="h-20 px-16 bg-on-surface text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary-container transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 mx-auto w-fit">
 Explore Local Hub <ArrowRight size={20} />
 </Link>
 </div>
 )}

 <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
 {[
 { 
 title: "Quality Diagnostic", 
 desc: "EVERY INTERNATIONAL UNIT UNDERGOES A SYSTEMIC MULTI-STAGE VERIFICATION BEFORE CROSS-BORDER DISPATCH.",
 icon: <ShieldCheck size={32} className="text-primary-container" />
 },
 { 
 title: "End-To-End Trace", 
 desc: "REAL-TIME TELEMETRY DATA FROM GLOBAL PORTS TO YOUR SPECIFIC DELIVERY COORDINATES.",
 icon: <Globe size={32} className="text-primary-container" />
 },
 { 
 title: "Localized Reversal", 
 desc: "RETURN GLOBAL SHIPMENTS TO YOUR NEAREST AUTHORIZED LOGISTICS HUB FOR IMMEDIATE SETTLEMENT.",
 icon: <Zap size={32} className="text-primary-container" />
 }
 ].map((benefit, i) => (
 <div key={i} className="bg-surface-container-lowest p-10 rounded-[40px] border-4 border-surface-container-low shadow-soft hover:border-primary-container/20 transition-all duration-500 group">
 <div className="w-16 h-16 bg-surface-container-low rounded-[24px] flex items-center justify-center mb-8 border-2 border-surface-container-low group-hover:bg-primary-container group-hover:text-white transition-all duration-500">
 {benefit.icon}
 </div>
 <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter mb-4">{benefit.title}</h3>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase leading-loose tracking-widest italic">{benefit.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
