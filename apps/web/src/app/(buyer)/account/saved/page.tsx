'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../../components/ui/ProductCard';
import { Heart, ChevronRight } from 'lucide-react';

export default function SavedItemsPage() {
  const { data: wishlist, isLoading } = api.catalog.getWishlist.useQuery();

  const products = wishlist?.items?.map((item: any) => {
    const p = { ...item.variant.product };
    p.variants = [item.variant];
    return p;
  }) || [];

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-12">
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/account" className="text-gray-500 hover:text-[#F68B1E] transition-colors text-sm">My Account</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-sm font-bold">Saved Items</span>
        </div>

        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Saved Items ({products.length})</h1>
          </div>

          {isLoading ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">You haven’t saved any items yet</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Found something you like? Tap on the heart icon to save it!</p>
              <Link href="/" className="px-6 py-2 bg-[#F68B1E] text-white rounded font-bold text-sm uppercase">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>


      <style jsx>{`
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-6 { gap: 24px; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .text-gray-900 { color: #111827; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-white { color: #ffffff; }
      `}</style>
    </div>
  );
}
