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
 Settings,
 Activity,
 ShieldCheck,
 Zap
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
 <header className="bg-background sticky top-0 z-[100] border-b-4 border-surface-container-low select-none">
 <div className="container mx-auto px-6 lg:px-12">
 <div className="flex items-center justify-between gap-12 py-6">
 {/* Mobile: Hamburger & Logo */}
 <div className="flex items-center gap-6">
 <button 
 onClick={() => setMobileMenuOpen(true)}
 className="lg:hidden text-on-surface hover:text-primary-container p-2 transition-all active:scale-90"
 >
 <Menu size={28} />
 </button>
 <Link href="/" className="text-3xl font-black text-on-surface flex items-center shrink-0 tracking-tighter group">
 JUMIA<span className="text-primary-container ml-1 group-hover:rotate-12 transition-transform">★</span>
 </Link>
 </div>

 {/* Desktop Search Bar */}
 <div className="hidden lg:flex flex-1 max-w-3xl relative group">
 <form onSubmit={handleSearch} className="w-full">
 <div className={`flex items-center bg-surface-container-low/30 rounded-[28px] px-8 py-2 border-4 transition-all w-full shadow-inner ${
 showSuggestions && suggestions && suggestions.length > 0 
 ? 'border-primary-container shadow-[0_0_30px_rgba(var(--primary-container),0.1)]' 
 : 'border-surface-container-low focus-within:border-primary-container'
 }`}>
 <Search size={22} className="text-on-surface-variant/40 mr-4" />
 <input 
 type="text" 
 placeholder="QUERY PRODUCTS, BRANDS OR GLOBAL NODES..." 
 className="bg-transparent border-none focus:ring-0 w-full text-[11px] font-black uppercase tracking-widest text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 h-12 outline-none"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onFocus={() => setShowSuggestions(true)}
 onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
 />
 <button 
 type="submit"
 className="bg-on-surface text-white font-black text-[10px] tracking-[0.3em] px-10 h-12 rounded-2xl hover:bg-primary-container transition-all uppercase shadow-2xl active:scale-95"
 >
 QUERY
 </button>
 </div>
 </form>

 {/* Autocomplete Dropdown */}
 {showSuggestions && suggestions && suggestions.length > 0 && (
 <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-surface-container-lowest border-4 border-primary-container rounded-[32px] shadow-soft z-[110] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
 <div className="py-4">
 {suggestions.map((suggestion: string, idx: number) => (
 <button
 key={idx}
 onClick={() => handleSearch(undefined, suggestion)}
 className="w-full text-left px-8 py-5 hover:bg-surface-container-low transition-all flex items-center gap-6 group"
 >
 <div className="w-10 h-10 rounded-[14px] bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
 <Search size={16} className="text-on-surface-variant group-hover:text-primary-container" />
 </div>
 <span className="text-[11px] font-black text-on-surface uppercase tracking-widest">{suggestion}</span>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Actions */}
 <div className="flex items-center gap-6 lg:gap-10">
 <div className="hidden lg:block relative">
 <button 
 onMouseEnter={() => setShowAccountMenu(true)}
 onClick={() => setShowAccountMenu(!showAccountMenu)}
 className="flex items-center gap-4 text-on-surface hover:text-primary-container transition-all group py-2"
 >
 <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center border-2 border-surface-container-low group-hover:border-primary-container/40 transition-all shadow-inner relative overflow-hidden">
 <User size={24} className="group-hover:scale-110 transition-transform relative z-10" />
 <div className="absolute inset-0 bg-primary-container opacity-0 group-hover:opacity-5 transition-opacity" />
 </div>
 <div className="flex flex-col items-start leading-none gap-2">
 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 italic">Identity</span>
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-black uppercase tracking-tighter max-w-[120px] truncate">
 {session ? (session.user?.name || session.user?.email?.split('@')[0]) : 'Guest Node'}
 </span>
 <ChevronDown size={14} className={`transition-transform duration-500 opacity-20 ${showAccountMenu ? 'rotate-180' : ''}`} />
 </div>
 </div>
 </button>

 {showAccountMenu && (
 <div 
 onMouseLeave={() => setShowAccountMenu(false)}
 className="absolute top-[calc(100%+8px)] right-0 w-80 bg-surface-container-lowest border-4 border-surface-container-low rounded-[40px] shadow-soft py-6 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500"
 >
 {session ? (
 <div className="flex flex-col">
 <div className="px-8 py-6 border-b-2 border-surface-container-low mb-4 bg-surface-container-low/20">
 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-2 italic">Active Principal</p>
 <p className="text-[11px] font-black text-on-surface truncate tracking-tight">{session.user?.email?.toUpperCase()}</p>
 </div>
 <Link href="/account" className="flex items-center gap-6 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface hover:bg-surface-container-low transition-all">
 <User size={20} className="text-primary-container" /> Profile Node
 </Link>
 <Link href="/account/orders" className="flex items-center gap-6 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface hover:bg-surface-container-low transition-all">
 <Package size={20} className="text-primary-container" /> Inventory History
 </Link>
 <Link href="/wishlist" className="flex items-center gap-6 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface hover:bg-surface-container-low transition-all">
 <Heart size={20} className="text-primary-container" /> Cached Items
 </Link>
 <div className="h-1 bg-surface-container-low mx-8 my-4 rounded-full opacity-50"></div>
 <button 
 onClick={() => signOut()}
 className="flex items-center gap-6 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-error hover:bg-error/5 transition-all"
 >
 <LogOut size={20} /> Terminate Session
 </button>
 </div>
 ) : (
 <div className="p-8">
 <Link 
 href="/login" 
 className="h-20 bg-on-surface text-white flex items-center justify-center rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-container transition-all active:scale-95"
 >
 Establish Session
 </Link>
 <p className="text-[9px] text-center mt-6 text-on-surface-variant/40 font-black uppercase tracking-[0.4em] italic">New Node? <Link href="/register" className="text-primary-container hover:underline">Register Entry</Link></p>
 </div>
 )}
 </div>
 )}
 </div>
 
 <button className="hidden lg:flex items-center gap-4 text-on-surface hover:text-primary-container transition-all group">
 <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center border-2 border-surface-container-low group-hover:border-primary-container/40 transition-all shadow-inner">
 <HelpCircle size={24} className="group-hover:scale-110 transition-transform" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 group-hover:text-on-surface italic">Support</span>
 </button>

 <div className="hidden sm:block">
 <NotificationInbox />
 </div>

 <button 
 onClick={() => setIsOpen(true)}
 className="flex items-center gap-4 text-on-surface hover:text-primary-container transition-all relative group"
 >
 <div className="w-16 h-16 bg-on-surface text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-primary-container group-hover:scale-105 transition-all relative overflow-hidden">
 <ShoppingCart size={28} className="relative z-10" />
 <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
 {totalItems > 0 && (
 <span className="absolute top-2 right-2 bg-error text-white text-[9px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-on-surface font-black shadow-lg">
 {totalItems}
 </span>
 )}
 </div>
 <div className="hidden lg:flex flex-col items-start leading-none gap-2">
 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 italic">Magnitude</span>
 <span className="text-[11px] font-black uppercase tracking-tighter">Inventory</span>
 </div>
 </button>
 </div>
 </div>

 {/* Sub-Nav */}
 <nav className="flex items-center gap-12 py-4 overflow-x-auto whitespace-nowrap no-scrollbar border-t-2 border-surface-container-low/50">
 {[
 { label: 'Flash Sales', href: '/flash-sales', icon: Zap },
 { label: 'Official Stores', href: '/official-stores', icon: ShieldCheck },
 { label: 'Jumia Global', href: '/jumia-global', icon: Activity },
 { label: 'Best Sellers', href: '/best-sellers', icon: Star },
 { label: 'Sell on Jumia', href: '/seller/login', icon: Gavel }
 ].map((link) => (
 <Link 
 key={link.href} 
 href={link.href} 
 className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/60 hover:text-primary-container transition-all flex items-center gap-3 group relative py-2"
 >
 <link.icon size={14} className="opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
 {link.label}
 <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-container opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all rounded-full" />
 </Link>
 ))}
 </nav>
 </div>

 {/* Mobile Drawer Overlay */}
 {mobileMenuOpen && (
 <div className="fixed inset-0 z-[200] flex">
 <div 
 className="fixed inset-0 bg-on-surface/80 backdrop-blur-md transition-opacity duration-700" 
 onClick={() => setMobileMenuOpen(false)}
 />
 <div className="relative w-80 max-w-[85vw] bg-surface-container-lowest h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-700 rounded-r-[56px] overflow-hidden border-r-4 border-surface-container-low">
 <div className="p-10 border-b-4 border-surface-container-low flex items-center justify-between bg-background">
 <span className="text-3xl font-black text-on-surface tracking-tighter uppercase">
 JUMIA<span className="text-primary-container">★</span>
 </span>
 <button 
 onClick={() => setMobileMenuOpen(false)} 
 className="w-14 h-14 flex items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant hover:text-error transition-all active:scale-90 shadow-inner"
 >
 <X size={24} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto no-scrollbar py-10">
 <div className="px-10 mb-12">
 {session ? (
 <div className="flex flex-col gap-6 p-8 bg-surface-container-low/30 rounded-[40px] border-4 border-surface-container-low shadow-inner">
 <div className="w-20 h-20 bg-on-surface text-white rounded-[28px] flex items-center justify-center font-black text-3xl shadow-2xl relative overflow-hidden border-4 border-white/10">
 {session.user?.email?.[0].toUpperCase()}
 <div className="absolute inset-0 bg-primary-container opacity-5" />
 </div>
 <div>
 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic mb-2">Verified Node</p>
 <p className="font-black text-on-surface uppercase tracking-tight text-xl truncate">{session.user?.name || session.user?.email?.split('@')[0]}</p>
 </div>
 </div>
 ) : (
 <Link 
 href="/login" 
 onClick={() => setMobileMenuOpen(false)}
 className="h-24 bg-on-surface text-white flex items-center justify-center rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all border-4 border-white/10"
 >
 Establish Session
 </Link>
 )}
 </div>

 <div className="space-y-2">
 <p className="px-12 text-[10px] font-black text-on-surface-variant/20 uppercase tracking-[0.5em] mb-8 italic">Control Matrix</p>
 {[
 { icon: User, label: 'Profile Node', href: '/account' },
 { icon: Package, label: 'Inventory History', href: '/account/orders' },
 { icon: Heart, label: 'Cached Items', href: '/wishlist' },
 { icon: Bell, label: 'Telemetry', href: '/notifications' },
 { icon: Zap, label: 'Flash Events', href: '/flash-sales' },
 { icon: HelpCircle, label: 'Support Array', href: '/help' },
 { icon: Settings, label: 'Node Settings', href: '/account/settings' }
 ].map((item) => (
 <Link 
 key={item.href}
 href={item.href} 
 onClick={() => setMobileMenuOpen(false)} 
 className="flex items-center gap-6 px-10 py-5 text-on-surface hover:bg-surface-container-low transition-all group"
 >
 <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center group-hover:bg-on-surface transition-all duration-500 shadow-inner group-hover:shadow-2xl">
 <item.icon size={22} className="text-on-surface-variant/40 group-hover:text-white transition-colors" />
 </div>
 <span className="font-black text-[11px] uppercase tracking-[0.3em] group-hover:text-primary-container transition-colors">{item.label}</span>
 </Link>
 ))}
 </div>
 </div>

 {session && (
 <div className="p-10 border-t-4 border-surface-container-low bg-surface-container-low/20">
 <button 
 onClick={() => { signOut(); setMobileMenuOpen(false); }}
 className="w-full h-20 flex items-center justify-center gap-4 text-error font-black text-[11px] uppercase tracking-[0.4em] bg-error/5 rounded-[24px] hover:bg-error hover:text-white transition-all border-4 border-error/10 active:scale-95 shadow-xl shadow-error/5"
 >
 <LogOut size={20} /> Terminate Session
 </button>
 </div>
 )}
 </div>
 </div>
 )}
 </header>
 );
};
