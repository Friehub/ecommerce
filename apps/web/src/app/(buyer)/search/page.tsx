// apps/web/src/app/(buyer)/search/page.tsx
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { Filter, SortAsc, Search as SearchIcon, X, SlidersHorizontal, Loader2, Info } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const brandIdParam = searchParams.get('brandId') || '';
  const sortByParam = searchParams.get('sortBy') || 'newest';

  const [minPrice, setMinPrice] = useState<string>(minPriceParam);
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceParam);
  const [brandId, setBrandId] = useState<string>(brandIdParam);
  const [sortBy, setSortBy] = useState<string>(sortByParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setBrandId(searchParams.get('brandId') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
  }, [searchParams]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data: brands } = api.catalog.getBrands.useQuery();

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (pageParam - 1) * limit;

  const { data: products, isLoading } = api.catalog.listProducts.useQuery(
    {
      search: query || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      brandId: brandId || undefined,
      sortBy: sortBy || undefined,
      limit,
      offset,
    },
    { enabled: true }
  );

  const FilterContent = () => (
    <div className="p-5 space-y-6 bg-white">
      <div>
        <h4 className="text-[10px] font-black uppercase text-j-text-muted mb-4 tracking-wider">Price (₦)</h4>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="MIN" 
              className="w-full bg-j-background border border-j-border rounded-sm px-3 py-2 text-xs font-bold text-j-text focus:border-jumia-orange focus:ring-1 focus:ring-jumia-orange outline-none transition-all placeholder:font-normal placeholder:text-j-text-muted" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="MAX" 
              className="w-full bg-j-background border border-j-border rounded-sm px-3 py-2 text-xs font-bold text-j-text focus:border-jumia-orange focus:ring-1 focus:ring-jumia-orange outline-none transition-all placeholder:font-normal placeholder:text-j-text-muted" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button 
            onClick={() => updateFilters({ minPrice, maxPrice })}
            className="w-full bg-jumia-orange text-white py-2.5 rounded-sm text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-all shadow active:scale-95"
          >
            Apply Price
          </button>
        </div>
      </div>
      
      {brands && brands.length > 0 && (
        <div className="pt-6 border-t border-j-border">
          <h4 className="text-[10px] font-black uppercase text-j-text-muted mb-4 tracking-wider">Brand</h4>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="brand"
                checked={!brandId}
                onChange={() => {
                  setBrandId('');
                  updateFilters({ brandId: '' });
                }}
                className="w-4 h-4 text-jumia-orange focus:ring-jumia-orange border-j-border rounded-full" 
              />
              <span className="group-hover:text-jumia-orange font-bold text-j-text uppercase text-[10px] tracking-wider transition-colors">All Brands</span>
            </label>
            {brands.map((b: any) => (
              <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="brand"
                  checked={brandId === b.id}
                  onChange={() => {
                    setBrandId(b.id);
                    updateFilters({ brandId: b.id });
                  }}
                  className="w-4 h-4 text-jumia-orange focus:ring-jumia-orange border-j-border rounded-full" 
                />
                <span className="group-hover:text-jumia-orange font-bold text-j-text uppercase text-[10px] tracking-wider transition-colors">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsFilterOpen(false)}
        className="w-full py-4 bg-jumia-orange text-white rounded-sm font-black text-xs uppercase tracking-wider mt-4 lg:hidden shadow hover:bg-orange-600 active:scale-95 transition-all"
      >
        Close Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-[1184px] mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-4">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-3 bg-white border border-j-border py-3.5 rounded-sm text-xs font-black uppercase text-j-text active:scale-95 transition-all shadow-sm"
          >
            <SlidersHorizontal size={16} className="text-jumia-orange" />
            Filters
          </button>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-j-background border-b border-j-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-jumia-orange" />
                <h3 className="font-black text-[10px] uppercase tracking-wider text-j-text">Filters</h3>
              </div>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-sm p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl border-t-4 border-jumia-orange max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-j-text uppercase tracking-tight">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 bg-j-background rounded-sm flex items-center justify-center border border-j-border text-j-text active:scale-90 transition-all">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-sm border border-j-border shadow-sm">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-j-text leading-none tracking-tight uppercase">
                {query ? `Search Results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-[10px] font-bold text-j-text-muted uppercase tracking-wider mt-1.5">
                {products?.total || 0} products found
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold bg-j-background px-3 py-2 rounded-sm border border-j-border shadow-sm text-j-text">
              <SortAsc size={14} className="text-jumia-orange" />
              <select 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sortBy: e.target.value });
                }}
                className="border-none bg-transparent font-black focus:ring-0 text-[10px] cursor-pointer outline-none text-j-text uppercase tracking-wider appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(minPriceParam || maxPriceParam || brandIdParam) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-300">
              <span className="text-[9px] font-black uppercase text-j-text-muted tracking-wider">Active Filters:</span>
              {minPriceParam && (
                <button 
                  onClick={() => updateFilters({ minPrice: '' })}
                  className="bg-white px-3 py-1.5 rounded-sm border border-j-border flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-j-text hover:border-jumia-orange transition-all shadow-sm"
                >
                  Min: ₦{parseInt(minPriceParam).toLocaleString()}
                  <X size={12} className="text-jumia-orange" />
                </button>
              )}
              {maxPriceParam && (
                <button 
                  onClick={() => updateFilters({ maxPrice: '' })}
                  className="bg-white px-3 py-1.5 rounded-sm border border-j-border flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-j-text hover:border-jumia-orange transition-all shadow-sm"
                >
                  Max: ₦{parseInt(maxPriceParam).toLocaleString()}
                  <X size={12} className="text-jumia-orange" />
                </button>
              )}
              {brandIdParam && brands && (
                <button 
                  onClick={() => updateFilters({ brandId: '' })}
                  className="bg-white px-3 py-1.5 rounded-sm border border-j-border flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-j-text hover:border-jumia-orange transition-all shadow-sm"
                >
                  Brand: {brands.find((b: any) => b.id === brandIdParam)?.name}
                  <X size={12} className="text-jumia-orange" />
                </button>
              )}
              <button 
                onClick={() => updateFilters({ minPrice: '', maxPrice: '', brandId: '' })}
                className="text-[9px] font-black uppercase tracking-wider text-error hover:underline ml-2"
              >
                Clear filters
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white border border-j-border rounded-sm animate-pulse flex flex-col p-4 gap-3">
                  <div className="w-full bg-j-background flex-1 rounded-sm" />
                  <div className="h-4 bg-j-background w-3/4 rounded-sm" />
                  <div className="h-5 bg-j-background w-1/2 rounded-sm" />
                </div>
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.results.map((product: any) => (
                  <div key={product.id} className="bg-white border border-j-border rounded-sm overflow-hidden shadow-sm">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {(() => {
                const totalItems = products?.total || 0;
                const totalPages = Math.ceil(totalItems / limit);
                if (totalPages <= 1) return null;
                return (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-j-border pt-6 animate-in fade-in duration-300">
                    <span className="text-[10px] font-black uppercase text-j-text-muted">
                      Showing {offset + 1}–{Math.min(offset + limit, totalItems)} of {totalItems} items
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          if (pageParam > 1) {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('page', (pageParam - 1).toString());
                            router.push(`${pathname}?${params.toString()}`);
                          }
                        }}
                        disabled={pageParam === 1}
                        className="h-9 px-3.5 border border-j-border rounded-sm text-[10px] font-black uppercase text-j-text hover:bg-j-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(pageNum => pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - pageParam) <= 2)
                        .map((pageNum, idx, arr) => {
                          const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                          return (
                            <React.Fragment key={pageNum}>
                              {showEllipsis && (
                                <span className="px-2 text-xs font-bold text-j-text-muted select-none">...</span>
                              )}
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams(searchParams.toString());
                                  params.set('page', pageNum.toString());
                                  router.push(`${pathname}?${params.toString()}`);
                                }}
                                className={`w-9 h-9 rounded-sm flex items-center justify-center text-[10px] font-black transition-all ${
                                  pageNum === pageParam
                                    ? 'bg-jumia-orange text-white shadow'
                                    : 'border border-j-border text-j-text hover:bg-j-background'
                                }`}
                              >
                                {pageNum}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      <button
                        onClick={() => {
                          if (pageParam < totalPages) {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('page', (pageParam + 1).toString());
                            router.push(`${pathname}?${params.toString()}`);
                          }
                        }}
                        disabled={pageParam === totalPages}
                        className="h-9 px-3.5 border border-j-border rounded-sm text-[10px] font-black uppercase text-j-text hover:bg-j-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="bg-white border border-j-border shadow-sm py-16 text-center px-6 rounded-sm max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-j-background text-j-text-muted rounded-sm flex items-center justify-center mx-auto border border-j-border shadow-sm">
                <SearchIcon size={28} />
              </div>
              <h3 className="font-black text-xl text-j-text uppercase tracking-tight">No results found</h3>
              <p className="text-j-text-muted font-bold text-xs max-w-xs mx-auto uppercase tracking-tight">
                There are no products matching your query. Please check your spelling or try adjusting your filters.
              </p>
              <Link href="/" className="inline-flex h-10 px-8 bg-jumia-orange text-white rounded-sm font-black text-xs uppercase tracking-wider transition-all duration-300 hover:bg-orange-600 shadow active:scale-95">
                Back to Home
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="bg-j-background min-h-screen pb-24">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="w-10 h-10 border-4 border-jumia-orange/20 border-t-jumia-orange rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-[10px] uppercase tracking-wider text-j-text-muted animate-pulse">Searching...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
