'use client';

import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const primaryVariant = product.variants?.[0];
  const price = product.price ?? primaryVariant?.price ?? 0;
  const comparePrice = product.comparePrice ?? primaryVariant?.comparePrice;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <Link 
      href={`/products/${product.slug}`} 
      className="bg-white rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full border border-gray-100 hover:border-gray-200 select-none shadow-sm hover:shadow-orange-500/5"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
        <img 
          src={product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-100 backdrop-blur-md border border-red-200/50 text-[#DF3131] text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg tracking-wide uppercase select-none shadow-sm">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1 bg-white">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#F68B1E] transition-colors leading-normal">
          {product.title}
        </h3>
        <div className="mt-auto pt-2 flex flex-col gap-0.5">
          <div className="text-lg font-extrabold text-gray-900 group-hover:text-[#F68B1E] transition-colors">
            ₦ {price.toLocaleString()}
          </div>
          {comparePrice && (
            <div className="text-xs text-gray-400 line-through font-medium">
              ₦ {comparePrice.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
