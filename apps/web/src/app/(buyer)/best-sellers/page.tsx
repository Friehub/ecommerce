'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, TrendingUp, Zap, Truck, ArrowRight, Activity, BarChart3 } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';

export default function BestSellersPage() {
 const { data, isLoading } = api.catalog.listProducts.useQuery({
 limit: 20,
 sortBy: 'popularity' // Ensuring we show most popular items
 });

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant opacity-40 animate-pulse">Calculating Market Velocity</p>
 </div>
 </div>
 );
 }

 const products = data?.results || [];

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 {/* Hero Header */}
 <div className="bg-jumia-orange text-white py-24 md:py-32 relative overflow-hidden">
 {/* Decorative elements */}
 <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-jumia-orange/20 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
 <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-jumia-orange/10 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />
 
 <div className="container relative z-10 mx-auto px-6">
 <div className="max-w-3xl">
 <div className="flex flex-wrap items-center gap-4 mb-10">
 <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-white/10 transition-all hover:bg-white/10 shadow-2xl">
 <Zap size={18} className="text-jumia-orange" />
 <span className="text-[10px] font-semibold uppercase  text-white">Market Velocity</span>
 </div>
 <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-white/10 transition-all hover:bg-white/10 shadow-2xl">
 <Truck size={18} className="text-jumia-orange" />
 <span className="text-[10px] font-semibold uppercase  text-white">Priority Dispatch</span>
 </div>
 </div>
 
 <h1 className="text-6xl md:text-8xl font-semibold uppercase tracking-tighter leading-[0.85] mb-8">
 Bestsellers <br />
 <span className="text-jumia-orange/40">Protocol</span>
 </h1>
 
 <p className="text-sm md:text-lg text-white/40 font-semibold uppercase tracking-widest leading-relaxed max-w-xl mb-12 italic">
 REAL-TIME AGGREGATION OF HIGH-VELOCITY TRANSACTIONS AND CONSUMER SENTIMENT METRICS.
 </p>
 
 <div className="inline-flex items-center gap-4 bg-jumia-orange text-white px-8 py-4 rounded-2xl font-semibold text-[10px] uppercase  shadow-xl shadow-primary-container/20">
 <Activity size={16} className="animate-pulse" />
 Live Data Ingestion • Updated 60s
 </div>
 </div>
 </div>
 </div>

 <div className="container mx-auto px-6 py-16">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <BarChart3 size={24} className="text-jumia-orange" />
 <h2 className="text-[10px] font-semibold text-jumia-orange uppercase ">Intelligence Report</h2>
 </div>
 <h2 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Market <span className="text-jumia-orange">Leaders</span></h2>
 </div>
 <div className="flex items-center gap-6 text-[10px] font-semibold uppercase  text-on-surface-variant/40 italic">
 <span className="px-4 py-2 bg-surface-container-low rounded-xl border-2 border-surface-container-low text-on-surface">Total Nodes: {products.length}</span>
 <span className="hidden md:inline">Precision Ranking Engine v2.4</span>
 </div>
 </div>

 {products.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
 {products.map((product: any, index: number) => (
 <div key={product.id} className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 50}ms` }}>
 <div className="absolute -top-4 -left-4 w-12 h-12 bg-jumia-orange text-white rounded-[18px] flex items-center justify-center font-semibold text-sm z-30 shadow-2xl border border-background group-hover:bg-jumia-orange-dark group-hover:scale-110 transition-all duration-500">
 {String(index + 1).padStart(2, '0')}
 </div>
 <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
 <ProductCard product={product} />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low p-24 text-center shadow-soft animate-in zoom-in-95 duration-1000">
 <Activity className="mx-auto text-surface-container-low mb-10" size={80} />
 <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Synchronizing <span className="text-jumia-orange">Flows</span></h2>
 <p className="text-on-surface-variant/40 text-[11px] max-w-sm mx-auto mb-12 font-semibold uppercase  leading-relaxed italic">
 WE ARE CRUNCHING HIGH-VELOCITY TRANSACTION DATA TO GENERATE PRECISION RANKINGS. RE-ESTABLISH CONNECTION SHORTLY.
 </p>
 <Link href="/" className="h-20 px-16 bg-jumia-orange text-white rounded-3xl font-semibold text-[10px] uppercase  hover:bg-jumia-orange-dark transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 mx-auto w-fit">
 Explore All Nodes <ArrowRight size={20} />
 </Link>
 </div>
 )}
 </div>
 </div>
 );
}
