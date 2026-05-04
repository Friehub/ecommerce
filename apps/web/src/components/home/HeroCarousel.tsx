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
    <div className="relative flex-1 h-[480px] bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Slides */}
      <div 
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0 select-none">
            <img 
              src={banner.image} 
              alt={banner.title}
              className="w-full h-full object-cover select-none pointer-events-none scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Enhanced visual gradient for readable text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center px-12 md:px-16">
              <span className="text-xs tracking-widest font-extrabold uppercase py-1 px-3 bg-white/10 backdrop-blur-md rounded border border-white/20 w-fit text-white mb-4 animate-fadeIn">
                Exclusive Deal
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight tracking-tight drop-shadow-md max-w-lg">
                {banner.title}
              </h2>
              <p className="text-lg md:text-xl font-medium mb-6 drop-shadow" style={{ color: banner.accentColor }}>
                {banner.subtitle}
              </p>
              <button 
                className="bg-primary-container hover:bg-orange-600 text-white font-extrabold px-8 py-4 rounded-lg text-sm w-fit transition-all hover:scale-105 hover:shadow-lg active:scale-95 duration-200 border border-white/10 tracking-wide uppercase select-none flex items-center gap-2"
                style={{ backgroundColor: '#f68b1e' }}
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
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 transition-all backdrop-blur-sm border border-white/10 cursor-pointer shadow-md"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 transition-all backdrop-blur-sm border border-white/10 cursor-pointer shadow-md"
      >
        <ChevronRight size={24} />
      </button>

      {/* Visual Indicator Dots with glowing effect */}
      <div className="absolute bottom-6 left-12 flex gap-3 z-10 select-none">
        {banners.map((banner, i) => (
          <button 
            key={banner.id}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#F68B1E] shadow-lg shadow-orange-500/50' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
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
