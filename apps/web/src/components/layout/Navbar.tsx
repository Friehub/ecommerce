'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, HelpCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container h-[72px] flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            JUMIA<span className="text-[#F68B1E]">★</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-[600px] relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search products, brands and categories" 
            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-md pl-11 pr-4 focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all"
            id="search-input"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#F68B1E] text-white px-4 h-9 rounded font-semibold hover:bg-[#E07A1A] transition-colors">
            SEARCH
          </button>
        </div>

        {/* Actions */}
        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-gray-700 hover:text-[#F68B1E] font-medium">
            <User size={24} />
            <span>Account</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-700 hover:text-[#F68B1E] font-medium">
            <HelpCircle size={24} />
            <span>Help</span>
          </button>

          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#F68B1E] font-medium relative"
          >
            <ShoppingCart size={24} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F68B1E] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Sub Navbar */}
      <div className="bg-white border-t border-gray-100 hidden md:block">
        <div className="container h-10 flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/flash-sales" className="hover:text-[#F68B1E]">FLASH SALES</Link>
          <Link href="/official-stores" className="hover:text-[#F68B1E]">OFFICIAL STORES</Link>
          <Link href="/jumia-global" className="hover:text-[#F68B1E]">JUMIA GLOBAL</Link>
          <Link href="/best-sellers" className="hover:text-[#F68B1E]">BEST SELLERS</Link>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 8px; }
        .gap-6 { gap: 24px; }
        .gap-8 { gap: 32px; }
        .flex-1 { flex: 1; }
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-50 { z-index: 50; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .border { border: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #f3f4f6; }
        .rounded-md { border-radius: 6px; }
        .rounded { border-radius: 4px; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-2xl { font-size: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-gray-900 { color: #111827; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-400 { color: #9ca3af; }
        .text-white { color: #ffffff; }
        .w-full { width: 100%; }
        .h-11 { height: 2.75rem; }
        .h-10 { height: 2.5rem; }
        .h-9 { height: 2.25rem; }
        .h-5 { height: 1.25rem; }
        .w-5 { width: 1.25rem; }
        .pl-11 { padding-left: 2.75rem; }
        .pr-4 { padding-right: 1rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-3 { left: 0.75rem; }
        .right-1 { right: 0.25rem; }
        .top-1/2 { top: 50%; }
        .-translate-y-1/2 { transform: translateY(-50%); }
        .-top-2 { top: -0.5rem; }
        .-right-2 { right: -0.5rem; }
        .hidden { display: none; }
        @media (min-width: 768px) {
          .md\:block { display: block; }
        }
      `}</style>
    </header>
  );
};
