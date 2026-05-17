'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Truck,
  AlertTriangle,
  Settings,
  Image as ImageIcon,
  Tag,
  ShieldAlert,
  Box,
  Wallet,
  CornerUpLeft
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Sellers', href: '/admin/sellers', icon: ShieldCheck },
  { name: 'KYC Verification', href: '/kyc', icon: ShieldCheck },
  { name: 'Fraud Monitoring', href: '/fraud', icon: ShieldAlert },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Payouts', href: '/payouts', icon: Wallet },
  { name: 'Returns', href: '/returns', icon: CornerUpLeft },
  { name: 'Users', href: '/admin/admin/users', icon: Users },
  { name: 'Logistics', href: '/admin/logistics', icon: Truck },
  { name: 'Disputes', href: '/admin/admin/disputes', icon: AlertTriangle },
  { name: 'Flash Sales', href: '/admin/admin/flash-sales', icon: Tag },
  { name: 'Banners', href: '/admin/admin/banners', icon: ImageIcon },
  { name: 'Analytics', href: '/admin/admin/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-j-border select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-j-border bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-j-text text-white rounded-sm flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-j-text font-black text-lg tracking-tight uppercase leading-none">Admin</h1>
            <p className="text-j-text-muted text-[10px] font-black mt-1 uppercase tracking-widest opacity-60">Control Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-6 py-3.5 transition-all group relative ${
                isActive 
                  ? 'text-jumia-orange' 
                  : 'text-j-text-muted hover:text-j-text hover:bg-j-background'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-jumia-orange rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-jumia-orange' : 'text-j-text-muted group-hover:text-j-text'}`} />
              <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-jumia-orange' : 'text-j-text-muted group-hover:text-j-text'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-j-border bg-j-background/30">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-j-error hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest group"
        >
          <div className="p-2 bg-red-50 rounded-sm group-hover:bg-red-100 transition-colors">
            <LogOut size={16} />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[110] w-14 h-14 bg-j-text text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all border-4 border-white"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-j-text-muted hover:text-j-text p-2 rounded-full hover:bg-j-background transition-all"
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-j-border h-screen sticky top-0 flex-col shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
