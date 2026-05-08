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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - Content matches Jumia Desktop but shifts on Mobile */}
      <div className="container mx-auto px-4">
        <div className="h-16 md:h-[72px] flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-700 hover:text-[#F68B1E] transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                JUMIA<span className="text-[#F68B1E]">★</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[600px] relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search products, brands and categories" 
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-md pl-11 pr-4 focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all"
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

          {/* Desktop/Mobile Actions */}
          <nav className="flex items-center gap-3 md:gap-6">
            {/* Desktop Account Menu */}
            <div className="hidden md:block relative">
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 text-gray-700 hover:text-[#F68B1E] font-medium py-2"
              >
                <User size={24} />
                <span className="hidden lg:inline">{session ? `Hi, ${session.user?.email?.split('@')[0]}` : 'Account'}</span>
                <ChevronDown size={16} className={`transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAccountMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border rounded-lg shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                  {session ? (
                    <>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F68B1E]">
                        <User size={18} /> My Account
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F68B1E]">
                        <Package size={18} /> Orders
                      </Link>
                      <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F68B1E]">
                        <Heart size={18} /> Saved Items
                      </Link>
                      <div className="border-t my-1"></div>
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                      >
                        <LogOut size={18} /> Logout
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
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-[#F68B1E] font-medium">
              <HelpCircle size={24} />
              <span className="hidden lg:inline">Help</span>
            </button>

            <div className="hidden sm:block">
              <NotificationInbox />
            </div>

            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-[#F68B1E] font-medium relative"
            >
              <ShoppingCart size={24} />
              <span className="hidden md:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F68B1E] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Mobile Search Row - visible only on sm/md */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search products, brands, categories" 
              className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:border-[#F68B1E]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
      
      {/* Desktop Sub-Navbar - categories */}
      <div className="bg-white border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4 h-10 flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/flash-sales" className="hover:text-[#F68B1E]">FLASH SALES</Link>
          <Link href="/official-stores" className="hover:text-[#F68B1E]">OFFICIAL STORES</Link>
          <Link href="/jumia-global" className="hover:text-[#F68B1E]">JUMIA GLOBAL</Link>
          <Link href="/best-sellers" className="hover:text-[#F68B1E]">BEST SELLERS</Link>
        </div>
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

