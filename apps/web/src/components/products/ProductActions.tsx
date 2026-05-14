// apps/web/src/components/products/ProductActions.tsx
'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../trpc/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface ProductActionsProps {
  product: any;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { data: session } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const { addToCart, isLoading: isCartLoading } = useCart();
  
  const utils = api.useUtils();
  const { data: wishlist } = api.catalog.getWishlist.useQuery(undefined, {
    retry: false,
    enabled: !!session,
  });

  const addToWishlist = api.catalog.addToWishlist.useMutation({
    onSuccess: () => {
      utils.catalog.getWishlist.invalidate();
      showToast('Item added to wishlist');
    },
    onError: (err) => showToast(err.message, 'error')
  });

  const removeFromWishlist = api.catalog.removeFromWishlist.useMutation({
    onSuccess: () => {
      utils.catalog.getWishlist.invalidate();
      showToast('Item removed from wishlist', 'info');
    },
    onError: (err) => showToast(err.message, 'error')
  });

  const isInWishlist = wishlist?.items?.some((item: any) => item.variantId === selectedVariant.id);

  const handleWishlistToggle = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isInWishlist) {
      await removeFromWishlist.mutateAsync({ variantId: selectedVariant.id });
    } else {
      await addToWishlist.mutateAsync({ variantId: selectedVariant.id });
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(selectedVariant.id, quantity);
      showToast('Successfully added to cart!');
    } catch (err: any) {
      showToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Variants Section */}
      {product.variants.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-j-text-muted">Variation</h4>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: any) => {
              const label = Object.values(v.attributes as any).join(' • ');
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 text-[11px] font-black uppercase tracking-tight border-2 rounded-sm transition-all ${
                    isSelected
                    ? 'border-jumia-orange text-jumia-orange bg-orange-50 shadow-sm'
                    : 'border-j-border text-j-text hover:border-j-text-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border-2 border-j-border rounded-sm h-12 bg-white shrink-0">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-12 h-full flex items-center justify-center hover:bg-j-background transition-colors disabled:opacity-50 text-j-text"
              disabled={isCartLoading}
            >
              <Minus size={18} />
            </button>
            <span className="w-10 text-center font-black text-sm">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="w-12 h-full flex items-center justify-center hover:bg-j-background transition-colors disabled:opacity-50 text-j-text"
              disabled={isCartLoading}
            >
              <Plus size={18} />
            </button>
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isCartLoading || selectedVariant.inventory === 0}
            className="flex-1 bg-jumia-orange text-white h-12 px-8 rounded-sm font-black text-sm uppercase shadow-lg hover:bg-[#e67b1e] transition-all flex items-center justify-center gap-3 disabled:bg-j-border disabled:text-j-text-muted disabled:cursor-not-allowed active:scale-[0.98] tracking-wider"
          >
            <ShoppingCart size={20} />
            {isCartLoading ? 'Adding...' : selectedVariant.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlistToggle}
            className={`p-3 border-2 rounded-sm transition-all flex items-center justify-center group shrink-0 ${
              isInWishlist 
              ? 'border-red-100 bg-red-50 text-red-600' 
              : 'border-j-border text-j-text hover:border-jumia-orange hover:text-jumia-orange'
            }`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} className="transition-transform group-active:scale-125" />
          </button>
        </div>
      </div>
    </div>
  );
};
