'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '../../trpc/react';
import Link from 'next/link';

interface ProductSectionProps {
  title: string;
  categoryId?: string;
  brandId?: string;
  sortBy?: string;
  color?: 'orange' | 'blue' | 'red' | 'green';
  limit?: number;
}

const colorMap = {
  orange: 'from-[#F68B1E] to-[#FF7A00]',
  blue: 'from-[#264996] to-[#3b82f6]',
  red: 'from-[#DF3131] to-[#ef4444]',
  green: 'from-[#28A745] to-[#10b981]',
};

export const ProductSection = ({ 
  title, 
  categoryId, 
  brandId, 
  sortBy = 'newest', 
  color = 'orange',
  limit = 6
}: ProductSectionProps) => {
  const { data: products, isLoading } = api.catalog.listProducts.useQuery({
    categoryId,
    brandId,
    sortBy,
    limit,
  });

  if (isLoading) {
    return (
      <section className="container mt-8 md:mt-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className={`h-12 bg-gray-100 animate-pulse`} />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-50 rounded-lg animate-pulse" />
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
    <section className="container mt-8 md:mt-12">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorMap[color]} h-12 md:h-14 flex items-center justify-between px-5 text-white select-none`}>
          <h2 className="font-extrabold uppercase tracking-tight text-white text-sm md:text-lg">
            {title}
          </h2>
          <Link 
            href={categoryId ? `/category/${categoryId}` : '/search'} 
            className="text-[10px] font-extrabold hover:underline uppercase tracking-widest bg-white/10 hover:bg-white/20 transition-all px-3 py-1.5 rounded-lg border border-white/10"
          >
            See All
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 md:p-5 bg-white">
          {products.results.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
