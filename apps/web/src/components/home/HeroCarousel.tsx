'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { api } from '../../trpc/react';
import Link from 'next/link';
import { Skeleton } from '../ui/Skeleton';

export const HeroCarousel = () => {
  const { data: bannersData, isLoading } = api.content.getHeroBanners.useQuery();
  const [current, setCurrent] = useState(0);

  const defaultBanners = [
    {
      id: '1',
      title: 'Digital Horizon',
      subtitle: 'The latest in computing and mobile tech.',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600',
      link: '/category/computing'
    },
    {
      id: '2',
      title: 'Vogue Essentials',
      subtitle: 'Premium styles curated for the modern era.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600',
      link: '/category/fashion'
    }
  ];

  const banners = (bannersData && bannersData.length > 0) ? bannersData : defaultBanners;

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(next, 8000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="flex-1 h-[240px] md:h-[520px] rounded-[48px] overflow-hidden border-4 border-surface-container-low">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative flex-1 group overflow-hidden rounded-[48px] h-[240px] md:h-[520px] shadow-soft border-4 border-surface-container-low animate-in fade-in duration-1000">
      <div 
        className="flex h-full transition-transform duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner: any, i) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <div className="absolute inset-0 z-0">
              <Image 
                src={banner.imageUrl} 
                alt={banner.title}
                fill
                priority={i === 0}
                className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface via-on-surface/40 to-transparent flex flex-col justify-center px-8 md:px-16 text-white z-10">
              <div className="flex items-center gap-4 mb-8 animate-in slide-in-from-left-8 duration-700 delay-300">
                <div className="p-2 bg-primary-container/20 backdrop-blur-md rounded-xl border border-primary-container/30">
                  <Sparkles size={16} className="text-primary-container" />
                </div>
                <span className="font-black tracking-[0.4em] text-primary-container uppercase text-[9px] italic">Curated Asset Index</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[0.85] uppercase tracking-tighter animate-in slide-in-from-left-12 duration-1000 delay-500">
                {banner.title.split(' ').map((word: string, idx: number) => (
                  <span key={idx} className={idx === 1 ? 'text-primary-container block' : 'block'}>{word}</span>
                ))}
              </h2>
              <p className="text-xs md:text-base max-w-sm text-surface-container-highest font-black mb-12 border-l-4 border-primary-container pl-8 animate-in slide-in-from-left-16 duration-1000 delay-700 uppercase tracking-widest opacity-60 leading-relaxed italic">
                {banner.subtitle || 'Discover premium collections curated for the most discerning shoppers.'}
              </p>
              <div className="flex items-center gap-6 animate-in slide-in-from-left-20 duration-1000 delay-1000">
                <Link 
                  href={banner.link || '#'}
                  className="bg-primary-container text-white font-black px-12 py-6 rounded-[28px] shadow-2xl shadow-primary-container/40 hover:shadow-primary-container/60 hover:-translate-y-2 transition-all active:translate-y-0 text-xs uppercase tracking-[0.3em] flex items-center gap-4 group/btn"
                >
                  <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform duration-500" />
                  Initiate Acquisition
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-8 group-hover:translate-y-0 z-20">
        <button onClick={prev} className="w-16 h-16 flex items-center justify-center bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-3xl hover:bg-primary-container hover:border-primary-container transition-all active:scale-90 group/nav">
          <ChevronLeft className="text-white group-hover/nav:scale-125 transition-transform" size={28} />
        </button>
        <button onClick={next} className="w-16 h-16 flex items-center justify-center bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-3xl hover:bg-primary-container hover:border-primary-container transition-all active:scale-90 group/nav">
          <ChevronRight className="text-white group-hover/nav:scale-125 transition-transform" size={28} />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-12 left-8 md:left-16 flex items-center gap-3 z-20">
        {banners.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-700 rounded-full ${current === i ? 'w-16 h-2 bg-primary-container' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};


