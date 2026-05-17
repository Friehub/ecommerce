// apps/web/src/components/home/CategoryGrid.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/trpc/react';
import { Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const CategoryGrid = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-sm border border-j-border p-6 shadow-sm">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayCategories = categories?.slice(0, 10) || [];

  return (
    <div className="bg-white rounded-sm border border-j-border p-6 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-6">
        {displayCategories.map((cat: any) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-3 group transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-full bg-j-surface-container-low flex items-center justify-center text-j-text border border-j-border group-hover:border-jumia-orange group-hover:bg-orange-50 transition-all shadow-sm">
              {cat.imageUrl ? (
                <Image src={cat.imageUrl} alt={cat.name} width={40} height={40} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" unoptimized={true} />
              ) : (
                <Layers size={24} className="group-hover:text-jumia-orange transition-colors" />
              )}
            </div>
            <span className="text-[10px] font-black text-j-text uppercase tracking-tight text-center line-clamp-1 group-hover:text-jumia-orange transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
