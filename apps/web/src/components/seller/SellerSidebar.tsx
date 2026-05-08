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
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-[#f68b1e] rounded flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
          <Store size={18} />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-base leading-none tracking-tight">Seller Center</h1>
          <p className="text-[#f68b1e] text-[10px] font-bold mt-1 uppercase tracking-widest">Vendor Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#f68b1e]/10 text-[#f68b1e]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#f68b1e]' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="font-bold text-sm uppercase tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link
          href="/seller/finance"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group"
        >
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="font-bold text-sm uppercase tracking-tight">Settings</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-tight">Logout</span>
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
          <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex-col shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
}

