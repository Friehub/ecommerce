// apps/web/src/components/home/ProductSection.tsx
'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '@/trpc/react';
import Link from 'next/link';
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
  limit = 6,
  color = 'blue'
}: ProductSectionProps) => {
  const headerColor = {
    orange: 'bg-jumia-orange',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
  };

  const { data: products, isLoading } = api.catalog.listProducts.useQuery({
    categoryId,
    brandId,
    sortBy,
    limit,
  });

  if (isLoading) {
    return (
      <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant overflow-hidden mt-4">
        <div className={`${headerColor[color]} h-10 w-full animate-pulse`} />
        <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!products?.results || products.results.length === 0) return null;

  return (
    <section className="bg-j-surface-container-lowest rounded border border-j-outline-variant overflow-hidden mt-4">
      {/* Header */}
      <div className={`${headerColor[color]} px-4 py-2.5 flex items-center justify-between text-white`}>
        <h3 className="text-body-lg font-bold">{title}</h3>
        <Link 
          href={categoryId ? `/category/${categoryId}` : '/search'} 
          className="text-label-bold font-bold hover:underline uppercase text-xs"
        >
          See All &gt;
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
