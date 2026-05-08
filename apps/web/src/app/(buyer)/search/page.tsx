'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';
import { Filter, SortAsc, Search as SearchIcon, X, SlidersHorizontal, Loader2 } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-300">—</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
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
                onChange={() => setBrandId('')}
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
                  onChange={() => setBrandId(b.id)}
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
              onChange={(e) => setSortBy(e.target.value)}
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
              <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter uppercase">
                {query ? query : 'All Collections'}
              </h1>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{products?.results?.length || 0} items found</p>
            </div>
            
            <div className="flex items-center gap-3 text-sm font-black bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-gray-800">
              <SortAsc size={18} className="text-[#F68B1E]" />
              <span className="uppercase tracking-widest text-[10px] text-gray-400">Sort By</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent font-black focus:ring-0 text-xs cursor-pointer outline-none text-gray-900 uppercase tracking-widest"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.results.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-black/5 py-24 text-center px-6">
              <div className="w-20 h-20 bg-orange-50 text-[#F68B1E] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/10">
                <SearchIcon size={32} />
              </div>
              <h3 className="font-black text-2xl text-gray-900 leading-tight uppercase tracking-tight">No results matched</h3>
              <p className="text-gray-400 font-bold text-sm mt-3 max-w-xs mx-auto uppercase tracking-wide leading-relaxed">
                Adjust your filters or try a different search term.
              </p>
              <Link href="/" className="mt-10 inline-flex px-10 py-5 bg-[#F68B1E] text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-95 shadow-xl shadow-orange-500/20">
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
    <div className="bg-[#F9F9FA] min-h-screen pb-20">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-32 text-center">
          <Loader2 className="animate-spin text-[#F68B1E] mx-auto mb-4" size={40} />
          <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-400">Synchronizing Inventory...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}

