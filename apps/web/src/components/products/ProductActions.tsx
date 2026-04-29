'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface ProductActionsProps {
  product: any;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const price = selectedVariant?.price || 0;
  const comparePrice = selectedVariant?.comparePrice;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Price Section */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">₦ {price.toLocaleString()}</span>
          {discount > 0 && (
            <span className="bg-[#FEE2E2] text-[#DF3131] text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
        </div>
        {comparePrice && (
          <div className="text-gray-400 line-through text-sm mt-1">₦ {comparePrice.toLocaleString()}</div>
        )}
        <p className="text-[10px] text-gray-500 mt-2">In stock</p>
        <p className="text-[10px] text-gray-400">+ shipping from ₦ 600 to Lagos</p>
      </div>

      {/* Variants Section */}
      {product.variants.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase text-gray-600">Select Variation</h4>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: any) => {
              const label = Object.values(v.attributes as any).join(' / ');
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 text-sm border rounded transition-all ${
                    selectedVariant.id === v.id
                      ? 'border-[#F68B1E] text-[#F68B1E] bg-[#F68B1E]/5 font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg h-12">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-4 hover:bg-gray-100 h-full transition-colors font-bold"
            >
              -
            </button>
            <span className="w-12 text-center font-bold">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="px-4 hover:bg-gray-100 h-full transition-colors font-bold"
            >
              +
            </button>
          </div>
          <button className="flex-1 bg-[#F68B1E] text-white h-12 rounded-lg font-bold shadow-md hover:bg-[#e07b14] transition-all flex items-center justify-center gap-2">
            <ShoppingCart size={20} />
            ADD TO CART
          </button>
        </div>
        
        <button className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-[#F68B1E] transition-colors py-2">
          <Heart size={18} />
          ADD TO WISHLIST
        </button>
      </div>

      {/* Service Info */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Truck size={20} className="text-gray-600" />
          </div>
          <div>
            <h5 className="text-sm font-bold">Door Delivery</h5>
            <p className="text-xs text-gray-500">Delivery ₦ 600. Ready for delivery between 02 May & 04 May when you order within next 10hrs 22mins</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
            <RotateCcw size={20} className="text-gray-600" />
          </div>
          <div>
            <h5 className="text-sm font-bold">Return Policy</h5>
            <p className="text-xs text-gray-500">Free return within 15 days for Official Store items and 7 days for other items.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-gray-600" />
          </div>
          <div>
            <h5 className="text-sm font-bold">Warranty</h5>
            <p className="text-xs text-gray-500">1 Year Warranty included for this item.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
