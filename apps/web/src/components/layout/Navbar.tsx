'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Search, HelpCircle, LogOut, Package, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { NotificationInbox } from '@/components/layout/NotificationInbox';

export const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAccountMenu, setShowAccountMenu] = React.useState(false);
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-[72px] flex items-center justify-between gap-2 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
            JUMIA<span className="text-[#F68B1E]">★</span>
          </span>
        </Link>

        {/* Search Bar — Hidden on mobile, visible on md and up */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[600px] relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search products, brands and categories" 
            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-md pl-11 pr-4 focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all"
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#F68B1E] text-white px-4 h-9 rounded font-semibold hover:bg-[#E07A1A] transition-colors"
          >
            SEARCH
          </button>
        </form>

        {/* Actions */}
        <nav className="flex items-center gap-3 md:gap-6">
          <div className="relative">
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-1 md:gap-2 text-gray-700 hover:text-[#F68B1E] font-medium py-2"
            >
              <User size={22} className="md:size-6" />
              <span className="hidden sm:inline text-sm md:text-base">
                {session ? `Hi, ${session.user?.email?.split('@')[0]}` : 'Account'}
              </span>
              <ChevronDown size={14} className={`transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border rounded-lg shadow-xl py-2 z-50 overflow-hidden animate-fade-in">
                {session ? (
                  <>
                    <Link href="/account" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F68B1E]">
                      <User size={18} />
                      My Account
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F68B1E]">
                      <Package size={18} />
                      Orders
                    </Link>
                    <Link href="/account/saved" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F68B1E]">
                      <Heart size={18} />
                      Saved Items
                    </Link>
                    <div className="border-t my-1"></div>
                    <button 
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="p-4">
                    <Link 
                      href="/login" 
                      className="block w-full bg-[#F68B1E] text-white text-center py-2 rounded font-bold text-sm uppercase hover:bg-[#E07A1A] transition-colors"
                    >
                      Sign In
                    </Link>
                    <div className="border-t my-4"></div>
                    <Link href="/account" className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#F68B1E]">
                      <User size={18} />
                      My Account
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#F68B1E] mt-3">
                      <Package size={18} />
                      Orders
                    </Link>
                    <Link href="/account/saved" className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#F68B1E] mt-3">
                      <Heart size={18} />
                      Saved Items
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-1 md:gap-2 text-gray-700 hover:text-[#F68B1E] font-medium">
            <HelpCircle size={22} className="md:size-6" />
            <span className="hidden sm:inline text-sm md:text-base">Help</span>
          </button>

          <NotificationInbox />

          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 md:gap-2 text-gray-700 hover:text-[#F68B1E] font-medium relative"
          >
            <ShoppingCart size={22} className="md:size-6" />
            <span className="hidden sm:inline text-sm md:text-base">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F68B1E] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Mobile Search Bar — Visible only on mobile */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search products, brands and categories" 
            className="w-full h-10 bg-gray-50 border border-gray-200 rounded-md pl-10 pr-24 focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] text-sm transition-all"
            id="mobile-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#F68B1E] text-white px-3 h-8 rounded font-semibold text-xs hover:bg-[#E07A1A] transition-colors"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Sub Navbar — Hidden on mobile, visible on md and up */}
      <div className="bg-white border-t border-gray-100 hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4 h-10 flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/flash-sales" className="hover:text-[#F68B1E]">FLASH SALES</Link>
          <Link href="/official-stores" className="hover:text-[#F68B1E]">OFFICIAL STORES</Link>
          <Link href="/jumia-global" className="hover:text-[#F68B1E]">JUMIA GLOBAL</Link>
          <Link href="/best-sellers" className="hover:text-[#F68B1E]">BEST SELLERS</Link>
        </div>
      </div>
    </header>
  );
};

