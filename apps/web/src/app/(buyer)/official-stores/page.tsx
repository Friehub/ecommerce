'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, ChevronRight, ShoppingBag, Sparkles, Filter, ArrowRight } from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OfficialStoresPage() {
 const { data: brands, isLoading } = api.catalog.getBrands.useQuery();

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen">
 <div className="container py-32 text-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange border-t-transparent rounded-full animate-spin" />
 <p className="text-on-surface-variant font-semibold uppercase  text-[10px] animate-pulse italic">Synchronizing Authentic Nodes...</p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-32 select-none">
 {/* Hero Header */}
 <div className="relative bg-jumia-orange text-white py-24 md:py-40 overflow-hidden border-b border-surface-container-low">
 <div className="absolute inset-0 z-0">
 <Image 
 src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600" 
 alt="Hero Background"
 fill
 priority
 className="object-cover opacity-30 grayscale transition-transform duration-[5s] hover:scale-105"
 />
 <div className="absolute inset-0 bg-gradient-to-r from-on-surface via-on-surface/80 to-transparent" />
 </div>
 
 <div className="container relative z-10">
 <div className="max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-8">
 <div className="bg-jumia-orange/20 backdrop-blur-xl p-2.5 rounded-2xl border border-jumia-orange/30 shadow-2xl shadow-primary-container/20">
 <ShieldCheck size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Certified Sovereign Partners</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold uppercase tracking-tighter leading-[0.85] mb-8">
 Authenticity <br />
 <span className="text-jumia-orange italic">Redefined.</span>
 </h1>
 <p className="text-sm md:text-lg text-surface-variant font-semibold leading-relaxed max-w-xl mb-12 opacity-80 uppercase tracking-widest italic border-l-4 border-jumia-orange pl-8">
 Direct ingestion from global manufacturers. Secure exclusive access to flagship releases and certified enterprise-grade support.
 </p>
 <div className="flex items-center gap-8">
 <div className="flex -space-x-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="w-12 h-12 rounded-full border border-on-surface bg-surface-container-low" />
 ))}
 </div>
 <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40">Trusted by 500+ Global Entities</p>
 </div>
 </div>
 </div>
 </div>

 <div className="container -mt-16 relative z-20">
 {/* Filter Bar */}
 <div className="bg-surface-container-lowest p-3 rounded shadow-soft border border-surface-container-low flex flex-col md:flex-row items-center gap-4 mb-16 animate-in slide-in-from-bottom-8 duration-700 delay-300">
 <div className="flex-1 px-6 py-3 text-[10px] font-semibold text-on-surface-variant uppercase  italic border-r-0 md:border-r border-outline-variant/30 text-center md:text-left">
 {brands?.length || 0} Flagship Nodes Identified
 </div>
 <div className="px-6 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide w-full md:w-auto">
 <span className="text-[9px] font-semibold uppercase tracking-widest text-jumia-orange bg-jumia-orange/10 px-5 py-2.5 rounded-2xl cursor-pointer hover:bg-jumia-orange-dark hover:text-white transition-all shadow-sm">All Protocols</span>
 <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface cursor-pointer transition-all">Computing</span>
 <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface cursor-pointer transition-all">Aesthetics</span>
 <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface cursor-pointer transition-all">Apparel</span>
 <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant cursor-pointer hover:bg-jumia-orange hover:text-white transition-all">
 <Filter size={16} />
 </div>
 </div>
 </div>

 {brands && brands.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
 {brands.map((brand: any, idx: number) => (
 <Link 
 key={brand.id} 
 href={`/search?brandId=${brand.id}`}
 className="group bg-surface-container-lowest rounded border border-surface-container-low shadow-soft hover:shadow-2xl hover:border-jumia-orange/20 transition-all duration-700 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-8"
 style={{ animationDelay: `${idx * 100}ms` }}
 >
 {/* Brand Banner */}
 <div className="h-48 relative overflow-hidden m-4 rounded border-2 border-outline-variant/10">
 <Image 
 src={brand.bannerUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200'} 
 alt={brand.name}
 fill
 sizes="(max-width: 768px) 100vw, 33vw"
 className="object-cover group-hover:scale-110 transition-transform duration-[2s]"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
 
 <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between z-10">
 <div className="bg-white p-3 rounded shadow-2xl w-24 h-24 flex items-center justify-center border border-white transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-110">
 <Image 
 src={brand.logoUrl || 'https://via.placeholder.com/80'} 
 alt={`${brand.name} logo`} 
 width={80}
 height={80}
 className="w-full h-full object-contain rounded-xl"
 />
 </div>
 {brand.isVerified && (
 <div className="bg-jumia-orange text-white p-2 rounded-2xl shadow-2xl mb-2 ring-8 ring-white/10 group-hover:animate-bounce">
 <ShieldCheck size={20} />
 </div>
 )}
 </div>
 </div>

 {/* Brand Info */}
 <div className="p-10 pt-4 flex-1 flex flex-col">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-2xl font-semibold text-on-surface uppercase tracking-tighter group-hover:text-jumia-orange transition-colors duration-500">{brand.name}</h3>
 <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-jumia-orange-dark group-hover:text-white transition-all duration-500">
 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
 </div>
 </div>
 <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest leading-relaxed line-clamp-2 mb-8 opacity-40 italic">
 {brand.description || `High-fidelity asset ingestion from the ${brand.name} flagship node.`}
 </p>
 <div className="mt-auto pt-8 border-t border-outline-variant/30 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles size={14} className="text-jumia-orange" />
 <span className="text-[9px] font-semibold uppercase  text-on-surface-variant italic">Protocol Verified</span>
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-500">
 Deploy
 <ArrowRight size={14} />
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <div className="py-40 text-center px-8 bg-surface-container-low/30 border border-dashed border-outline-variant/30 rounded-[64px] animate-in fade-in zoom-in-95 duration-1000">
 <ShoppingBag className="mx-auto text-on-surface-variant opacity-10 mb-10 group-hover:scale-110 transition-transform" size={80} />
 <h2 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none mb-4">Node Registry Empty</h2>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  max-w-sm mx-auto mb-12 opacity-40 italic">System is currently onboarding new brand entities. Synchronization required.</p>
 <Link href="/" className="inline-flex items-center gap-4 px-16 py-6 bg-jumia-orange text-white rounded font-semibold text-xs uppercase  shadow-2xl shadow-on-surface/30 hover:bg-jumia-orange-dark transition-all hover:scale-105 active:scale-95 group">
 Return to Nexus
 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </Link>
 </div>
 )}
 </div>
 </div>
 );
}
