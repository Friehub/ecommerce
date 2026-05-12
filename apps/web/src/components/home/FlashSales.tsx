'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '../../trpc/react';
import { Zap, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/Skeleton';

const CountdownTimer = ({ endTime }: { endTime: any }) => {
  const [timeLeft, setTimeLeft] = useState<{h: string, m: string, s: string}>({h: '00', m: '00', s: '00'});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({h: '00', m: '00', s: '00'});
        clearInterval(timer);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          h: String(hours).padStart(2, '0'),
          m: String(minutes).padStart(2, '0'),
          s: String(seconds).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: timeLeft.h, label: 'H' },
        { val: timeLeft.m, label: 'M' },
        { val: timeLeft.s, label: 'S' }
      ].map((t, i) => (
        <React.Fragment key={i}>
          <div className="bg-white text-error w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm border border-white/20">
            {t.val}
          </div>
          {i < 2 && <span className="text-white font-black text-xs animate-pulse">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export const FlashSales = () => {
  const { data: flashSales, isLoading } = api.promo.getFlashSales.useQuery();

  if (isLoading) {
    return (
      <section className="mt-12">
        <div className="bg-surface-container-low rounded-[40px] overflow-hidden border-2 border-outline-variant/30">
          <Skeleton className="h-16 w-full" />
          <div className="p-8 flex gap-6 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="min-w-[240px] h-[380px] rounded-[32px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!flashSales || flashSales.length === 0) {
    return null;
  }

  const flashProducts = flashSales.slice(0, 8).map((fs: any) => {
    const p = { ...fs.variant.product };
    p.variants = [
      {
        ...fs.variant,
        price: parseFloat(fs.salePrice),
        comparePrice: parseFloat(fs.variant.price)
      }
    ];
    p.isFlashSale = true;
    p.itemsLeft = fs.limit - fs.sold;
    return p;
  });

  const earliestEnd = flashSales.reduce((prev: Date, curr: any) => {
    const d = new Date(curr.endTime);
    return !prev || d < prev ? d : prev;
  }, new Date(flashSales[0].endTime));

  return (
    <section className="mt-16 group/flash">
      <div className="bg-surface-container-low rounded-[48px] overflow-hidden border-4 border-surface-container-lowest shadow-soft transition-all duration-500 hover:shadow-2xl">
        <div className="bg-error px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover/flash:scale-110 transition-transform">
              <Zap size={24} className="text-white fill-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Flash Sales</h2>
              <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.3em] mt-1 italic">Limited Stock Available</p>
            </div>
            <div className="hidden lg:flex items-center gap-4 ml-8 bg-black/10 px-4 py-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-white opacity-60" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Ends In</span>
              </div>
              <CountdownTimer endTime={earliestEnd} />
            </div>
          </div>
          <Link href="/flash-sales" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn border border-white/10 active:scale-95">
            View All <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="p-8 overflow-x-auto flex gap-6 hide-scrollbar bg-surface-container-low">
          {flashProducts.map((product: any, idx: number) => (
            <div key={product.id} className="min-w-[220px] md:min-w-[260px] animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

