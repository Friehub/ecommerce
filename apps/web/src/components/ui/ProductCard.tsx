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
      className="flex flex-col h-full group bg-surface p-3 rounded-lg border border-outline-variant/30 hover:border-primary/40 hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-square mb-4 bg-surface-container rounded-md overflow-hidden flex items-center justify-center p-2">
        <img 
          src={product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'} 
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-error text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="font-inter text-xs text-on-surface-variant line-clamp-2 mb-3 leading-snug group-hover:text-primary transition-colors h-8">
          {product.title}
        </h3>
        
        <div className="mt-auto">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-base font-medium text-on-surface">
              ₦ {price.toLocaleString()}
            </span>
            {comparePrice && (
              <span className="font-inter text-[10px] text-on-surface-variant/60 line-through">
                ₦ {comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.isFlashSale && (
            <div className="mt-3 space-y-1.5">
              <div className="w-full h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-error rounded-full" 
                  style={{ width: `${(product.itemsLeft / (product.itemsLeft + 20)) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase">
                {product.itemsLeft || 10} ITEMS LEFT
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
