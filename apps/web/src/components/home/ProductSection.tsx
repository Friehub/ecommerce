// apps/web/src/components/home/ProductSection.tsx
'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
    blue: 'bg-[#282828]', // Jumia often uses dark headers for categories
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
      <div className="bg-white rounded-sm border border-j-border overflow-hidden mt-8">
        <div className="h-12 w-full bg-j-surface-container-low animate-pulse" />
        <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!products?.results || products.results.length === 0) return null;

  return (
    <section className="bg-white rounded-sm border border-j-border overflow-hidden mt-8 shadow-sm">
      {/* Header */}
      <div className={`${headerColor[color]} px-6 py-3.5 flex items-center justify-between text-white`}>
        <h3 className="text-sm font-black uppercase tracking-wider">{title}</h3>
        <Link 
          href={categoryId ? `/category/${categoryId}` : '/search'} 
          className="text-xs font-black hover:underline uppercase tracking-tight flex items-center gap-2"
        >
          See All <ChevronRight size={16} />
        </Link>
      </div>

      {/* Grid */}
      <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {products.results.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
