'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';
import { Filter, SortAsc, Search as SearchIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [minPrice, setMinPrice] = React.useState<string>('');
  const [maxPrice, setMaxPrice] = React.useState<string>('');
  const [brandId, setBrandId] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('newest');

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

  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 select-none">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden sticky top-20">
            <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-800">Filters</h3>
              </div>
              <span className="text-[10px] font-extrabold text-[#F68B1E] uppercase tracking-wider bg-orange-50 px-2 py-1 rounded">
                Refine
              </span>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-gray-400 mb-2 tracking-wide">Price Range (₦)</h4>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-lg px-3 py-2 text-sm outline-none font-medium text-gray-800 transition-all" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-gray-300">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-lg px-3 py-2 text-sm outline-none font-medium text-gray-800 transition-all" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              
              {brands && brands.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-extrabold uppercase text-gray-400 mb-2 tracking-wide">Brands</h4>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer group">
                      <input 
                        type="radio" 
                        name="brand"
                        checked={!brandId}
                        onChange={() => setBrandId('')}
                        className="rounded-full border-gray-300 text-[#F68B1E] focus:ring-[#F68B1E]" 
                      />
                      <span className="group-hover:text-[#F68B1E] font-medium text-gray-700 transition-colors">All Brands</span>
                    </label>
                    {brands.map((b: any) => (
                      <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                        <input 
                          type="radio" 
                          name="brand"
                          checked={brandId === b.id}
                          onChange={() => setBrandId(b.id)}
                          className="rounded-full border-gray-300 text-[#F68B1E] focus:ring-[#F68B1E]" 
                        />
                        <span className="group-hover:text-[#F68B1E] font-medium text-gray-700 transition-colors">{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 p-5 mb-5 flex items-center justify-between shadow-md select-none">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {query ? `Search results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{products?.results?.length || 0} products found</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-100/60 text-gray-700">
                <SortAsc size={16} className="text-[#F68B1E]" />
                <span className="hidden sm:inline font-medium text-gray-500">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-none bg-transparent font-extrabold focus:ring-0 text-sm cursor-pointer outline-none text-gray-800"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.results.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-md py-16 text-center px-4 select-none">
              <div className="w-16 h-16 bg-orange-50 text-[#F68B1E] rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                <SearchIcon size={28} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 leading-tight">No results found {query && `for "${query}"`}</h3>
              <p className="text-gray-500 font-medium text-sm mt-2 max-w-xs mx-auto">
                Try checking your spelling or using more general search terms.
              </p>
              <a href="/" className="mt-6 inline-block px-6 py-3 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs tracking-wide uppercase transition-all duration-200 hover:shadow-lg hover:scale-105 select-none border border-transparent shadow-md">
                Continue Shopping
              </a>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-5 { gap: 20px; }
        .gap-6 { gap: 24px; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\:flex-row { flex-direction: row; }
          .lg\:w-64 { width: 16rem; }
          .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .rounded-xl { border-radius: 12px; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .p-4 { padding: 1rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-5 { margin-bottom: 1.25rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-6 { margin-top: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .font-extrabold { font-weight: 800; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .hidden { display: none; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .sticky { position: sticky; }
        .top-20 { top: 5rem; }
        .transition-colors { transition: color 0.2s ease; }
      `}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12">
      <Suspense fallback={<div className="container py-20 text-center font-bold text-gray-500">Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
