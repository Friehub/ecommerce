'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Settings, 
  BarChart3,
  LogOut,
  Store,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Box
} from 'lucide-react';

const navItems = [
  { name: 'Console', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Logistics', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/seller/products', icon: Box },
  { name: 'Finance', href: '/seller/finance', icon: Wallet },
  { name: 'Compliance', href: '/seller/kyc', icon: ShieldCheck },
  { name: 'Intelligence', href: '/seller/insights', icon: BarChart3 },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-container-low select-none">
      <div className="p-10 flex items-center gap-5">
        <div className="w-12 h-12 bg-on-surface text-white rounded-[18px] flex items-center justify-center shrink-0 shadow-2xl border-2 border-surface-container-lowest">
          <Store size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-on-surface font-black text-sm uppercase tracking-tighter leading-none">Seller Core</h1>
          <p className="text-on-surface-variant text-[9px] font-black mt-2 uppercase tracking-[0.3em] opacity-40">System Node v1.0</p>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-8">
        <p className="px-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.4em] opacity-30 mb-4">Operations Hub</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-6 py-4 rounded-[20px] transition-all duration-500 group border-2 ${
                isActive 
                  ? 'bg-on-surface text-white border-on-surface shadow-xl translate-x-2' 
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container-lowest hover:border-outline-variant/10 hover:translate-x-2'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:rotate-6'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-40" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t-2 border-surface-container-lowest mt-auto bg-surface-container-lowest/50">
        <div className="mb-8 p-6 bg-on-surface rounded-[28px] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Revenue Pulse</p>
            <div className="flex items-center gap-3">
              <TrendingUp size={16} className="text-success" />
              <span className="text-lg font-black tracking-tighter">LIVE FEED</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
        
        <button
          className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-[20px] text-error bg-error-container/5 border-2 border-transparent hover:border-error/20 hover:bg-error-container/10 transition-all group font-black text-[11px] uppercase tracking-[0.3em]"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Terminate Session
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-8 right-8 z-[110] w-16 h-16 bg-on-surface text-white rounded-full flex items-center justify-center shadow-3xl active:scale-95 transition-all hover:rotate-90"
      >
        <Menu size={28} />
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div 
            className="fixed inset-0 bg-on-surface/90 backdrop-blur-md transition-opacity duration-500"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-surface-container-low h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-700 ease-out">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-10 right-8 text-on-surface-variant hover:text-on-surface p-2 transition-colors z-[130]"
            >
              <X size={28} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-surface-container-low border-r-4 border-surface-container-lowest h-screen sticky top-0 flex-col shadow-soft">
        <SidebarContent />
      </div>
    </>
  );
}
