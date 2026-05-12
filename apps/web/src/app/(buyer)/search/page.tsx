'use client';

import React, { Suspense, useState } from 'react';
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
        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-[0.2em]">Price Range (₦)</h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all" 
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              updateFilters({ minPrice: e.target.value });
            }}
          />
          <span className="text-gray-300">—</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all" 
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              updateFilters({ maxPrice: e.target.value });
            }}
          />
        </div>
      </div>
      
      {brands && brands.length > 0 && (
        <div className="pt-4 border-t border-gray-50">
          <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">Brands</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            <label className="flex items-center gap-3 text-sm cursor-pointer group">
              <input 
                type="radio" 
                name="brand"
                checked={!brandId}
                onChange={() => {
                  setBrandId('');
                  updateFilters({ brandId: '' });
                }}
                className="w-4 h-4 rounded-full border-gray-300 text-[#F68B1E] focus:ring-[#F68B1E]" 
              />
              <span className="group-hover:text-[#F68B1E] font-bold text-gray-600 uppercase text-xs tracking-tight transition-colors">All Brands</span>
            </label>
            {brands.map((b: any) => (
              <label key={b.id} className="flex items-center gap-3 text-sm cursor-pointer group">
                <input 
                  type="radio" 
                  name="brand"
                  checked={brandId === b.id}
                  onChange={() => {
                    setBrandId(b.id);
                    updateFilters({ brandId: b.id });
                  }}
                  className="w-4 h-4 rounded-full border-gray-300 text-[#F68B1E] focus:ring-[#F68B1E]" 
                />
                <span className="group-hover:text-[#F68B1E] font-bold text-gray-600 uppercase text-xs tracking-tight transition-colors">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsFilterOpen(false)}
        className="w-full py-4 bg-[#F68B1E] text-white rounded-xl font-black text-xs uppercase tracking-widest mt-4 lg:hidden"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-2 mb-4">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-gray-700 active:scale-95 transition-transform shadow-sm"
          >
            <SlidersHorizontal size={18} className="text-[#F68B1E]" />
            Filters
          </button>
          <div className="flex-1 relative">
            <select 
              value={sortBy}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateFilters({ sortBy: e.target.value });
              }}
              className="w-full bg-white border border-gray-200 py-3.5 px-4 rounded-xl text-sm font-black uppercase tracking-widest text-gray-700 outline-none appearance-none shadow-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↓</option>
              <option value="price_desc">Price ↑</option>
            </select>
          </div>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[#F68B1E]" />
                <h3 className="font-black text-sm uppercase tracking-widest text-gray-900">Refine Results</h3>
              </div>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-50 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}

        {/* Results Grid */}
        <main className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-on-surface leading-tight tracking-tighter uppercase">
                {query ? query : 'All Collections'}
              </h1>
              <p className="text-[10px] font-black text-on-surface-variant mt-1 uppercase tracking-[0.3em] opacity-40">
                {products?.results?.length || 0} units identified
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-black bg-surface-container-lowest px-6 py-4 rounded-[20px] border border-outline-variant shadow-soft text-on-surface group">
              <SortAsc size={18} className="text-primary-container" />
              <span className="uppercase tracking-[0.2em] text-[10px] text-on-surface-variant opacity-40">Sort Protocol</span>
              <select 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sortBy: e.target.value });
                }}
                className="border-none bg-transparent font-black focus:ring-0 text-xs cursor-pointer outline-none text-on-surface uppercase tracking-widest appearance-none pr-8 relative"
              >
                <option value="newest">Chronological</option>
                <option value="price_asc">Value: Low-High</option>
                <option value="price_desc">Value: High-Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(minPrice || maxPrice || brandId) && (
            <div className="flex flex-wrap items-center gap-3 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mr-2">Active Refinements:</span>
              {minPrice && (
                <button 
                  onClick={() => { setMinPrice(''); updateFilters({ minPrice: '' }); }}
                  className="bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface hover:border-primary-container transition-all"
                >
                  Min: ₦{parseInt(minPrice).toLocaleString()}
                  <X size={12} className="text-primary-container" />
                </button>
              )}
              {maxPrice && (
                <button 
                  onClick={() => { setMaxPrice(''); updateFilters({ maxPrice: '' }); }}
                  className="bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface hover:border-primary-container transition-all"
                >
                  Max: ₦{parseInt(maxPrice).toLocaleString()}
                  <X size={12} className="text-primary-container" />
                </button>
              )}
              {brandId && brands && (
                <button 
                  onClick={() => { setBrandId(''); updateFilters({ brandId: '' }); }}
                  className="bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface hover:border-primary-container transition-all"
                >
                  Brand: {brands.find((b: any) => b.id === brandId)?.name}
                  <X size={12} className="text-primary-container" />
                </button>
              )}
              <button 
                onClick={() => {
                  setMinPrice(''); setMaxPrice(''); setBrandId('');
                  updateFilters({ minPrice: '', maxPrice: '', brandId: '' });
                }}
                className="text-[10px] font-black uppercase tracking-widest text-error hover:underline ml-2"
              >
                Reset All
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[32px] animate-pulse border border-outline-variant/30" />
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {products.results.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft py-32 text-center px-10 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-primary-container/10 text-primary-container rounded-[32px] flex items-center justify-center mx-auto mb-8 border-4 border-primary-container/5 shadow-xl shadow-primary-container/10">
                <SearchIcon size={40} />
              </div>
              <h3 className="font-black text-3xl text-on-surface leading-none uppercase tracking-tighter">Zero Correlation Found</h3>
              <p className="text-on-surface-variant font-black text-[11px] mt-4 max-w-xs mx-auto uppercase tracking-[0.2em] opacity-40 leading-relaxed italic">
                Adjust your refinement parameters or initialize a new search vector.
              </p>
              <Link href="/" className="mt-12 inline-flex px-12 py-6 bg-primary-container text-white rounded-[24px] font-black text-xs tracking-[0.3em] uppercase transition-all duration-500 hover:shadow-2xl hover:shadow-primary-container/40 hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary-container/20">
                Back to Discovery
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
    <div className="bg-background min-h-screen pb-20">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-32 text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin mx-auto mb-8 shadow-xl shadow-primary-container/10" />
          <p className="font-black text-[10px] uppercase tracking-[0.4em] text-on-surface-variant opacity-40">Synchronizing Global Inventory...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}

