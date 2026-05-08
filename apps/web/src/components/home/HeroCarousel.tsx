'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { api } from '../../trpc/react';
import Link from 'next/link';

export const HeroCarousel = () => {
  const { data: bannersData, isLoading } = api.content.getHeroBanners.useQuery();
  const [current, setCurrent] = useState(0);

  // Default fallback banners if none are in DB
  const defaultBanners = [
    {
      id: '1',
      title: 'Digital Horizon',
      subtitle: 'The latest in computing and mobile tech.',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600',
      link: '/category/computing',
      accentColor: '#FF7A00'
    },
    {
      id: '2',
      title: 'Vogue Essentials',
      subtitle: 'Premium styles curated for the modern era.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600',
      link: '/category/fashion',
      accentColor: '#2196F3'
    }
  ];

  const banners = bannersData || defaultBanners;

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
      <div className="flex-1 h-[280px] md:h-[480px] bg-gray-50 rounded-[24px] animate-pulse flex items-center justify-center text-gray-200">
        <div className="text-[10px] font-black uppercase tracking-[0.3em]">Calibrating Showcase...</div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 group overflow-hidden rounded-xl h-[320px] md:h-[480px] shadow-lg">
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner: any, i) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 hero-gradient flex flex-col justify-center px-12 text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-10 h-1 bg-primary-container"></span>
                <span className="font-label-sm tracking-widest text-primary-fixed uppercase text-xs">Exclusive Deal</span>
              </div>
              <h2 className="font-inter text-4xl md:text-6xl font-black mb-4 leading-tight uppercase tracking-tighter">
                {banner.title}
              </h2>
              <p className="font-inter text-sm md:text-lg max-w-md text-surface-variant/90 mb-8 border-l-2 border-primary-container pl-4">
                {banner.subtitle || 'Discover premium collections curated for the most discerning shoppers.'}
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href={banner.link || '#'}
                  className="bg-primary-container text-on-primary font-bold px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:translate-y-0 text-sm uppercase tracking-widest"
                >
                  SHOP COLLECTION
                </Link>
                <div className="flex gap-2">
                  <button onClick={prev} className="w-10 h-10 flex items-center justify-center border border-surface-variant/30 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronLeft className="text-white" />
                  </button>
                  <button onClick={next} className="w-10 h-10 flex items-center justify-center border border-surface-variant/30 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronRight className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
        }
      `}</style>
    </div>
  );
};

