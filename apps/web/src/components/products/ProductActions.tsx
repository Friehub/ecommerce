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
    <div className="flex flex-col gap-6">
      {/* Variants Section */}
      {product.variants.length > 1 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-label-bold font-bold uppercase text-j-text-muted">Variation</h4>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: any) => {
              const label = Object.values(v.attributes as any).join(' • ');
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 text-body-sm font-medium border rounded transition-all ${
                    isSelected
                    ? 'border-jumia-orange text-jumia-orange bg-jumia-orange/5'
                    : 'border-j-outline-variant text-j-text hover:border-j-text'
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-j-outline-variant rounded h-12 w-full sm:w-auto">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-12 h-full flex items-center justify-center hover:bg-j-surface-container-low transition-colors disabled:opacity-50"
              disabled={isCartLoading}
            >
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-bold text-body-lg">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="w-12 h-full flex items-center justify-center hover:bg-j-surface-container-low transition-colors disabled:opacity-50"
              disabled={isCartLoading}
            >
              <Plus size={18} />
            </button>
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isCartLoading || selectedVariant.inventory === 0}
            className="flex-1 bg-jumia-orange text-white h-12 px-8 rounded font-bold text-label-bold uppercase shadow-sm hover:bg-jumia-orange-dark transition-all flex items-center justify-center gap-3 disabled:bg-j-surface-container-high disabled:text-j-text-muted disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {isCartLoading ? 'Adding...' : selectedVariant.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlistToggle}
            className={`p-3 border rounded transition-all flex items-center justify-center group ${
              isInWishlist 
              ? 'border-red-100 bg-red-50 text-red-600' 
              : 'border-j-outline-variant text-j-text hover:border-jumia-orange hover:text-jumia-orange'
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
