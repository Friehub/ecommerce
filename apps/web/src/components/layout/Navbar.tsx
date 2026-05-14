'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  User, 
  HelpCircle, 
  ShoppingCart, 
  ChevronDown,
  ShoppingBag,
  Store,
  PhoneCall
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { NotificationInbox } from './NotificationInbox';

export const Navbar = () => {
  const { data: session } = useSession();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
      {/* Top Bar */}
      <div className="w-full bg-j-surface-container-low border-b border-j-border hidden md:block">
        <div className="max-w-[1184px] mx-auto flex justify-between items-center h-8 px-4">
          <div className="flex items-center gap-6">
            <Link href="/seller" className="flex items-center gap-2 text-[10px] font-black text-jumia-orange uppercase hover:underline">
              <Store size={12} /> Sell on Jumia
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/help" className="text-[10px] font-bold text-j-text-muted uppercase hover:text-j-text">Help Center</Link>
            <Link href="/track-order" className="text-[10px] font-bold text-j-text-muted uppercase hover:text-j-text">Track Order</Link>
            <div className="flex items-center gap-2 text-[10px] font-black text-j-text uppercase">
              <PhoneCall size={12} className="text-jumia-orange" /> 0800 000 0000
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="w-full bg-white border-b border-j-border">
        <div className="max-w-[1184px] mx-auto flex items-center justify-between py-4 px-4 gap-8">
          {/* Brand Logo */}
          <Link href="/" className="text-4xl font-black text-jumia-orange tracking-tighter flex-shrink-0">
            Jumia
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[600px] relative flex">
            <div className="relative flex-1 group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors">
                <Search size={20} strokeWidth={2} />
              </div>
              <input
                type="text"
                placeholder="Search products, brands and categories"
                className="w-full pl-10 pr-4 h-11 border border-j-border rounded-l-sm bg-white focus:outline-none focus:border-jumia-orange focus:ring-1 focus:ring-jumia-orange text-sm text-j-text placeholder:text-j-text-muted transition-all"
              />
            </div>
            <button className="bg-jumia-orange text-white px-8 h-11 rounded-r-sm text-xs font-black hover:bg-jumia-orange-dark transition-colors uppercase shadow-md active:scale-95">
              Search
            </button>
          </div>

          {/* Actions & Links */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Link 
                href="/account" 
                className="flex items-center gap-2 text-j-text hover:text-jumia-orange transition-colors p-2 rounded-sm font-black text-xs uppercase"
              >
                <User size={24} strokeWidth={1.5} />
                <div className="hidden lg:flex flex-col items-start leading-none">
                  <span className="text-[9px] text-j-text-muted font-bold">Welcome</span>
                  <span className="truncate max-w-[100px]">
                    {session?.user?.name ? `Hi, ${session.user.name.split(' ')[0]}` : 'Sign In'}
                  </span>
                </div>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
              </Link>
              
              {/* Account Dropdown */}
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-j-border shadow-xl rounded-sm py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                {!session ? (
                  <div className="p-4 border-b border-j-border">
                    <Link href="/login">
                      <button className="w-full bg-jumia-orange text-white py-2.5 rounded-sm text-xs font-black uppercase shadow-sm">Sign In</button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-j-text uppercase hover:bg-j-surface-container-low transition-colors">
                    <User size={16} /> My Account
                  </Link>
                )}
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-j-text uppercase hover:bg-j-surface-container-low transition-colors">
                  <ShoppingBag size={16} /> Orders
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-j-text uppercase hover:bg-j-surface-container-low transition-colors">
                  <User size={16} /> Saved Items
                </Link>
              </div>
            </div>
            
            <NotificationInbox />
            
            <button 
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 text-j-text hover:text-jumia-orange transition-colors p-2 rounded-sm font-black text-xs uppercase"
            >
              <div className="relative">
                <ShoppingCart size={24} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-jumia-orange text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">Cart</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
