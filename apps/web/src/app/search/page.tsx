'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ChevronRight, Filter, SlidersHorizontal, Star } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || undefined;
  const brandId = searchParams.get('brandId') || undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sortBy = searchParams.get('sortBy') || 'relevance';

  const { data, isLoading } = api.catalog.listProducts.useQuery({
    search: q,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    sortBy,
  });

  const { data: categories } = api.catalog.getCategories.useQuery();
  const { data: brands } = api.catalog.getBrands.useQuery();

  const results = data?.results || [];
  const total = data?.total || 0;

  const updateFilters = (newParams: Record<string, string | number | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value.toString());
      }
    });
    router.push(`/search?${nextParams.toString()}`);
  };

  return (
    <main className="bg-[#F5F5F5] min-h-screen py-4">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <a href="/" className="hover:underline">Home</a>
          <ChevronRight size={12} />
          <span className="font-medium text-gray-800">Search results for "{q}"</span>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded shadow-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-bold text-sm uppercase">Category</h3>
              </div>
              <ul className="space-y-2 mb-6">
                {categories?.map((cat: any) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => updateFilters({ categoryId: cat.id })}
                      className={`text-xs hover:text-[#F68B1E] text-left w-full ${categoryId === cat.id ? 'text-[#F68B1E] font-bold' : 'text-gray-600'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-bold text-sm uppercase">Price (₦)</h3>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full text-xs border p-2 rounded"
                  onBlur={(e) => updateFilters({ minPrice: e.target.value || undefined })}
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full text-xs border p-2 rounded"
                  onBlur={(e) => updateFilters({ maxPrice: e.target.value || undefined })}
                />
              </div>

              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-bold text-sm uppercase">Brand</h3>
              </div>
              <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                {brands?.map((brand: any) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-[#F68B1E]">
                      <input 
                        type="checkbox" 
                        checked={brandId === brand.id}
                        onChange={() => updateFilters({ brandId: brandId === brand.id ? undefined : brand.id })}
                      />
                      {brand.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            <div className="bg-white rounded shadow-sm p-4 mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Search results for "{q}"</h1>
                <p className="text-xs text-gray-500">{total} products found</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                    className="border-none font-bold text-gray-800 bg-transparent focus:ring-0 cursor-pointer"
                  >
                    <option value="relevance">Popularity</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Product Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white aspect-[3/4] animate-pulse rounded" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((variant: any) => (
                  <ProductCard key={variant.id} product={{ ...variant.product, variants: [variant] }} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="text-gray-400" />
                </div>
                <h2 className="font-bold text-lg mb-2">No results found!</h2>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => router.push('/')}
                  className="bg-[#F68B1E] text-white px-8 py-3 rounded font-bold hover:bg-[#e67e1a] shadow-lg shadow-[#F68B1E]/20"
                >
                  GO BACK HOME
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
