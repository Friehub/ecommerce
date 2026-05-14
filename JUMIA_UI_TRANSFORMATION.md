# Jumia UI Transformation Guide

## The Problem in Plain Terms

The current UI looks like a sci-fi design system — `font-black uppercase tracking-widest` everywhere, labels like "Identity Node", "Terminate Session", "Geospatial Vector", rounded-[40px] cards with heavy borders. Jumia's actual design is the opposite: clean white backgrounds, a plain orange navbar, tight 4px border-radius cards, normal human language, and Inter/system fonts at readable sizes.

This document gives you exact code replacements for every key component.

---

## Step 0 — Tailwind Config Changes

Replace `apps/web/tailwind.config.js` entirely:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Jumia brand
        'jumia-orange':  '#f68b1e',
        'jumia-orange-dark': '#e07b0e',
        'jumia-blue':    '#1a4490',   // "Sell on Jumia" button, links
        // Neutrals — exactly Jumia's palette
        'j-white':       '#ffffff',
        'j-bg':          '#f5f5f5',   // page background
        'j-border':      '#e0e0e0',
        'j-text':        '#212121',   // primary text
        'j-text-muted':  '#757575',   // secondary text
        'j-text-light':  '#9e9e9e',
        'j-red':         '#c8232c',   // sale badges, errors
        'j-green':       '#00a650',   // in stock, success
        'j-star':        '#f68b1e',   // rating stars
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 2px 8px 0 rgba(0,0,0,0.15)',
        'nav': '0 2px 4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'jumia': '4px',
      },
    },
  },
  plugins: [],
}
```

---

## Step 1 — globals.css

```css
/* apps/web/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: #f5f5f5;
    color: #212121;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
}
```

---

## Step 2 — layout.tsx (swap font)

```tsx
// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/cart/CartDrawer";
import { ReferralTracker } from "../components/affiliate/ReferralTracker";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Jumia Nigeria | Online Shopping for Electronics, Fashion & More",
  description: "Shop Jumia Nigeria. Best prices on phones, fashion, electronics and more. Fast delivery across Nigeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-j-bg text-j-text min-h-screen flex flex-col">
        <Providers>
          <ReferralTracker />
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

---

## Step 3 — Navbar (full replacement)

This is the biggest visual change. Jumia's navbar is a 3-row structure:
- **Row 1 (orange):** Logo + search bar + account/cart icons
- **Row 2 (white/light gray):** Category mega-menu trigger + promo links
- **Row 3 (optional):** Breadcrumb or promo banner

```tsx
// apps/web/src/components/layout/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Search, ChevronDown, Menu, X, Bell, Heart, Package, LogOut, HelpCircle, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { NotificationInbox } from './NotificationInbox';
import { api } from '../../trpc/react';

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
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: suggestions } = api.catalog.autocomplete.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleSearch = (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const q = override || searchQuery;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-[100] shadow-nav">
      {/* ── Row 1: Orange bar ── */}
      <div className="bg-jumia-orange">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-white font-bold text-2xl tracking-tight">Jumia</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search products, brands and categories"
                className="flex-1 h-10 px-4 text-sm text-j-text bg-white border-none outline-none rounded-l"
              />
              <button
                type="submit"
                className="h-10 px-5 bg-jumia-orange-dark hover:bg-orange-700 text-white rounded-r flex items-center gap-2 transition-colors border-l border-orange-600"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Autocomplete */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-j-border rounded shadow-card-hover z-50">
                {suggestions.map((s: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(undefined, s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-j-text hover:bg-j-bg flex items-center gap-3 border-b border-j-border last:border-0"
                  >
                    <Search size={14} className="text-j-text-muted flex-shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Account */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                onMouseEnter={() => setShowAccountMenu(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-jumia-orange-dark rounded transition-colors min-w-[100px]"
              >
                <User size={20} />
                <div className="hidden sm:block text-left">
                  <div className="text-[10px] leading-none opacity-80">Account</div>
                  <div className="text-xs font-semibold leading-none flex items-center gap-1 mt-0.5">
                    {session ? (session.user?.name?.split(' ')[0] || 'My Account') : 'Sign In'}
                    <ChevronDown size={12} />
                  </div>
                </div>
              </button>

              {showAccountMenu && (
                <div
                  onMouseLeave={() => setShowAccountMenu(false)}
                  className="absolute top-full right-0 w-56 bg-white border border-j-border rounded shadow-card-hover z-50 py-1"
                >
                  {session ? (
                    <>
                      <div className="px-4 py-3 border-b border-j-border">
                        <p className="text-xs text-j-text-muted">Signed in as</p>
                        <p className="text-sm font-medium text-j-text truncate">{session.user?.email}</p>
                      </div>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-j-text hover:bg-j-bg"><User size={16} className="text-j-text-muted" /> My Account</Link>
                      <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-j-text hover:bg-j-bg"><Package size={16} className="text-j-text-muted" /> My Orders</Link>
                      <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-j-text hover:bg-j-bg"><Heart size={16} className="text-j-text-muted" /> Wishlist</Link>
                      <div className="border-t border-j-border my-1" />
                      <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-j-text hover:bg-j-bg w-full text-left"><LogOut size={16} className="text-j-text-muted" /> Sign Out</button>
                    </>
                  ) : (
                    <div className="p-4 space-y-2">
                      <Link href="/login" className="block w-full text-center py-2 bg-jumia-orange text-white text-sm font-semibold rounded hover:bg-jumia-orange-dark transition-colors">Sign In</Link>
                      <p className="text-xs text-center text-j-text-muted">New customer? <Link href="/register" className="text-jumia-blue hover:underline">Register</Link></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Help */}
            <Link href="/help" className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-jumia-orange-dark rounded transition-colors hidden md:flex">
              <HelpCircle size={20} />
              <div className="hidden lg:block text-left">
                <div className="text-[10px] leading-none opacity-80">Help</div>
                <div className="text-xs font-semibold leading-none mt-0.5">Centre</div>
              </div>
            </Link>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationInbox />
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-jumia-orange-dark rounded transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-j-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[10px] leading-none opacity-80">Cart</div>
                <div className="text-xs font-semibold leading-none mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: White sub-nav ── */}
      <div className="bg-white border-b border-j-border">
        <div className="max-w-[1280px] mx-auto px-4">
          <nav className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {[
              { label: '⚡ Flash Sales', href: '/flash-sales' },
              { label: 'Official Stores', href: '/official-stores' },
              { label: 'Jumia Global', href: '/jumia-global' },
              { label: 'Best Sellers', href: '/best-sellers' },
              { label: 'Phones & Tablets', href: '/category/phones-tablets' },
              { label: 'Electronics', href: '/category/electronics' },
              { label: 'Fashion', href: '/category/fashion' },
              { label: 'Computing', href: '/category/computing' },
              { label: 'Home & Office', href: '/category/home-office' },
              { label: 'Sell on Jumia', href: '/seller/register' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap px-3 py-3 text-xs font-medium text-j-text hover:text-jumia-orange hover:bg-j-bg transition-colors border-b-2 border-transparent hover:border-jumia-orange"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-xl">
            <div className="p-4 bg-jumia-orange flex items-center justify-between">
              <span className="text-white font-bold text-xl">Jumia</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {session ? (
                <div className="p-4 bg-j-bg border-b border-j-border">
                  <p className="text-sm font-semibold text-j-text">{session.user?.name || session.user?.email}</p>
                  <p className="text-xs text-j-text-muted">{session.user?.email}</p>
                </div>
              ) : (
                <div className="p-4 border-b border-j-border">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2 bg-jumia-orange text-white text-sm font-semibold rounded">Sign In</Link>
                </div>
              )}
              {[
                { label: 'My Account', href: '/account', icon: User },
                { label: 'My Orders', href: '/account/orders', icon: Package },
                { label: 'Wishlist', href: '/wishlist', icon: Heart },
                { label: 'Flash Sales', href: '/flash-sales' },
                { label: 'Help Centre', href: '/help', icon: HelpCircle },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-j-text hover:bg-j-bg border-b border-j-border">
                  {item.icon && <item.icon size={18} className="text-j-text-muted" />}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
```

---

## Step 4 — ProductCard (full replacement)

```tsx
// apps/web/src/components/ui/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const primaryVariant = product.variants?.[0];
  const price = Number(product.price ?? primaryVariant?.price ?? 0);
  const comparePrice = product.comparePrice
    ? Number(product.comparePrice)
    : primaryVariant?.comparePrice
    ? Number(primaryVariant.comparePrice)
    : undefined;
  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;
  const inventory = primaryVariant?.inventory ?? product.inventory ?? 0;
  const rating = Number(product.averageRating || 0);
  const imageUrl = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex flex-col bg-white border border-j-border rounded hover:shadow-card-hover transition-shadow group overflow-hidden"
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-white p-4">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          priority={false}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isExpress && (
            <span className="bg-jumia-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded">EXPRESS</span>
          )}
          {product.isOfficial && (
            <span className="bg-jumia-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded">OFFICIAL</span>
          )}
        </div>

        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-j-red text-white text-xs font-bold px-1.5 py-0.5 rounded z-10">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-sm text-j-text line-clamp-2 mb-2 leading-snug min-h-[40px]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mb-1">
          <span className="text-base font-bold text-j-text">
            ₦{price.toLocaleString()}
          </span>
          {comparePrice && comparePrice > price && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-j-text-muted line-through">₦{comparePrice.toLocaleString()}</span>
              <span className="text-xs text-j-red font-medium">{discount}% off</span>
            </div>
          )}
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  size={11}
                  className={i <= Math.round(rating) ? 'fill-j-star text-j-star' : 'fill-j-border text-j-border'}
                />
              ))}
            </div>
            <span className="text-[11px] text-j-text-muted">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Delivery / stock hint */}
        <div className="mt-auto pt-2">
          {inventory === 0 ? (
            <span className="text-xs text-j-red">Out of Stock</span>
          ) : (
            <span className="text-xs text-j-green font-medium">✓ In Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};
```

---

## Step 5 — Footer (replacement)

```tsx
// apps/web/src/components/layout/Footer.tsx
import Link from 'next/link';

export const Footer = () => (
  <footer className="bg-j-text text-white mt-8">
    {/* Top payment/trust bar */}
    <div className="bg-[#1a1a1a] py-4 border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 flex flex-wrap gap-6 justify-center items-center text-xs text-white/60">
        <span>100% Secure Payments</span>
        <span>·</span>
        <span>Easy Returns</span>
        <span>·</span>
        <span>Delivery Nationwide</span>
        <span>·</span>
        <span>24/7 Customer Support</span>
      </div>
    </div>

    <div className="max-w-[1280px] mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div>
          <h4 className="font-semibold text-sm mb-4 text-white">ABOUT JUMIA</h4>
          <ul className="space-y-2">
            {['About Us', 'Jumia Blog', 'Careers', 'Press', 'Terms & Conditions', 'Privacy Policy'].map(l => (
              <li key={l}><Link href="#" className="text-xs text-white/60 hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4 text-white">MAKE MONEY WITH JUMIA</h4>
          <ul className="space-y-2">
            {['Sell on Jumia', 'Vendor Hub', 'JForce', 'Affiliate Program', 'Advertise'].map(l => (
              <li key={l}><Link href="#" className="text-xs text-white/60 hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4 text-white">HELP</h4>
          <ul className="space-y-2">
            {['Help Centre', 'Track My Order', 'How to Buy', 'Corporate Purchases', 'Report a Product'].map(l => (
              <li key={l}><Link href="#" className="text-xs text-white/60 hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4 text-white">JUMIA INTERNATIONAL</h4>
          <ul className="space-y-2">
            {['Jumia Kenya', 'Jumia Ghana', 'Jumia Egypt', 'Jumia Côte d\'Ivoire', 'Jumia Maroc'].map(l => (
              <li key={l}><Link href="#" className="text-xs text-white/60 hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Jumia Nigeria. All rights reserved.</p>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>Payment methods:</span>
          <span className="bg-white/10 px-2 py-1 rounded text-white/60">Paystack</span>
          <span className="bg-white/10 px-2 py-1 rounded text-white/60">Card</span>
          <span className="bg-white/10 px-2 py-1 rounded text-white/60">Wallet</span>
        </div>
      </div>
    </div>
  </footer>
);
```

---

## Step 6 — Language / Copy Changes

Every piece of copy in the app that uses the sci-fi "node/vector/telemetry" vocabulary needs to be replaced. These are all in the component files. Find and replace these strings globally in `apps/web/src/`:

| Current (wrong) | Replace with |
|---|---|
| `Terminate Session` | `Sign Out` |
| `Establish Session` | `Sign In` |
| `Inventory History` | `My Orders` |
| `Cached Items` | `Wishlist` |
| `Profile Node` | `My Account` |
| `Node Settings` | `Settings` |
| `Identity Node` / `Identity` | `Account` |
| `Geospatial Vector` | `Street Address` |
| `Communication Protocol` | `Phone Number` |
| `Control Matrix` | (remove the label) |
| `Active Principal` | `Signed in as` |
| `Initialize Consumer Node` | `Create your account` |
| `Legal First Name` | `First Name` |
| `Legal Last Name` | `Last Name` |
| `QUERY PRODUCTS, BRANDS OR GLOBAL NODES` | `Search products, brands and categories` |
| `QUERY` (search button) | `Search` |
| `Flash Events` | `Flash Sales` |
| `Support Array` | `Help` |
| `Telemetry` | `Notifications` |
| `NOMINAL` (stock) | `In Stock` |
| `CRITICAL (n)` (stock) | `Only n left` |
| `VOID` (out of stock) | `Out of Stock` |
| `ASSET SECURED` (image upload) | `Image uploaded` |
| `PRODUCT MATERIALIZED` | `Product created` |
| `Empower Your Brand` | `Sell on Jumia` |

Run this as a one-liner to find all occurrences:
```bash
grep -rn "Terminate Session\|Establish Session\|Inventory History\|Cached Items\|Profile Node\|Node Settings\|Geospatial\|Consumer Node\|Active Principal\|Control Matrix\|NOMINAL\|VOID\|CRITICAL" apps/web/src/ | grep -v node_modules
```

---

## Step 7 — Quick Wins (border-radius & spacing)

The current design uses `rounded-[40px]` and `rounded-[32px]` everywhere. Jumia uses 4px. Do a global find-replace:

```bash
# In apps/web/src/
# Replace these class names globally:
rounded-\[40px\]   →  rounded
rounded-\[32px\]   →  rounded
rounded-\[28px\]   →  rounded
rounded-\[24px\]   →  rounded
rounded-\[20px\]   →  rounded-sm
border-4           →  border (most places; keep border-4 only for focus rings)
```

---

## Step 8 — Category Sidebar (homepage)

Jumia's category sidebar is plain white with left-border-on-hover. Replace `CategorySidebar.tsx`:

```tsx
// apps/web/src/components/home/CategorySidebar.tsx
'use client';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ChevronRight } from 'lucide-react';

export const CategorySidebar = () => {
  const { data: categories } = api.catalog.getCategories.useQuery();

  return (
    <div className="bg-white border border-j-border rounded overflow-hidden">
      <div className="px-4 py-3 bg-jumia-orange">
        <h2 className="text-white text-sm font-semibold">All Categories</h2>
      </div>
      <ul>
        {(categories || []).map((cat: any) => (
          <li key={cat.id} className="border-b border-j-border last:border-0">
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-j-text hover:bg-j-bg hover:text-jumia-orange hover:border-l-2 hover:border-jumia-orange transition-all group"
            >
              <div className="flex items-center gap-2">
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt={cat.name} className="w-5 h-5 object-contain" />
                )}
                {cat.name}
              </div>
              <ChevronRight size={14} className="text-j-text-muted group-hover:text-jumia-orange" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Step 9 — Buttons system-wide

Replace the current `bg-on-surface` pattern buttons with the Jumia standard:

```tsx
// Primary CTA (Add to Cart, Checkout, etc.)
className="w-full py-3 bg-jumia-orange hover:bg-jumia-orange-dark text-white text-sm font-semibold rounded transition-colors"

// Secondary (Cancel, Back)
className="px-4 py-2 border border-j-border text-j-text text-sm rounded hover:bg-j-bg transition-colors"

// Danger (Remove, Delete)
className="px-4 py-2 text-j-red border border-j-red text-sm rounded hover:bg-red-50 transition-colors"

// Outlined orange (Sell on Jumia, etc.)
className="px-4 py-2 border border-jumia-orange text-jumia-orange text-sm rounded hover:bg-orange-50 transition-colors"
```

---

## After These Changes: What Will Look Jumia-Like

| Element | Before | After |
|---|---|---|
| Navbar | White background, huge rounded boxes | Orange top bar + white sub-nav |
| Search | `QUERY PRODUCTS...` uppercase giant pill | Clean white input bar in orange header |
| Product cards | 40px rounded, heavy borders, sci-fi labels | Plain white 4px rounded, standard labels |
| Font weight | `font-black` everywhere | Regular/medium body, semibold headings |
| Language | "Terminate Session", "Node", "Vector" | "Sign Out", "Account", "Address" |
| Font | Urbanist | Inter (matches Jumia's system font) |
| Background | Warm white (#fff8f5) | Light gray (#f5f5f5) — exactly Jumia's page bg |
| Badges | "NOMINAL", "VOID", "CRITICAL" | "In Stock", "Out of Stock", "Only 2 left" |
| Footer | Warm tone, orange blur effects | Dark footer (#212121), exactly like Jumia |
| Border radius | 24–40px everywhere | 4px throughout |

---

## Priority Order

If you're short on time, do these in order — each gives the most visual impact:

1. **Navbar** (Step 3) — biggest visible change, immediately recognisable as Jumia
2. **Tailwind config + globals.css** (Step 0 + 1) — fixes background color and font
3. **ProductCard** (Step 4) — the most repeated element on every page
4. **Language copy** (Step 6) — fast find-replace, massive feel change
5. **Border radius** (Step 7) — one grep-replace, affects every component
6. **Footer** (Step 5) — dark footer seals the Jumia look
7. **CategorySidebar** (Step 8) — homepage hero area
8. **Buttons** (Step 9) — consistency throughout
