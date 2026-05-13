'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '../../trpc/react';
import Link from 'next/link';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface ProductSectionProps {
 title: string;
 categoryId?: string;
 brandId?: string;
 sortBy?: string;
 limit?: number;
 color?: 'orange' | 'blue' | 'red' | 'green';
}

export const ProductSection = ({ 
 title, 
 categoryId, 
 brandId, 
 sortBy = 'newest', 
 limit = 12,
 color = 'orange'
}: ProductSectionProps) => {
 const headerBg = {
 orange: 'bg-primary-container/10',
 blue: 'bg-tertiary-container/10',
 red: 'bg-error-container/10',
 green: 'bg-success-container/10',
 };

 const iconColor = {
 orange: 'text-primary-container',
 blue: 'text-tertiary',
 red: 'text-error',
 green: 'text-success',
 };
 const { data: products, isLoading } = api.catalog.listProducts.useQuery({
 categoryId,
 brandId,
 sortBy,
 limit,
 });

 if (isLoading) {
 return (
 <section className="mt-16">
 <div className="bg-surface-container-low rounded-[40px] overflow-hidden border-2 border-outline-variant/30">
 <Skeleton className="h-16 w-full" />
 <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
 {[...Array(6)].map((_, i) => (
 <Skeleton key={i} className="aspect-[3/4] rounded-[32px]" />
 ))}
 </div>
 </div>
 </section>
 );
 }

 if (!products?.results || products.results.length === 0) {
 return null;
 }

 return (
 <section className="mt-16 group/section">
 <div className="bg-surface-container-low rounded-[48px] overflow-hidden border-4 border-surface-container-lowest shadow-soft transition-all duration-500 hover:shadow-2xl">
 {/* Header */}
 <div className="bg-surface-container px-8 py-5 flex items-center justify-between border-b-2 border-outline-variant/30">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 ${headerBg[color]} rounded-2xl flex items-center justify-center border border-outline-variant/5 group-hover/section:rotate-6 transition-transform`}>
 <LayoutGrid size={24} className={iconColor[color]} />
 </div>
 <div className="flex flex-col">
 <h2 className="text-xl font-black text-on-surface uppercase tracking-tighter leading-none">
 {title}
 </h2>
 <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] mt-1 italic">Handpicked for you</p>
 </div>
 </div>
 <Link 
 href={categoryId ? `/category/${categoryId}` : '/search'} 
 className="bg-primary-container/10 hover:bg-primary-container/20 text-primary-container px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn border border-primary-container/10 active:scale-95"
 >
 Explore All <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
 </Link>
 </div>

 {/* Grid */}
 <div className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
 {products.results.map((product: any, idx: number) => (
 <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
 <ProductCard product={product} />
 </div>
 ))}
 </div>
 </div>
 </section>
 );
};

