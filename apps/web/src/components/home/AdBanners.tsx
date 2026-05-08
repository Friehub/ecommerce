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
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-stack-md">
      {banners.map((banner) => (
        <Link 
          key={banner.id}
          href={banner.link}
          className="group relative h-[110px] lg:h-[140px] rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 transition-all hover:shadow-md hover:-translate-y-1"
        >
          <img 
            src={banner.imageUrl} 
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
            <h3 className="font-inter text-lg font-black uppercase tracking-tight leading-tight mb-1">
              {banner.title}
            </h3>
            <p className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-surface-variant/80 flex items-center gap-1">
              {banner.subtitle}
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
};
