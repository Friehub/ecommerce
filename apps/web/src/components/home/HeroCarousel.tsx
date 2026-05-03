'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop',
    title: 'New Smart Phones',
    subtitle: 'Elevate your experience with up to 30% OFF',
    accentColor: '#F68B1E'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop',
    title: 'Computing Deals',
    subtitle: 'High performance laptops & desktops',
    accentColor: '#2196F3'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
    title: 'Fashion Trends',
    subtitle: 'Premium styles for everyone this season',
    accentColor: '#E91E63'
  }
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex-1 h-[260px] sm:h-[380px] md:h-[480px] bg-white rounded-lg shadow-sm overflow-hidden group border border-gray-200 duration-150 transition-all">
      {/* Slides */}
      <div 
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0 select-none">
            <img 
              src={banner.image} 
              alt={banner.title}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Enhanced visual gradient for readable text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-6 md:px-16">
              <span className="text-[10px] md:text-xs tracking-widest font-bold uppercase py-0.5 px-2 md:py-1 md:px-3 bg-black/20 rounded text-white mb-2 md:mb-4">
                Exclusive Deal
              </span>
              <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white mb-1 md:mb-2 leading-tight tracking-tight max-w-lg">
                {banner.title}
              </h2>
              <p className="text-xs sm:text-base md:text-xl font-medium mb-3 md:mb-6" style={{ color: banner.accentColor }}>
                {banner.subtitle}
              </p>
              <button 
                className="bg-[#F68B1E] hover:bg-[#E07A1A] text-white font-bold px-4 py-2 md:px-8 md:py-3.5 rounded text-xs md:text-sm w-fit duration-150 transition-all tracking-wide uppercase flex items-center gap-2"
              >
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Controls */}
      <button 
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-11 md:h-11 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
      >
        <ChevronLeft size={20} className="md:size-6" />
      </button>
      <button 
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-11 md:h-11 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
      >
        <ChevronRight size={20} className="md:size-6" />
      </button>

      {/* Visual Indicator Dots */}
      <div className="absolute bottom-3 md:bottom-6 left-6 md:left-12 flex gap-2 md:gap-3 z-10 select-none">
        {banners.map((banner, i) => (
          <button 
            key={banner.id}
            onClick={() => setCurrent(i)}
            className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 md:w-8 bg-[#F68B1E]' : 'w-2 md:w-2.5 bg-white/40 hover:bg-white/60'}`}
            style={i === current ? { backgroundColor: banner.accentColor } : {}}
          />
        ))}
      </div>

      <style jsx>{`
        .bg-primary-container {
          background-color: #f68b1e;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
