'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalItems } = useCart();

  const subtotal = cart?.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;
  const shipping = cart?.items?.length > 0 ? 1200 : 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/" className="hover:text-[#F68B1E] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Shopping Cart</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items Section */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all shadow-md overflow-hidden p-5 lg:p-7">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={22} className="text-[#F68B1E]" />
                  <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Cart ({totalItems})</h1>
                </div>
              </div>

              {cart?.items?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-5 last:pb-0">
                      <div className="w-24 h-24 bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                        <img 
                          src={item.variant?.product?.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
                          alt={item.variant?.product?.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm md:text-base font-extrabold text-gray-900 leading-tight hover:text-[#F68B1E] transition-colors cursor-pointer line-clamp-2">
                              {item.variant?.product?.title}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all flex items-center justify-center ml-4 flex-shrink-0 cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          {item.variant?.attributes && (
                            <p className="text-xs font-bold text-[#264996] uppercase tracking-wide mt-1.5 bg-blue-50/50 px-2 py-1 rounded w-fit border border-blue-100/50">
                              {Object.values(item.variant.attributes as any).join(' / ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 bg-gray-50/20 rounded-xl overflow-hidden h-9">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-3 hover:bg-gray-100 h-full flex items-center justify-center transition-colors text-gray-600 active:scale-90"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-black text-gray-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 hover:bg-gray-100 h-full flex items-center justify-center transition-colors text-gray-600 active:scale-90"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-base md:text-lg font-black text-[#F68B1E]">
                            ₦ {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center px-4 select-none">
                  <div className="w-20 h-20 bg-orange-50 text-[#F68B1E] rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-tight">Your cart is empty</h3>
                  <p className="text-gray-500 font-medium text-sm mt-2 max-w-xs mx-auto">
                    Browse our categories and discover our best deals!
                  </p>
                  <Link href="/" className="mt-6 inline-block px-7 py-3 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 duration-200">
                    START SHOPPING
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Side-Panel */}
          {cart?.items?.length > 0 && (
            <div className="w-full lg:w-[380px] select-none">
              <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-5 lg:p-7 sticky top-24">
                <h3 className="font-extrabold uppercase text-sm tracking-tight text-gray-800 border-b border-gray-100 pb-3 mb-4">Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-800">₦ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Shipping</span>
                    <span className="font-bold text-gray-800">₦ {shipping.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="font-extrabold text-gray-800">Total</span>
                    <span className="font-extrabold text-[#F68B1E] text-xl">₦ {total.toLocaleString()}</span>
                  </div>

                  <Link 
                    href="/checkout"
                    className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-md select-none mt-4"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
