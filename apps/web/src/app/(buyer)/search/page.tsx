'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { Filter, SortAsc, Search as SearchIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: products, isLoading } = api.catalog.listProducts.useQuery(
    { search: query },
    { enabled: !!query }
  );

  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded shadow-sm overflow-hidden sticky top-20">
            <div className="p-4 border-b">
              <h3 className="font-bold text-sm uppercase">Filters</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Price (₦)</h4>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full border rounded px-2 py-1 text-sm focus:border-[#F68B1E] outline-none" />
                  <span className="text-gray-400">-</span>
                  <input type="number" placeholder="Max" className="w-full border rounded px-2 py-1 text-sm focus:border-[#F68B1E] outline-none" />
                </div>
                <button className="w-full mt-3 bg-[#F68B1E] text-white py-1.5 rounded text-xs font-bold uppercase tracking-wider">Apply</button>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Brands</h4>
                <div className="space-y-2">
                  {['Samsung', 'Apple', 'Sony', 'LG'].map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer group">
                      <input type="checkbox" className="rounded border-gray-300 text-[#F68B1E] focus:ring-[#F68B1E]" />
                      <span className="group-hover:text-[#F68B1E] transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="bg-white rounded shadow-sm p-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {query ? `Search results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-xs text-gray-500">{products?.length || 0} products found</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <SortAsc size={16} className="text-gray-400" />
                <span className="hidden sm:inline text-gray-500">Sort By:</span>
                <select className="border-none bg-transparent font-bold focus:ring-0 text-sm cursor-pointer">
                  <option>Popularity</option>
                  <option>Newest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded shadow-sm py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={28} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-lg">No results found {query && `for "${query}"`}</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                Try checking your spelling or use more general terms.
              </p>
              <a href="/" className="mt-6 inline-block px-6 py-2 bg-[#F68B1E] text-white rounded font-bold text-sm">
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
        .bg-gray-100 { background-color: #f3f4f6; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .rounded { border-radius: 4px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-6 { margin-top: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
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
    <div className="bg-gray-50 min-h-screen pb-12">
      <Suspense fallback={<div className="container py-20 text-center">Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
