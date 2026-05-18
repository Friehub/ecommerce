'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  User, 
  HelpCircle, 
  ShoppingCart, 
  ChevronDown,
  ShoppingBag,
  Store,
  PhoneCall,
  TrendingUp,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { NotificationInbox } from './NotificationInbox';
import { api } from '@/trpc/react';
import { useDebounce } from '@/hooks/useDebounce';

export const Navbar = () => {
  const { data: session } = useSession();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(searchQuery.trim(), 300);
  
  const { data: suggestions = [] } = api.catalog.autocomplete.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 && showSuggestions }
  );

  // Fetch categories dynamically from database for trending search bar options
  const { data: dbCategories = [] } = api.catalog.getCategories.useQuery();

  const trendingCategories = React.useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.slice(0, 6).map((c: any) => c.name);
    }
    return ['Phones & Tablets', 'Electronics', 'Home & Office', 'Fashion'];
  }, [dbCategories]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Dynamic routing: if clicked trending item is an active DB category, route to category page directly
    const matchedCat = dbCategories?.find(
      (c: any) => c.name.toLowerCase() === suggestion.toLowerCase()
    );
    if (matchedCat) {
      router.push(`/category/${matchedCat.slug}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    }
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
      {/* Top Bar */}
      <div className="w-full bg-j-surface-container-low border-b border-j-border hidden md:block">
        <div className="max-w-[1184px] mx-auto flex justify-between items-center h-8 px-4">
          <div className="flex items-center gap-6">
            <Link href="/seller" className="flex items-center gap-2 text-[10px] font-black text-jumia-orange uppercase hover:underline">
              <Store size={12} /> Sell on FreshCart
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
        <div className="max-w-[1184px] mx-auto px-4 py-3 flex flex-col gap-3 md:gap-8 md:flex-row md:items-center justify-between">
          
          {/* Row 1: Logo, Hamburger & Actions on Mobile */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              {/* Hamburger Button (Mobile only) */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-j-background rounded-sm text-j-text"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
              
              {/* Brand Logo */}
              <Link href="/" className="text-3xl md:text-4xl font-black text-jumia-orange tracking-tighter flex-shrink-0">
                FreshCart
              </Link>
            </div>

            {/* Mobile Actions (Visible on Mobile only) */}
            <div className="flex items-center gap-1 md:hidden">
              <Link href={session ? "/account" : "/login"} className="p-2 text-j-text hover:text-jumia-orange">
                <User size={24} strokeWidth={1.5} />
              </Link>
              <NotificationInbox />
              <button 
                onClick={() => setCartOpen(true)}
                className="p-2 text-j-text hover:text-jumia-orange relative"
              >
                <ShoppingCart size={24} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-jumia-orange text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar - Full-width on Mobile, Centered on Desktop */}
          <div ref={searchRef} className="w-full md:flex-1 md:max-w-[720px] relative flex">
            <form onSubmit={handleSearch} className="relative flex-1 group flex">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors">
                <Search size={18} strokeWidth={2} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, brands and categories"
                className="w-full pl-10 pr-4 h-10 md:h-11 border border-j-border rounded-l-sm bg-white focus:outline-none focus:border-jumia-orange focus:ring-1 focus:ring-jumia-orange text-xs md:text-sm text-j-text placeholder:text-j-text-muted transition-all"
              />
              <button 
                type="submit"
                className="bg-jumia-orange text-white px-6 md:px-10 h-10 md:h-11 rounded-r-sm text-[11px] md:text-xs font-black hover:bg-jumia-orange-dark transition-colors uppercase shadow-sm active:scale-95 flex-shrink-0"
              >
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-j-border shadow-2xl rounded-sm z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.length > 0 ? (
                  suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs md:text-sm text-j-text hover:bg-j-surface-container-low text-left transition-colors"
                    >
                      <Search size={16} className="text-j-text-muted" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))
                ) : debouncedQuery.length > 0 ? (
                  <button
                    onClick={handleSearch}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs md:text-sm text-j-text hover:bg-j-surface-container-low text-left transition-colors"
                  >
                    <Search size={16} className="text-j-text-muted" />
                    <span className="truncate">Search for "{debouncedQuery}"</span>
                  </button>
                ) : null}
                
                {/* Trending Categories */}
                {debouncedQuery.length === 0 && (
                  <div className="px-2">
                    <div className="px-2 py-1 text-[9px] font-bold text-j-text-muted uppercase tracking-wider">Trending Categories</div>
                    {trendingCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleSuggestionClick(cat)}
                        className="w-full flex items-center gap-3 px-2 py-2 text-xs md:text-sm text-j-text hover:bg-j-surface-container-low text-left transition-colors rounded-sm"
                      >
                        <TrendingUp size={14} className="text-jumia-orange" />
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Actions (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <div 
                className="flex items-center gap-2 text-j-text hover:text-jumia-orange transition-colors p-2 rounded-sm font-black text-xs uppercase cursor-pointer"
              >
                <User size={24} strokeWidth={1.5} />
                <div className="hidden lg:flex flex-col items-start leading-none">
                  <span className="truncate max-w-[100px]">
                    {session?.user?.name ? `Hi, ${session.user.name.split(' ')[0]}` : 'Account'}
                  </span>
                </div>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
              </div>
              
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

      {/* Mobile Drawer Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60"
          />
          
          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85%] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 border-b border-j-border flex justify-between items-center bg-j-background/50">
              <div>
                <h3 className="text-xs font-black uppercase text-j-text-muted">Welcome</h3>
                <p className="text-sm font-black text-j-text uppercase mt-0.5">
                  {session?.user?.name ? `Hi, ${session.user.name.split(' ')[0]}` : 'FreshCart Shopper'}
                </p>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-j-background rounded-sm text-j-text-muted"
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Nav Body */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* Account Actions */}
              {!session ? (
                <div className="px-6 py-2 border-b border-j-border pb-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-jumia-orange text-white py-3 rounded-sm text-xs font-black uppercase shadow-sm">
                      Sign In / Register
                    </button>
                  </Link>
                </div>
              ) : null}

              {/* Navigation Links */}
              <div className="space-y-1 py-4">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-black text-j-text uppercase tracking-wider hover:bg-j-surface-container-low transition-all"
                >
                  <Store size={18} className="text-jumia-orange" />
                  Home
                </Link>
                <Link 
                  href="/account" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-black text-j-text uppercase tracking-wider hover:bg-j-surface-container-low transition-all"
                >
                  <User size={18} className="text-j-text-muted" />
                  My Account
                </Link>
                <Link 
                  href="/account/orders" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-black text-j-text uppercase tracking-wider hover:bg-j-surface-container-low transition-all"
                >
                  <ShoppingBag size={18} className="text-j-text-muted" />
                  My Orders
                </Link>
                <Link 
                  href="/wishlist" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-black text-j-text uppercase tracking-wider hover:bg-j-surface-container-low transition-all"
                >
                  <User size={18} className="text-j-text-muted" />
                  Saved Items
                </Link>
              </div>

              {/* Jumia Categories */}
              <div className="border-t border-j-border pt-4 px-6">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-j-text-muted mb-3">Our Categories</h4>
                <div className="space-y-2">
                  {dbCategories && dbCategories.length > 0 ? (
                    dbCategories.map((c: any) => (
                      <Link
                        key={c.id}
                        href={`/category/${c.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between text-xs font-bold text-j-text-muted hover:text-jumia-orange uppercase py-1.5 transition-colors"
                      >
                        {c.name}
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    ))
                  ) : (
                    ['Electronics', 'Fashion', 'Home & Office', 'Phones'].map((cat) => (
                      <Link
                        key={cat}
                        href={`/search?q=${encodeURIComponent(cat)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between text-xs font-bold text-j-text-muted hover:text-jumia-orange uppercase py-1.5 transition-colors"
                      >
                        {cat}
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Utility Section */}
              <div className="border-t border-j-border mt-6 pt-4 space-y-1">
                <Link 
                  href="/seller" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-black text-jumia-orange uppercase tracking-wider hover:bg-j-surface-container-low transition-all"
                >
                  <Store size={18} />
                  Sell on FreshCart
                </Link>
                <Link 
                  href="/help" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-black text-j-text-muted uppercase tracking-wider hover:bg-j-surface-container-low transition-all"
                >
                  <HelpCircle size={18} />
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
