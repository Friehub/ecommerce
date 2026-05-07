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
      <div className="flex-1 h-[320px] md:h-[480px] bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center text-gray-200">
        <div className="text-[10px] font-black uppercase tracking-[0.3em]">Calibrating Showcase...</div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 h-[320px] md:h-[480px] bg-white rounded-2xl shadow-2xl shadow-black/5 overflow-hidden group border border-gray-100 select-none">
      {/* Slides */}
      <div 
        className="flex h-full transition-transform duration-[1000ms] cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner: any, i) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            />
            
            {/* Modern Content Panel */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[500px] bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 md:px-16 z-20">
              <div className={`transition-all duration-700 delay-300 ${i === current ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-8 h-1 bg-white/40 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Premium Pick</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                  {banner.title.split(' ').map((word: string, idx: number) => (
                    <span key={idx} className={idx === 1 ? 'text-[#FF7A00]' : ''}>{word}<br/></span>
                  ))}
                </h2>
                
                <p className="text-sm md:text-base font-medium text-white/70 max-w-sm mb-10 leading-relaxed border-l-2 border-white/20 pl-4">
                  {banner.subtitle || 'Experience the future of commerce with our exclusive partner collections.'}
                </p>
                
                <Link 
                  href={banner.link || '#'}
                  className="inline-flex items-center gap-3 bg-[#FF7A00] text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#1A1A1A] transition-all transform active:scale-95 shadow-2xl shadow-orange-500/20 group/btn"
                >
                  Explore Collection
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Background Accent Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 right-12 flex items-center gap-4 z-30">
        <button 
          onClick={prev}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-black transition-all transform active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex gap-2">
          {banners.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-[#FF7A00]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-black transition-all transform active:scale-90"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};
