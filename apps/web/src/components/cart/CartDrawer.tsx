'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

export const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[60] transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-slide-in">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#F68B1E]" />
            <h2 className="font-bold text-lg">Cart ({totalItems})</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart?.items?.length > 0 ? (
            cart.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                <div className="w-20 h-20 bg-gray-50 rounded border overflow-hidden flex-shrink-0">
                  <img 
                    src={item.variant.product.media[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
                    alt={item.variant.product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium line-clamp-1">{item.variant.product.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase">
                      {Object.values(item.variant.attributes as any).join(' / ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-[#F68B1E]">
                      ₦ {(item.variant.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-lg">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mt-1">Browse our categories and discover our best deals!</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-6 bg-[#F68B1E] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-[#e07b14] transition-all"
              >
                START SHOPPING
              </button>
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="p-4 border-t bg-gray-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-xl font-bold">₦ {cart.total.toLocaleString()}</span>
            </div>
            <Link 
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#F68B1E] text-white py-4 rounded-lg font-bold shadow-md hover:bg-[#e07b14] transition-all flex items-center justify-center gap-2"
            >
              CHECKOUT NOW
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .right-0 { right: 0; }
        .top-0 { top: 0; }
        .h-full { height: 100%; }
        .w-full { width: 100%; }
        .max-w-md { max-width: 28rem; }
        .bg-white { background-color: #ffffff; }
        .bg-black\/60 { background-color: rgba(0, 0, 0, 0.6); }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .z-\[60\] { z-index: 60; }
        .z-\[70\] { z-index: 70; }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .p-4 { padding: 1rem; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .font-bold { font-weight: 700; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-300 { color: #d1d5db; }
        .text-\[#F68B1E\] { color: #f68b1e; }
        .overflow-y-auto { overflow-y: auto; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .rounded-full { border-radius: 9999px; }
        .rounded { border-radius: 4px; }
        .rounded-lg { border-radius: 8px; }
        .transition-colors { transition: background-color 0.2s, color 0.2s; }
        .transition-all { transition: all 0.2s; }
        .w-20 { width: 5rem; }
        .h-20 { height: 5rem; }
        .object-contain { object-fit: contain; }
      `}</style>
    </>
  );
};
