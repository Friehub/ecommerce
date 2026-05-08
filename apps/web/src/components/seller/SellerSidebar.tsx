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
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/seller/inventory', icon: Package },
  { name: 'Finance', href: '/seller/finance', icon: Wallet },
  { name: 'Insights', href: '/seller/insights', icon: BarChart3 },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#f68b1e] rounded-xl flex items-center justify-center text-white shrink-0">
          <Store size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-gray-900 font-extrabold text-sm uppercase tracking-tight leading-none">Seller Center</h1>
          <p className="text-gray-400 text-[9px] font-bold mt-1 uppercase tracking-widest">Vendor Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#f68b1e]/10 text-[#f68b1e]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#f68b1e]' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#f68b1e]' : 'text-gray-500 group-hover:text-gray-900'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 mt-auto">
        <button
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} />
          <span className="font-black text-[11px] uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#f68b1e] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-500">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-white border-r border-gray-100 h-screen sticky top-0 flex-col">
        <SidebarContent />
      </div>
    </>
  );
}

