// apps/web/src/components/home/CategoryGrid.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const CategoryGrid = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant p-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayCategories = categories?.slice(0, 8) || [];

  return (
    <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant p-4">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
        {displayCategories.map((cat: any) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 group hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-j-surface-container-high flex items-center justify-center text-j-text group-hover:bg-jumia-orange group-hover:text-white transition-all">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-6 h-6 object-contain" />
              ) : (
                <Layers size={20} />
              )}
            </div>
            <span className="text-body-sm text-j-text font-medium truncate w-full px-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
