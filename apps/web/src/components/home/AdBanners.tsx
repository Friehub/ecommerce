'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const banners = [
  {
    id: '1',
    title: 'Free Delivery',
    subtitle: 'On all orders above ₦10,000',
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=800',
    link: '/search?q=free+delivery',
    bgColor: 'bg-orange-500'
  },
  {
    id: '2',
    title: 'Jumia Global',
    subtitle: 'Millions of items from abroad',
    imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800',
    link: '/jumia-global',
    bgColor: 'bg-blue-600'
  },
  {
    id: '3',
    title: 'Official Stores',
    subtitle: '100% Genuine Brands',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
    link: '/official-stores',
    bgColor: 'bg-green-600'
  },
  {
    id: '4',
    title: 'Flash Sales',
    subtitle: 'Up to 80% Off daily',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800',
    link: '/flash-sales',
    bgColor: 'bg-red-600'
  }
];

export const AdBanners = () => {
  return (
    <section className="container mt-6 md:mt-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {banners.map((banner) => (
          <Link 
            key={banner.id}
            href={banner.link}
            className="group relative h-[120px] md:h-[180px] rounded-[24px] overflow-hidden shadow-lg shadow-black/5 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-4px]"
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
              <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tight leading-none mb-1">
                {banner.title}
              </h3>
              <p className="text-white/70 text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                {banner.subtitle}
                <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
