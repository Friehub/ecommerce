'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop',
    title: 'New Smart Phones',
    subtitle: 'Up to 30% OFF',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop',
    title: 'Computing Deals',
    subtitle: 'Best for Productivity',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
    title: 'Fashion Trends',
    subtitle: 'Style for Everyone',
  }
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex-1 h-[480px] bg-white rounded shadow-sm overflow-hidden group">
      {/* Slides */}
      <div 
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <img 
              src={banner.image} 
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12">
              <h2 className="text-4xl font-bold text-white mb-2">{banner.title}</h2>
              <p className="text-xl text-[#F68B1E] font-semibold">{banner.subtitle}</p>
              <button className="mt-8 bg-[#F68B1E] text-white px-8 py-3 rounded font-bold w-fit hover:bg-[#E07A1A] transition-colors">
                SHOP NOW
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-[#F68B1E] w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>

      <style jsx>{`
        .relative { position: relative; }
        .flex { display: flex; }
        .flex-1 { flex: 1; }
        .h-\[480px\] { height: 480px; }
        .h-full { height: 100%; }
        .w-full { width: 100%; }
        .w-fit { width: fit-content; }
        .flex-shrink-0 { flex-shrink: 0; }
        .object-cover { object-fit: cover; }
        .bg-white { background-color: #ffffff; }
        .bg-black\/30 { background-color: rgba(0, 0, 0, 0.3); }
        .bg-black\/50 { background-color: rgba(0, 0, 0, 0.5); }
        .bg-white\/50 { background-color: rgba(255, 255, 255, 0.5); }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .overflow-hidden { overflow: hidden; }
        .duration-500 { duration: 500ms; }
        .transition-transform { transition-property: transform; }
        .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .absolute { position: absolute; }
        .left-4 { left: 1rem; }
        .right-4 { right: 1rem; }
        .bottom-4 { bottom: 1rem; }
        .px-12 { padding-left: 3rem; padding-right: 3rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .mt-8 { margin-top: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .top-1/2 { top: 50%; }
        .left-1/2 { left: 50%; }
        .-translate-y-1/2 { transform: translateY(-50%); }
        .-translate-x-1/2 { transform: translateX(-50%); }
        .text-4xl { font-size: 2.25rem; }
        .text-xl { font-size: 1.25rem; }
        .text-white { color: #ffffff; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .gap-2 { gap: 8px; }
        .opacity-0 { opacity: 0; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .w-6 { width: 1.5rem; }
        .w-2 { width: 0.5rem; }
        .h-2 { height: 0.5rem; }
        .group:hover .group-hover\:opacity-100 { opacity: 1; }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-black\/60 { --tw-gradient-from: rgba(0, 0, 0, 0.6); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0, 0, 0, 0)); }
        .to-transparent { --tw-gradient-to: transparent; }
      `}</style>
    </div>
  );
};
