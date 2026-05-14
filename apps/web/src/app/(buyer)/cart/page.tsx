// apps/web/src/app/(buyer)/cart/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalItems } = useCart();

  const subtotal = cart?.items?.reduce((acc: number, item: any) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
  const shipping = cart?.items?.length > 0 ? 500 : 0; // Simplified shipping
  const total = subtotal + shipping;

  return (
    <div className="bg-j-background min-h-screen pb-12">
      <div className="max-w-container-max mx-auto px-margin-desktop py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4 text-body-sm text-j-text-muted">
          <Link href="/" className="hover:text-jumia-orange">Home</Link>
          <ChevronRight size={14} />
          <span className="text-j-text">Cart</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Items Section */}
          <div className="flex-1">
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
                <h1 className="text-headline-sm font-bold text-j-text uppercase">Cart ({totalItems})</h1>
              </div>

              {cart?.items?.length > 0 ? (
                <div className="divide-y divide-j-outline-variant">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4">
                      {/* Image */}
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-j-surface-container-low rounded border border-j-outline-variant flex-shrink-0 flex items-center justify-center p-2">
                        <img 
                          src={item.variant?.product?.media?.[0]?.url || '/placeholder.png'} 
                          alt={item.variant?.product?.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-body-md font-bold text-j-text line-clamp-2 uppercase">
                              {item.variant?.product?.title}
                            </h3>
                            {item.variant?.attributes && (
                              <p className="text-body-sm text-j-text-muted mt-1 italic">
                                {Object.values(item.variant.attributes as any).join(' • ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-price-sm text-j-text font-bold">
                              ₦ {(Number(item.priceSnapshot ?? 0) * item.quantity).toLocaleString()}
                            </span>
                            {item.variant?.comparePrice && Number(item.variant.comparePrice) > Number(item.priceSnapshot) && (
                              <span className="text-body-sm text-j-text-muted line-through">
                                ₦ {(Number(item.variant.comparePrice) * item.quantity).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1.5 text-jumia-orange hover:text-jumia-orange-dark font-bold text-label-bold uppercase transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>

                          <div className="flex items-center border border-j-outline-variant rounded h-8 overflow-hidden bg-j-surface-container-lowest shadow-sm">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-full flex items-center justify-center hover:bg-j-surface-container-low transition-colors text-j-text border-r border-j-outline-variant"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-body-sm font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-full flex items-center justify-center hover:bg-j-surface-container-low transition-colors text-j-text border-l border-j-outline-variant"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center px-4">
                  <div className="w-16 h-16 bg-j-surface-container-low text-jumia-orange rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart size={32} />
                  </div>
                  <h3 className="text-headline-sm font-bold mb-2">Your cart is empty!</h3>
                  <p className="text-body-md text-j-text-muted mb-8">Browse our categories and discover our best deals!</p>
                  <Link href="/" className="bg-jumia-orange text-white px-8 py-3 rounded font-bold uppercase hover:bg-jumia-orange-dark transition-all shadow-sm">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Summary Panel */}
          {cart?.items?.length > 0 && (
            <div className="w-full lg:w-[350px]">
              <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm p-4 sticky top-24 flex flex-col gap-4">
                <h3 className="text-label-bold font-bold uppercase text-j-text-muted border-b border-j-outline-variant pb-3">Cart Summary</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-body-md">
                    <span className="text-j-text font-medium">Subtotal</span>
                    <span className="text-j-text font-bold">₦ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-j-text-muted">
                    <span>Shipping</span>
                    <span>₦ {shipping.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-j-outline-variant pt-3 flex justify-between items-center">
                    <span className="text-body-lg font-bold text-j-text">Total</span>
                    <span className="text-price-sm text-jumia-orange font-bold">₦ {total.toLocaleString()}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-jumia-orange text-white py-3.5 rounded font-bold uppercase shadow-sm hover:bg-jumia-orange-dark transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Checkout (₦ {total.toLocaleString()})
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
