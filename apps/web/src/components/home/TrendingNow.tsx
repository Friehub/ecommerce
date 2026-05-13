'use client';

import React from 'react';
import Link from 'next/link';
import { MoreHorizontal, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '../../trpc/react';
import { categoryIcons, DefaultCategoryIcon } from '../../constants/categoryIcons';
import { Skeleton } from '../ui/Skeleton';

export const TrendingNow = () => {
 const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

 if (isLoading) {
 return (
 <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
 {[...Array(8)].map((_, i) => (
 <Skeleton key={i} className="w-32 h-32 rounded-full shrink-0" />
 ))}
 </div>
 );
 }

 return (
 <section className="mt-16 group/trending">
 <div className="flex items-center justify-between mb-10 px-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-container/20 group-hover/trending:scale-110 transition-transform">
 <TrendingUp size={24} />
 </div>
 <div>
 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none">Trending Now</h2>
 <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.4em] mt-1 opacity-40">Market Velocity Leaders</p>
 </div>
 </div>
 </div>

 <div className="flex gap-8 overflow-x-auto pb-8 px-4 hide-scrollbar -mx-4 snap-x">
 {categories?.map((category: any, idx: number) => {
 const Icon = categoryIcons[category.name] || DefaultCategoryIcon;
 return (
 <Link 
 key={category.id} 
 href={`/category/${category.slug}`}
 className="flex flex-col items-center gap-5 group min-w-[96px] animate-in fade-in slide-in-from-bottom-4 duration-500"
 style={{ animationDelay: `${idx * 100}ms` }}
 >
 <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-white transition-all duration-500 border-4 border-surface-container-lowest shadow-lg group-hover:shadow-primary-container/30 group-hover:scale-110 group-hover:-translate-y-2">
 <Icon size={40} strokeWidth={1.5} />
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-center group-hover:text-primary-container transition-colors max-w-[100px] leading-tight opacity-80 group-hover:opacity-100">
 {category.name}
 </span>
 </Link>
 );
 })}
 </div>
 </section>
 );
};

