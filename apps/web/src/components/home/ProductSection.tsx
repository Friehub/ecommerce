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
      <section className="bg-surface rounded-xl overflow-hidden border border-outline-variant/30 animate-pulse h-[400px]" />
    );
  }

  if (!products?.results || products.results.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/20">
      {/* Header */}
      <div className="bg-surface-container h-14 flex items-center justify-between px-6">
        <h2 className="font-inter text-lg font-bold uppercase tracking-tight text-on-surface">
          {title}
        </h2>
        <Link 
          href={categoryId ? `/category/${categoryId}` : '/search'} 
          className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
        >
          See All
        </Link>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.results.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
