'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  ShoppingCart, 
  User, 
  Search, 
  HelpCircle, 
  LogOut, 
  Package, 
  Heart, 
  ChevronDown, 
  Menu, 
  X,
  Bell
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { NotificationInbox } from '../../components/layout/NotificationInbox';

export const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-surface sticky top-0 z-50 shadow-sm border-b border-outline-variant">
      <div className="container py-base">
        <div className="flex items-center justify-between gap-gutter py-2">
          {/* Mobile: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-on-surface hover:text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl font-black text-primary flex items-center shrink-0">
              JUMIA <span className="text-primary-container ml-1">★</span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="flex items-center bg-surface-container-low rounded-lg px-4 py-2 border border-outline-variant focus-within:border-primary-container transition-all w-full">
              <Search size={20} className="text-on-surface-variant mr-2" />
              <input 
                type="text" 
                placeholder="Search products, brands and categories" 
                className="bg-transparent border-none focus:ring-0 w-full text-body-md text-on-surface"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-primary-container text-on-primary font-bold px-6 py-1.5 rounded-lg hover:opacity-90 transition-all scale-95 active:opacity-80"
              >
                SEARCH
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block relative">
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-1 text-on-surface hover:text-primary transition-colors group"
              >
                <User size={24} />
                <span className="text-label-sm font-medium">
                  {session ? `Hi, ${session.user?.email?.split('@')[0]}` : 'Account'}
                </span>
                <ChevronDown size={18} className={`transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAccountMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                  {session ? (
                    <>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors">
                        <User size={18} /> My Account
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors">
                        <Package size={18} /> Orders
                      </Link>
                      <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors">
                        <Heart size={18} /> Saved Items
                      </Link>
                      <div className="border-t border-outline-variant my-1"></div>
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error font-bold hover:bg-error/5"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="p-4">
                      <Link 
                        href="/login" 
                        className="block w-full bg-primary-container text-on-primary text-center py-3 rounded-lg font-bold text-sm uppercase hover:opacity-90 transition-all"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button className="hidden md:flex items-center gap-1 text-on-surface hover:text-primary transition-colors">
              <HelpCircle size={24} />
              <span className="text-label-sm font-medium">Help</span>
            </button>

            <div className="hidden sm:block">
              <NotificationInbox />
            </div>

            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors relative group"
            >
              <ShoppingCart size={24} />
              <span className="hidden md:inline text-label-sm font-medium">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-container text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Nav / Mobile Search */}
        <nav className="flex items-center gap-8 pt-2 pb-1 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link href="/flash-sales" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm">FLASH SALES</Link>
          <Link href="/official-stores" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm">OFFICIAL STORES</Link>
          <Link href="/jumia-global" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm">JUMIA GLOBAL</Link>
          <Link href="/best-sellers" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-label-sm">BEST SELLERS</Link>
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">
                JUMIA<span className="text-[#F68B1E]">★</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 bg-gray-50 border-b">
                {session ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F68B1E] text-white rounded-full flex items-center justify-center font-bold">
                      {session.user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Hi, {session.user?.email?.split('@')[0]}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Premium Member</p>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-[#F68B1E] text-white text-center py-2.5 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20"
                  >
                    Login / Register
                  </Link>
                )}
              </div>

              <div className="py-4">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">My Profile</p>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-orange-50 font-bold text-sm">
                  <User size={20} className="text-[#F68B1E]" /> My Account
                </Link>
                <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-orange-50 font-bold text-sm">
                  <Package size={20} className="text-[#F68B1E]" /> Orders
                </Link>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-orange-50 font-bold text-sm">
                  <Heart size={20} className="text-[#F68B1E]" /> Saved Items
                </Link>
                <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-orange-50 font-bold text-sm">
                  <Bell size={20} className="text-[#F68B1E]" /> Notifications
                </Link>
              </div>

              <div className="border-t pt-4">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Categories</p>
                <Link href="/flash-sales" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-bold text-sm uppercase">Flash Sales</Link>
                <Link href="/official-stores" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-bold text-sm uppercase">Official Stores</Link>
                <Link href="/jumia-global" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-bold text-sm uppercase">Jumia Global</Link>
              </div>
            </div>

            {session && (
              <div className="p-4 border-t">
                <button 
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-black text-xs uppercase tracking-widest bg-red-50 rounded-lg"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

