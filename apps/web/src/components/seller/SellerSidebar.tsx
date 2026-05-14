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
  { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Products', href: '/seller/products', icon: Box },
  { name: 'Finance', href: '/seller/finance', icon: Wallet },
  { name: 'Seller Profile', href: '/seller/kyc', icon: ShieldCheck },
  { name: 'Analytics', href: '/seller/insights', icon: BarChart3 },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-j-border select-none">
      <div className="p-6 border-b border-j-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-jumia-orange text-white rounded flex items-center justify-center shrink-0 shadow-sm">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-j-text font-black text-lg tracking-tight uppercase leading-none">Seller</h1>
            <p className="text-j-text-muted text-[10px] font-bold mt-1 uppercase tracking-wider">Center</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 transition-colors group ${
                isActive 
                  ? 'bg-jumia-orange/5 text-jumia-orange border-r-4 border-jumia-orange' 
                  : 'text-j-text hover:bg-j-surface-container-low border-r-4 border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-jumia-orange' : 'text-j-text-muted group-hover:text-j-text'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-jumia-orange' : 'text-j-text'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-j-border">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-j-error hover:bg-red-50 transition-colors font-bold text-xs uppercase"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[110] w-14 h-14 bg-jumia-orange text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-j-text-muted hover:text-j-text p-2"
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-j-border h-screen sticky top-0 flex-col">
        <SidebarContent />
      </div>
    </>
  );
}
