// apps/web/src/components/home/HeroCarousel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export const HeroCarousel = () => {
  const { data: bannersData, isLoading } = api.content.getHeroBanners.useQuery();
  const [current, setCurrent] = useState(0);

  const defaultBanners = [
    {
      id: '1',
      title: 'Flash Sales Promo',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRN3Vm0C8aAbJ4momyUTdEs0v_OagbZkMXBUfgfJD9LAYZ0-qQacz-ocvddaoZRXO6faa-z36CV4grli1sSiPMsjOE0vpvElo6gyEg6e-Q_qMPiyvNpN25vzvdca2z0lzUywkBaljhnfekKo3GTKd7Uhr4IweaAKV7EewrQQzncNXWKVA7cD_vwtPeQxHlhLKkLYN0h_5V1nh33T0YUVfFwIGpco9iWB2Y7FsQznrObCCBoY9w-VQN1KrHLisoHMRExMYoiwX1SMtU',
      link: '/flash-sales'
    },
    {
      id: '2',
      title: 'Official Stores',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600',
      link: '/official-stores'
    }
  ];

  const banners = (bannersData && bannersData.length > 0) ? bannersData : defaultBanners;

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(next, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] rounded overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded overflow-hidden bg-j-surface-container-highest group">
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner: any) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <Image 
              src={banner.imageUrl} 
              alt={banner.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      <button 
        onClick={prev} 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={24} className="text-j-text" />
      </button>
      <button 
        onClick={next} 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={24} className="text-j-text" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${current === i ? 'bg-jumia-orange w-4' : 'bg-j-surface-variant'}`}
          />
        ))}
      </div>
    </div>
  );
};
