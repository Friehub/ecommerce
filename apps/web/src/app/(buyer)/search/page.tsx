'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';
import { Filter, SortAsc, Search as SearchIcon, X, SlidersHorizontal, Loader2 } from 'lucide-react';

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
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data: brands } = api.catalog.getBrands.useQuery();

  const { data: products, isLoading } = api.catalog.listProducts.useQuery(
    {
      search: query || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      brandId: brandId || undefined,
      sortBy: sortBy || undefined,
    },
    { enabled: true }
  );

  const FilterContent = () => (
    <div className="p-5 space-y-6">
      <div>
        <h4 className="text-[10px] font-black uppercase text-on-surface-variant mb-6 tracking-[0.4em] opacity-40 italic">Valuation (₦)</h4>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="MIN" 
              className="w-full bg-surface-container-low/30 border-2 border-surface-container-low rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface focus:border-primary-container outline-none transition-all placeholder:font-normal placeholder:text-on-surface-variant/50" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="MAX" 
              className="w-full bg-surface-container-low/30 border-2 border-surface-container-low rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface focus:border-primary-container outline-none transition-all placeholder:font-normal placeholder:text-on-surface-variant/50" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button 
            onClick={() => updateFilters({ minPrice, maxPrice })}
            className="w-full bg-on-surface text-white py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-primary-container transition-all active:scale-95"
          >
            Apply Range
          </button>
        </div>
      </div>
      
      {brands && brands.length > 0 && (
        <div className="pt-6 border-t-2 border-surface-container-low">
          <h4 className="text-[10px] font-black uppercase text-on-surface-variant mb-6 tracking-[0.4em] opacity-40 italic">Manufacturer</h4>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input 
                type="radio" 
                name="brand"
                checked={!brandId}
                onChange={() => {
                  setBrandId('');
                  updateFilters({ brandId: '' });
                }}
                className="w-4 h-4 rounded-full border-2 border-outline-variant text-primary-container focus:ring-primary-container bg-surface-container-low" 
              />
              <span className="group-hover:text-primary-container font-black text-on-surface-variant uppercase text-[10px] tracking-widest transition-colors opacity-80">All Nodes</span>
            </label>
            {brands.map((b: any) => (
              <label key={b.id} className="flex items-center gap-4 cursor-pointer group">
                <input 
                  type="radio" 
                  name="brand"
                  checked={brandId === b.id}
                  onChange={() => {
                    setBrandId(b.id);
                    updateFilters({ brandId: b.id });
                  }}
                  className="w-4 h-4 rounded-full border-2 border-outline-variant text-primary-container focus:ring-primary-container bg-surface-container-low" 
                />
                <span className="group-hover:text-primary-container font-black text-on-surface-variant uppercase text-[10px] tracking-widest transition-colors opacity-80">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsFilterOpen(false)}
        className="w-full py-5 bg-primary-container text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] mt-8 lg:hidden shadow-2xl shadow-primary-container/20 active:scale-95 transition-all"
      >
        Close Console
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-4 mb-8">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-3 bg-surface-container-lowest border-4 border-surface-container-low py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-on-surface active:scale-95 transition-all shadow-soft"
          >
            <SlidersHorizontal size={18} className="text-primary-container" />
            Precision Filters
          </button>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-[40px] shadow-soft border-4 border-surface-container-low overflow-hidden sticky top-24">
            <div className="p-8 bg-surface-container-low/30 border-b-2 border-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-primary-container" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-on-surface">Precision Filters</h3>
              </div>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-md" onClick={() => setIsFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-[48px] p-10 animate-in slide-in-from-bottom duration-500 shadow-2xl border-t-8 border-surface-container-low">
              <div className="w-16 h-2 bg-surface-container-low rounded-full mx-auto mb-10" />
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter">Filter Console</h3>
                <button onClick={() => setIsFilterOpen(false)} className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center border-2 border-surface-container-lowest text-on-surface active:scale-90 transition-all">
                  <X size={24} />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8 bg-surface-container-lowest p-8 rounded-[40px] border-4 border-surface-container-low shadow-soft">
            <div>
              <h1 className="text-4xl font-black text-on-surface leading-none tracking-tighter uppercase mb-2">
                {query ? query : 'Global Inventory'}
              </h1>
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic">
                {products?.results?.length || 0} Entities Successfully Located
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-black bg-surface-container-low/30 px-6 py-4 rounded-[20px] border-2 border-surface-container-low shadow-sm text-on-surface">
              <SortAsc size={18} className="text-primary-container" />
              <select 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sortBy: e.target.value });
                }}
                className="border-none bg-transparent font-black focus:ring-0 text-[10px] cursor-pointer outline-none text-on-surface uppercase tracking-widest appearance-none"
              >
                <option value="newest">Newest Acquisition</option>
                <option value="price_asc">Valuation: Low-High</option>
                <option value="price_desc">Valuation: High-Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(minPriceParam || maxPriceParam || brandIdParam) && (
            <div className="flex flex-wrap items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 mr-2">Applied Constraints:</span>
              {minPriceParam && (
                <button 
                  onClick={() => updateFilters({ minPrice: '' })}
                  className="bg-surface-container-low px-5 py-2.5 rounded-full border-2 border-surface-container-lowest flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-on-surface hover:border-primary-container transition-all shadow-sm"
                >
                  Min: ₦{parseInt(minPriceParam).toLocaleString()}
                  <X size={14} className="text-primary-container" />
                </button>
              )}
              {maxPriceParam && (
                <button 
                  onClick={() => updateFilters({ maxPrice: '' })}
                  className="bg-surface-container-low px-5 py-2.5 rounded-full border-2 border-surface-container-lowest flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-on-surface hover:border-primary-container transition-all shadow-sm"
                >
                  Max: ₦{parseInt(maxPriceParam).toLocaleString()}
                  <X size={14} className="text-primary-container" />
                </button>
              )}
              {brandIdParam && brands && (
                <button 
                  onClick={() => updateFilters({ brandId: '' })}
                  className="bg-surface-container-low px-5 py-2.5 rounded-full border-2 border-surface-container-lowest flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-on-surface hover:border-primary-container transition-all shadow-sm"
                >
                  Node: {brands.find((b: any) => b.id === brandIdParam)?.name}
                  <X size={14} className="text-primary-container" />
                </button>
              )}
              <button 
                onClick={() => updateFilters({ minPrice: '', maxPrice: '', brandId: '' })}
                className="text-[9px] font-black uppercase tracking-widest text-error hover:underline ml-4 italic"
              >
                Purge All Filters
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[32px] animate-pulse border-2 border-surface-container-lowest" />
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.results.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-[64px] border-8 border-surface-container-low shadow-soft py-40 text-center px-10 animate-in fade-in zoom-in-95 duration-1000">
              <div className="w-28 h-28 bg-surface-container-low text-on-surface-variant/20 rounded-[40px] flex items-center justify-center mx-auto mb-10 border-4 border-surface-container-lowest shadow-2xl">
                <SearchIcon size={48} />
              </div>
              <h3 className="font-black text-4xl text-on-surface leading-none uppercase tracking-tighter">Inventory Void</h3>
              <p className="text-on-surface-variant font-black text-[11px] mt-6 max-w-xs mx-auto uppercase tracking-[0.4em] opacity-40 leading-relaxed italic">
                The current search vector returned zero matches in the global grid.
              </p>
              <Link href="/" className="mt-16 inline-flex px-14 py-6 bg-on-surface text-white rounded-[28px] font-black text-[11px] tracking-[0.4em] uppercase transition-all duration-500 hover:shadow-2xl hover:scale-105 active:scale-95 shadow-xl">
                Return to Hub
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
    <div className="bg-background min-h-screen pb-32">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-40 text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 border-8 border-surface-container-low border-t-primary-container rounded-full animate-spin mx-auto mb-10 shadow-2xl" />
          <p className="font-black text-[10px] uppercase tracking-[0.4em] text-on-surface-variant opacity-40 italic">Querying Central Grid...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
