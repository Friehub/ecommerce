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
    <Link 
      href={`/products/${product.slug}`} 
      className="bg-white rounded-md overflow-hidden hover:shadow-md duration-150 transition-all flex flex-col group h-full border border-gray-200 shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden bg-white flex items-center justify-center">
        <img 
          src={product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
          alt={product.title}
          className="w-full h-full object-contain duration-150 transition-all p-2"
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
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
