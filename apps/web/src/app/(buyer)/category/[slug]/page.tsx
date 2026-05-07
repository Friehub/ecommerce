'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../../components/ui/ProductCard';
import { ChevronRight, Filter, SortAsc } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: category, isLoading: isCatLoading } = api.catalog.getCategoryBySlug.useQuery({ slug });
  
  const { data: products, isLoading: isProdLoading } = api.catalog.listProducts.useQuery(
    { categoryId: category?.id },
    { enabled: !!category?.id }
  );

  if (isCatLoading) {
    return (
      <div className="container py-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/4 mb-8" />
        <div className="flex gap-8">
          <div className="w-64 h-[600px] bg-gray-100 rounded hidden lg:block" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <p className="text-gray-500 mt-2">The category you are looking for does not exist.</p>
        <a href="/" className="text-[#F68B1E] mt-4 inline-block font-medium">Go back home</a>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container py-3 flex items-center gap-2 text-xs text-gray-500">
          <a href="/" className="hover:text-[#F68B1E]">Home</a>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded shadow-sm overflow-hidden sticky top-20">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase">Category</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Subcategories</h4>
                  <ul className="space-y-2">
                    {category.children && category.children.length > 0 ? (
                      category.children.map((child: any) => (
                        <li key={child.id}>
                          <a href={`/category/${child.slug}`} className="text-sm hover:text-[#F68B1E] transition-colors">
                            {child.name}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400 italic">No subcategories</li>
                    )}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Price (₦)</h4>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" className="w-full border rounded px-2 py-1 text-sm focus:border-[#F68B1E] outline-none" />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Max" className="w-full border rounded px-2 py-1 text-sm focus:border-[#F68B1E] outline-none" />
                  </div>
                  <button className="w-full mt-3 bg-[#F68B1E] text-white py-1.5 rounded text-xs font-bold uppercase tracking-wider">Apply</button>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="bg-white rounded shadow-sm p-4 mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{category.name}</h1>
                <p className="text-xs text-gray-500">{products?.results?.length || 0} products found</p>
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
                    <option>Product Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {isProdLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : products?.results && products.results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.results.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded shadow-sm py-20 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={28} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-lg">No products found</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                  We couldn't find any products in this category at the moment.
                </p>
                <a href="/" className="mt-6 inline-block px-6 py-2 bg-[#F68B1E] text-white rounded font-bold text-sm">
                  Continue Shopping
                </a>
              </div>
            )}
          </main>
        </div>
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
        .gap-8 { gap: 32px; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\:flex-row { flex-direction: row; }
          .lg\:w-64 { width: 16rem; }
          .lg\:block { display: block; }
          .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-900 { color: #111827; }
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
