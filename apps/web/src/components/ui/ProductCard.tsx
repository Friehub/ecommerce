'use client';

import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const primaryVariant = product.variants?.[0];
  const price = primaryVariant?.price || 0;
  const comparePrice = primaryVariant?.comparePrice;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <Link href={`/products/${product.slug}`} className="bg-white rounded overflow-hidden hover:shadow-lg transition-all flex flex-col group h-full">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-[#FEE2E2] text-[#DF3131] text-[10px] font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm text-gray-700 line-clamp-2 mb-2 group-hover:text-[#F68B1E] transition-colors">
          {product.title}
        </h3>
        <div className="mt-auto">
          <div className="text-lg font-bold">₦ {price.toLocaleString()}</div>
          {comparePrice && (
            <div className="text-xs text-gray-400 line-through">₦ {comparePrice.toLocaleString()}</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .rounded { border-radius: 4px; }
        .overflow-hidden { overflow: hidden; }
        .hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .transition-all { transition: all 0.2s ease; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .h-full { height: 100%; }
        .relative { position: relative; }
        .aspect-square { aspect-ratio: 1 / 1; }
        .object-contain { object-fit: contain; }
        .w-full { width: 100%; }
        .p-3 { padding: 0.75rem; }
        .flex-1 { flex: 1; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-lg { font-size: 1.125rem; }
        .text-gray-700 { color: #374151; }
        .text-gray-400 { color: #9ca3af; }
        .font-bold { font-weight: 700; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-auto { margin-top: auto; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .absolute { position: absolute; }
        .top-2 { top: 0.5rem; }
        .right-2 { right: 0.5rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .bg-\[#FEE2E2\] { background-color: #fee2e2; }
        .text-\[#DF3131\] { color: #df3131; }
      `}</style>
    </Link>
  );
};
