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
  Bell,
  Star,
  Settings
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { NotificationInbox } from '../../components/layout/NotificationInbox';
import { api } from "../../trpc/react";

export const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestions } = api.catalog.autocomplete.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleSearch = (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const query = overrideQuery || searchQuery;
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="bg-surface sticky top-0 z-50 shadow-soft border-b border-outline-variant">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-8 py-4">
          {/* Mobile: Hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-on-surface hover:text-primary-container p-1 transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl font-black text-on-surface flex items-center shrink-0 tracking-tighter group">
              JUMIA <span className="text-primary-container ml-1 group-hover:rotate-12 transition-transform">★</span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative group">
            <form onSubmit={handleSearch} className="w-full">
              <div className={`flex items-center bg-surface-container-low rounded-2xl px-5 py-1.5 border-2 transition-all w-full ${
                showSuggestions && suggestions && suggestions.length > 0 
                  ? 'border-primary-container ring-4 ring-primary-container/5 rounded-b-none' 
                  : 'border-outline-variant focus-within:border-primary-container'
              }`}>
                <Search size={20} className="text-on-surface-variant mr-3" />
                <input 
                  type="text" 
                  placeholder="Search products, brands and categories" 
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <button 
                  type="submit"
                  className="bg-primary-container text-white font-black text-[10px] tracking-widest px-8 py-2.5 rounded-xl hover:opacity-90 transition-all uppercase shadow-lg shadow-primary-container/20 active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-surface-container-lowest border-2 border-t-0 border-primary-container rounded-b-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="py-2">
                  {suggestions.map((suggestion: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(undefined, suggestion)}
                      className="w-full text-left px-6 py-3.5 hover:bg-surface-container-low transition-colors flex items-center gap-4 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
                        <Search size={14} className="text-on-surface-variant group-hover:text-primary-container" />
                      </div>
                      <span className="text-sm font-black text-on-surface uppercase tracking-tight">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden lg:block relative">
              <button 
                onMouseEnter={() => setShowAccountMenu(true)}
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 text-on-surface hover:text-primary-container transition-all group py-2"
              >
                <div className="w-10 h-10 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant group-hover:border-primary-container transition-colors shadow-sm">
                  <User size={20} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Account</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black uppercase tracking-tighter max-w-[100px] truncate">
                      {session ? (session.user?.name || session.user?.email?.split('@')[0]) : 'Sign In'}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showAccountMenu ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {showAccountMenu && (
                <div 
                  onMouseLeave={() => setShowAccountMenu(false)}
                  className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest border-2 border-outline-variant rounded-[32px] shadow-2xl py-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  {session ? (
                    <div className="flex flex-col">
                      <div className="px-6 py-4 border-b border-outline-variant mb-2">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Authenticated As</p>
                        <p className="text-sm font-black text-on-surface truncate">{session.user?.email}</p>
                      </div>
                      <Link href="/account" className="flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-on-surface hover:bg-surface-container-low transition-all">
                        <User size={18} className="text-primary-container" /> My Profile
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-on-surface hover:bg-surface-container-low transition-all">
                        <Package size={18} className="text-primary-container" /> Order History
                      </Link>
                      <Link href="/wishlist" className="flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-on-surface hover:bg-surface-container-low transition-all">
                        <Heart size={18} className="text-primary-container" /> Saved Items
                      </Link>
                      <div className="border-t border-outline-variant my-2 mx-4"></div>
                      <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-error hover:bg-error/5 transition-all"
                      >
                        <LogOut size={18} /> Logout Session
                      </button>
                    </div>
                  ) : (
                    <div className="p-6">
                      <Link 
                        href="/login" 
                        className="block w-full bg-primary-container text-white text-center py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 transition-all"
                      >
                        Sign In Now
                      </Link>
                      <p className="text-[9px] text-center mt-4 text-on-surface-variant font-black uppercase tracking-widest">New Customer? <Link href="/register" className="text-primary-container hover:underline">Join Us</Link></p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button className="hidden lg:flex items-center gap-2 text-on-surface hover:text-primary-container transition-all group">
               <div className="w-10 h-10 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant group-hover:border-primary-container transition-colors shadow-sm">
                <HelpCircle size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Help</span>
            </button>

            <div className="hidden sm:block">
              <NotificationInbox />
            </div>

            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-on-surface hover:text-primary-container transition-all relative group"
            >
              <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-container/20 group-hover:scale-105 transition-all relative">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-surface font-black">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cart</span>
                <span className="text-sm font-black uppercase tracking-tighter">My Items</span>
              </div>
            </button>
          </div>
        </div>

        {/* Sub-Nav */}
        <nav className="flex items-center gap-10 py-3 overflow-x-auto whitespace-nowrap hide-scrollbar border-t border-outline-variant/30">
          {[
            { label: 'Flash Sales', href: '/flash-sales' },
            { label: 'Official Stores', href: '/official-stores' },
            { label: 'Jumia Global', href: '/jumia-global' },
            { label: 'Best Sellers', href: '/best-sellers' },
            { label: 'Sell on Jumia', href: '/seller/login' }
          ].map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-2 group"
            >
              {link.label}
              <div className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-surface-container-lowest h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-500 rounded-r-[32px] overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface">
              <span className="text-2xl font-black text-on-surface tracking-tighter">
                JUMIA<span className="text-primary-container">★</span>
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:text-error transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              <div className="px-6 mb-8">
                {session ? (
                  <div className="flex items-center gap-4 p-5 bg-surface-container-low rounded-3xl border border-outline-variant shadow-sm">
                    <div className="w-14 h-14 bg-primary-container text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary-container/20">
                      {session.user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-on-surface uppercase tracking-tight">Hi, {session.user?.name || session.user?.email?.split('@')[0]}</p>
                      <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mt-0.5 bg-surface-container px-2 py-0.5 rounded-lg border border-outline-variant inline-block">Premium Account</p>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-primary-container text-white text-center py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-container/20 active:scale-[0.98] transition-all"
                  >
                    Login / Register
                  </Link>
                )}
              </div>

              <div className="space-y-2">
                <p className="px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4">Navigation</p>
                {[
                  { icon: User, label: 'My Profile', href: '/account' },
                  { icon: Package, label: 'Order History', href: '/account/orders' },
                  { icon: Heart, label: 'Saved Items', href: '/wishlist' },
                  { icon: Bell, label: 'Notifications', href: '/notifications' },
                  { icon: Star, label: 'Flash Sales', href: '/flash-sales' },
                  { icon: HelpCircle, label: 'Support Center', href: '/help' },
                  { icon: Settings, label: 'Settings', href: '/account/settings' }
                ].map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex items-center gap-5 px-8 py-4 text-on-surface hover:bg-surface-container-low transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
                      <item.icon size={20} className="text-on-surface-variant group-hover:text-primary-container transition-colors" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {session && (
              <div className="p-6 border-t border-outline-variant bg-surface-container-low">
                <button 
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 py-4 text-error font-black text-xs uppercase tracking-widest bg-error-container/10 rounded-2xl hover:bg-error-container/20 transition-all border border-error/10"
                >
                  <LogOut size={18} /> Terminate Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


