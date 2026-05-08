'use client';

import React from 'react';
import Link from 'next/link';
import { Star, StarHalf } from 'lucide-react';
import { ProductStatusBadge } from './ProductStatusBadge';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const primaryVariant = product.variants?.[0];
  const price = Number(product.price ?? primaryVariant?.price ?? 0);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : (primaryVariant?.comparePrice ? Number(primaryVariant.comparePrice) : undefined);
  const discount = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const savings = comparePrice && comparePrice > price ? comparePrice - price : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={10} className="fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} size={10} className="fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} size={10} className="text-gray-200 fill-gray-200" />);
      }
    }
    return stars;
  };

  return (
    <Link 
      href={`/products/${product.slug}`} 
      className="flex flex-col h-full group bg-white p-3 rounded-xl border border-gray-100 hover:border-[#f68b1e]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
        <img 
          src={product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'} 
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isExpress && <ProductStatusBadge type="EXPRESS" />}
          {product.isOfficial && <ProductStatusBadge type="OFFICIAL" />}
        </div>

        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg shadow-red-500/20">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-black text-[#f68b1e] uppercase tracking-widest truncate max-w-[70%]">
            {product.brand?.name || 'Generic'}
          </span>
          {product.isGlobal && <ProductStatusBadge type="GLOBAL" />}
        </div>

        <h3 className="font-inter text-[11px] font-bold text-gray-800 line-clamp-2 mb-2 leading-tight group-hover:text-[#f68b1e] transition-colors h-7">
          {product.title}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {renderStars(Number(product.averageRating || 0))}
          </div>
          <span className="text-[9px] font-black text-gray-400 mt-0.5">({product.reviewCount || 0})</span>
        </div>
        
        <div className="mt-auto">
          <div className="flex flex-col gap-0.5">
            <span className="font-inter text-base font-black text-gray-900 tracking-tight">
              ₦ {price.toLocaleString()}
            </span>
            {comparePrice && comparePrice > price && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 line-through font-bold">
                  ₦ {comparePrice.toLocaleString()}
                </span>
                <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  SAVE ₦{savings.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {product.isFlashSale && (
            <div className="mt-3 space-y-1.5">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${(product.itemsLeft / (product.itemsLeft + 20)) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                {product.itemsLeft || 10} ITEMS LEFT
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
