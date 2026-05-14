// apps/web/src/components/layout/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User, HelpCircle, ShoppingCart, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-j-surface border-b border-j-outline-variant shadow-sm">
      <div className="max-w-container-max mx-auto flex items-center justify-between py-4 px-margin-desktop">
        {/* Brand Logo */}
        <Link href="/" className="text-headline-md font-bold text-jumia-orange">
          Jumia
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-j-text-muted">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products, brands and categories"
            className="w-full pl-10 pr-24 py-2 border border-j-outline-variant rounded bg-j-surface-container-lowest focus:outline-none focus:border-jumia-orange focus:ring-1 focus:ring-jumia-orange text-body-md text-j-text placeholder:text-j-text-muted transition-all"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-jumia-orange text-white px-4 py-1.5 rounded text-label-bold font-bold hover:bg-jumia-orange-dark transition-colors uppercase">
            Search
          </button>
        </div>

        {/* Actions & Links */}
        <div className="flex items-center gap-6">
          <Link 
            href="/account" 
            className="flex items-center gap-2 text-j-text-muted hover:bg-j-surface-container-low transition-colors p-2 rounded text-body-md"
          >
            <User size={20} />
            <span>Account</span>
            <ChevronDown size={14} />
          </Link>
          
          <Link 
            href="/help" 
            className="flex items-center gap-2 text-j-text-muted hover:bg-j-surface-container-low transition-colors p-2 rounded text-body-md"
          >
            <HelpCircle size={20} />
            <span>Help</span>
            <ChevronDown size={14} />
          </Link>
          
          <Link 
            href="/cart" 
            className="flex items-center gap-2 text-j-text-muted hover:bg-j-surface-container-low transition-colors p-2 rounded text-body-md"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-jumia-orange text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                0
              </span>
            </div>
            <span>Cart</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
