'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { Zap, ChevronRight, Clock, ArrowRight } from 'lucide-react';

const CountdownTimer = ({ endTime }: { endTime: any }) => {
 const [timeLeft, setTimeLeft] = useState('');

 useEffect(() => {
 const timer = setInterval(() => {
 const now = new Date().getTime();
 const end = new Date(endTime).getTime();
 const diff = end - now;

 if (diff <= 0) {
 setTimeLeft('00 : 00 : 00');
 clearInterval(timer);
 } else {
 const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
 const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
 const seconds = Math.floor((diff % (1000 * 60)) / 1000);

 setTimeLeft(
 `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
 );
 }
 }, 1000);

 return () => clearInterval(timer);
 }, [endTime]);

 return <span className="font-mono tracking-[0.2em]">{timeLeft || '00 : 00 : 00'}</span>;
};

export default function FlashSalesPage() {
 const { data: flashSales, isLoading } = api.promo.getFlashSales.useQuery();

 const flashProducts = flashSales?.map((fs: any) => {
 const p = { ...fs.variant.product };
 p.variants = [
 {
 ...fs.variant,
 price: parseFloat(fs.salePrice),
 comparePrice: parseFloat(fs.variant.price)
 }
 ];
 return p;
 }) || [];

 const earliestEnd = flashSales?.reduce((prev: Date, curr: any) => {
 const d = new Date(curr.endTime);
 return !prev || d < prev ? d : prev;
 }, flashSales?.[0] ? new Date(flashSales[0].endTime) : new Date());

 return (
    <div className="bg-background min-h-screen pb-32 select-none animate-in fade-in duration-1000">
      <div className="container py-12">
        <div className="flex items-center gap-4 mb-12 font-black text-on-surface-variant/40 text-[10px] uppercase tracking-[0.4em] italic">
          <Link href="/" className="hover:text-primary-container transition-colors">Hub.Node</Link>
          <ChevronRight size={14} className="opacity-20" />
          <span className="text-on-surface">Flash.Auctions</span>
        </div>

        <div className="bg-surface-container-lowest rounded-[56px] border-4 border-surface-container-low shadow-soft overflow-hidden transition-all hover:border-primary-container/20 duration-1000 group/hero">
          <div className="bg-error p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center border-4 border-white/20 shadow-2xl group-hover/hero:scale-110 transition-transform duration-700">
                <Zap size={40} fill="white" className="text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.8] mb-4">
                  Flash <br />
                  <span className="text-white/40">Auctions.</span>
                </h1>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">High-Frequency Protocol Active</p>
                </div>
              </div>
            </div>
            {flashSales && flashSales.length > 0 && (
              <div className="flex flex-col items-center md:items-end gap-4 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">Temporal Sync Window</span>
                <div className="bg-white/10 backdrop-blur-md text-white px-10 py-6 rounded-[32px] text-2xl font-black shadow-2xl border-4 border-white/20 flex items-center gap-6">
                  <Clock size={24} className="animate-spin-slow opacity-60" />
                  <CountdownTimer endTime={earliestEnd} />
                </div>
              </div>
            )}
          </div>

 <div className="p-10 lg:p-16">
 {isLoading ? (
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[32px] animate-pulse border-2 border-surface-container-lowest" />
 ))}
 </div>
 ) : flashProducts.length > 0 ? (
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
 {flashProducts.map((product: any) => (
 <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
 <ProductCard product={product} />
 </div>
 ))}
 </div>
 ) : (
 <div className="py-40 text-center">
 <div className="w-32 h-32 bg-surface-container-low rounded-[40px] flex items-center justify-center mx-auto mb-10 border-4 border-surface-container-lowest shadow-soft group">
 <Zap size={48} className="text-on-surface-variant/10 group-hover:text-primary-container transition-colors" />
 </div>
 <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Frequency Silent</h2>
 <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.4em] mt-4 mb-12 italic">No active flash protocols detected at this timestamp.</p>
 <Link href="/" className="inline-flex items-center gap-4 px-12 py-5 bg-on-surface text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
 Return to Hub <ArrowRight size={18} />
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
