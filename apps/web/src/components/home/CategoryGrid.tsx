'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Grid3X3, ArrowRight } from 'lucide-react';
import { api } from '../../trpc/react';
import { categoryIcons, DefaultCategoryIcon } from '../../constants/categoryIcons';
import { Skeleton } from '../ui/Skeleton';

export const CategoryGrid = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <section className="mt-16 px-4">
        <div className="bg-surface-container-low rounded-[48px] border-4 border-surface-container-lowest p-10 animate-pulse">
          <div className="h-8 w-64 bg-surface-container-lowest rounded-full mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-surface-container-lowest rounded-full" />
                <div className="h-3 w-16 bg-surface-container-lowest rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Get top level categories from the tree
  const displayCategories = categories?.slice(0, 12) || [];

  return (
    <section className="mt-16 px-4 group/catgrid">
      <div className="bg-surface-container-low rounded-[48px] border-4 border-surface-container-lowest shadow-soft p-10 transition-all duration-700 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-on-surface text-white rounded-2xl flex items-center justify-center shadow-xl group-hover/catgrid:rotate-6 transition-transform">
              <Grid3X3 size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter leading-none">Category Matrix</h2>
              <p className="text-[11px] text-on-surface-variant font-black uppercase tracking-[0.4em] mt-2 opacity-40 italic">Global Taxonomic Index</p>
            </div>
          </div>
          <Link 
            href="/search" 
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary-container hover:text-on-surface transition-all group/all"
          >
            All Classifications <ArrowRight size={16} className="group-hover/all:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
          {displayCategories.length > 0 ? displayCategories.map((category: any, idx: number) => {
            const Icon = categoryIcons[category.name] || DefaultCategoryIcon;
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-6 group/item animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-28 h-28 bg-surface-container-lowest rounded-[40px] flex items-center justify-center text-on-surface-variant group-hover/item:bg-primary-container group-hover/item:text-white transition-all duration-500 border-4 border-surface-container-low shadow-lg group-hover/item:shadow-primary-container/30 group-hover/item:scale-110 group-hover/item:-rotate-6">
                    <Icon size={44} strokeWidth={1.5} />
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-on-surface text-white text-[9px] font-black px-2 py-1 rounded-lg border-2 border-surface-container-low shadow-lg">
                      {category.children.length}
                    </div>
                  )}
                </div>
                <div className="text-center space-y-1">
                  <span className="block text-[11px] font-black uppercase tracking-widest text-on-surface group-hover/item:text-primary-container transition-colors duration-300">
                    {category.name}
                  </span>
                  <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 group-hover/item:opacity-100 transition-opacity">
                    {category.children?.length || 0} Sub-Nodes
                  </span>
                </div>
              </Link>
            );
          }) : (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-surface-container-low rounded-[40px]">
              <Grid3X3 className="mx-auto text-on-surface-variant/10 mb-6" size={64} />
              <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.5em] italic">Initializing Taxonomic Matrix... No active nodes detected.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
