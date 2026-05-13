'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';

const banners = [
 {
 id: '1',
 title: 'Express Delivery',
 subtitle: 'Ultra-fast within 24 hours',
 imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=800',
 link: '/search?q=free+delivery',
 tag: 'Priority',
 bgColor: 'bg-primary-container'
 },
 {
 id: '2',
 title: 'Global Elite',
 subtitle: 'Direct from international hubs',
 imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800',
 link: '/jumia-global',
 tag: 'Global',
 bgColor: 'bg-tertiary-container'
 },
 {
 id: '3',
 title: 'House of Brands',
 subtitle: 'Official certified partners',
 imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
 link: '/official-stores',
 tag: 'Certified',
 bgColor: 'bg-on-surface'
 },
 {
 id: '4',
 title: 'Midnight Flash',
 subtitle: 'Limited-time price drops',
 imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800',
 link: '/flash-sales',
 tag: 'Trending',
 bgColor: 'bg-error'
 }
];

export const AdBanners = () => {
 return (
 <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 mb-16">
 {banners.map((banner, idx) => (
 <Link 
 key={banner.id}
 href={banner.link}
 className="group relative h-[160px] lg:h-[220px] rounded-[40px] overflow-hidden shadow-soft border-2 border-surface-container-low transition-all hover:shadow-2xl hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700"
 style={{ animationDelay: `${idx * 150}ms` }}
 >
 <div className="absolute inset-0 z-0">
 <Image 
 src={banner.imageUrl} 
 alt={banner.title}
 fill
 sizes="(max-width: 768px) 50vw, 25vw"
 className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
 />
 </div>
 <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white z-10">
 <div className="flex items-center gap-2 mb-3">
 <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-xl border border-white/20 backdrop-blur-md ${banner.bgColor === 'bg-primary-container' ? 'bg-primary-container' : 'bg-white/10'}`}>
 {banner.tag}
 </span>
 </div>
 <h3 className="text-sm lg:text-xl font-black uppercase tracking-tighter leading-none mb-2 group-hover:text-primary-container transition-colors duration-500">
 {banner.title}
 </h3>
 <div className="flex items-center justify-between gap-4">
 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-surface-container-highest italic opacity-60 line-clamp-1">
 {banner.subtitle}
 </p>
 <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-primary-container group-hover:border-primary-container transition-all duration-500 shrink-0">
 <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
 </div>
 </div>
 </div>
 </Link>
 ))}
 </section>
 );
};

