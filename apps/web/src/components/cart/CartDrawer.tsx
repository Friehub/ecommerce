'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, X, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '../ui/Button';

export const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, totalItems } = useCart();

  const cartTotal = cart?.items?.reduce((acc: number, item: any) =>
    acc + (Number(item.priceSnapshot ?? item.variant?.price ?? 0)) * item.quantity, 0
  ) ?? 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-[110] shadow-xl flex flex-col transition-transform duration-300 border-l border-j-border">
        <div className="p-6 border-b border-j-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-j-text" />
            <div>
              <h2 className="font-bold text-j-text uppercase text-sm">Cart ({totalItems})</h2>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-j-surface-container-low rounded-full transition-colors"
          >
            <X size={24} className="text-j-text" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart?.items?.length > 0 ? (
            cart.items.map((item: any) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-2 bg-white rounded-sm border border-transparent hover:border-j-border transition-colors group"
              >
                <div className="w-20 h-20 bg-j-surface-container-low rounded-sm overflow-hidden flex-shrink-0 relative border border-j-border">
                  <Image 
                    src={item.variant.product.media[0]?.url || '/placeholder.png'} 
                    alt={item.variant.product.title}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xs font-medium text-j-text line-clamp-2 leading-snug">
                      {item.variant.product.title}
                    </h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-j-text-muted hover:text-j-error transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-j-text-muted mt-1 truncate uppercase">
                    {Object.values(item.variant.attributes as any).join(' / ')}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center border border-j-border rounded-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-j-surface-container-low"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-j-surface-container-low"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-j-text">
                      ₦ {((Number(item.priceSnapshot ?? item.variant?.price ?? 0)) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
              <div className="w-20 h-20 bg-j-surface-container-low rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-j-text-muted opacity-50" />
              </div>
              <h3 className="font-bold text-j-text text-lg mb-2">Your cart is empty!</h3>
              <p className="text-j-text-muted text-sm mb-8 max-w-[240px]">
                Browse our categories and discover our best deals!
              </p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Start Shopping
              </Button>
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="p-6 border-t border-j-border bg-j-surface-container-low space-y-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-j-text-muted font-bold text-xs uppercase tracking-wider">Subtotal</span>
              <span className="text-2xl font-black text-j-text">₦ {cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-j-text-muted">Customs fee and shipping excluded</p>
            
            <Link href="/cart" className="block" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-12 text-sm font-bold tracking-wider">
                CHECKOUT (₦ {cartTotal.toLocaleString()})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

