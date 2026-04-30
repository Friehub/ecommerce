'use client';

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
  Store
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/seller/inventory', icon: Package },
  { name: 'Finance', href: '/seller/finance', icon: Wallet },
  { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-[#f68b1e] rounded flex items-center justify-center font-bold text-white">
          <Store size={18} />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-base leading-none">Seller Center</h1>
          <p className="text-[#f68b1e] text-[10px] font-bold mt-1 uppercase tracking-wider">Vendor Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#f68b1e]/10 text-[#f68b1e]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#f68b1e]' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="font-bold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link
          href="/seller/settings"
          className="flex items-center gap-3 px-4 py-3 rounded text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="font-bold text-sm">Settings</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
