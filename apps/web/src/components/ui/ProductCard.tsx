// apps/web/src/components/ui/ProductCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    discount?: number;
    inventory: number;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link 
      href={`/product/${product.slug}`}
      className="bg-j-surface-container-lowest rounded p-2 flex flex-col group cursor-pointer hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow border border-j-outline-variant/10"
    >
      <div className="relative aspect-square w-full mb-2 bg-j-surface-container-lowest">
        <Image
          src={product.imageUrl || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-contain"
        />
        {discount > 0 && (
          <span className="absolute top-0 right-0 bg-jumia-orange text-white text-body-sm px-1.5 py-0.5 rounded-bl">
            -{discount}%
          </span>
        )}
      </div>
      
      <p className="text-body-md text-j-text line-clamp-2 mb-1 group-hover:text-jumia-orange transition-colors min-h-[40px]">
        {product.name}
      </p>
      
      <div className="mt-auto">
        <p className="text-price-sm text-j-text font-bold">
          ₦ {product.price.toLocaleString()}
        </p>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-body-sm text-j-text-muted line-through">
            ₦ {product.originalPrice.toLocaleString()}
          </p>
        )}
      </div>

      {/* Optional Stock Bar (like Flash Sales) */}
      {product.inventory < 10 && product.inventory > 0 && (
        <div className="mt-2">
          <div className="w-full h-1.5 bg-j-surface-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-jumia-orange transition-all duration-500" 
              style={{ width: `${(product.inventory / 10) * 100}%` }}
            />
          </div>
          <p className="text-body-sm text-j-text-muted mt-1 text-[10px]">
            {product.inventory} items left
          </p>
        </div>
      )}

      {product.inventory === 0 && (
        <p className="text-body-sm text-j-error mt-1 text-[10px] font-bold uppercase">
          Out of Stock
        </p>
      )}
    </Link>
  );
};
