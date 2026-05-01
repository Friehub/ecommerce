'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
// Using native Intl for formatting

const tabs = [
  { name: 'All', count: 0 },
  { name: 'Pending', count: 0 },
  { name: 'Processing', count: 0 },
  { name: 'Shipped', count: 0 },
  { name: 'Delivered', count: 0 },
];

export default function SellerOrders() {
  const [activeTab, setActiveTab] = useState('All');
  const { data: packages, isLoading, refetch } = api.order.listSellerPackages.useQuery();
  const updateStatus = api.order.updatePackageStatus.useMutation({
    onSuccess: () => refetch()
  });

  if (isLoading) return <div className="text-gray-400">Loading orders...</div>;

  const filteredPackages = packages?.filter(p => 
    activeTab === 'All' || p.status.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and fulfill your customer orders efficiently.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              className="bg-white border border-gray-200 rounded pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#f68b1e] w-64 shadow-sm"
            />
          </div>
          <button className="bg-white border border-gray-200 p-2 rounded text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (activeTab === tab.name) ? (
          <button
            key={tab.name}
            className="px-6 py-3 text-xs font-bold uppercase border-b-2 border-[#f68b1e] text-[#f68b1e]"
          >
            {tab.name}
          </button>
        ) : (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className="px-6 py-3 text-xs font-bold uppercase text-gray-400 hover:text-gray-600 border-b-2 border-transparent transition-all"
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Order Details</th>
              <th className="px-6 py-4">Item Information</th>
              <th className="px-6 py-4">Customer Info</th>
              <th className="px-6 py-4">Pricing</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPackages?.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-gray-900">#{pkg.orderId.slice(-8).toUpperCase()}</div>
                  <div className="text-gray-400 text-[10px] mt-1">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(pkg.order.createdAt))}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-100 shrink-0">
                      <Package size={18} className="text-gray-300" />
                    </div>
                    <div className="max-w-[180px] truncate">
                      <div className="text-gray-900 font-bold text-xs">{(pkg.lines[0]?.variant as any)?.product?.title || (pkg.lines[0]?.variant as any)?.product?.name}</div>
                      {pkg.lines.length > 1 && <div className="text-gray-400 text-[10px]">+{pkg.lines.length - 1} other items</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-gray-600 text-xs font-medium">UID: {pkg.order.userId.slice(-6).toUpperCase()}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-gray-900">₦{Number(pkg.order.total).toLocaleString()}</div>
                  <div className="text-gray-400 text-[10px] mt-1 uppercase font-bold">{pkg.order.paymentMethod}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    pkg.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    pkg.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    pkg.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                    'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {pkg.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {pkg.status === 'PENDING' && (
                      <button 
                        onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'READY_FOR_PICKUP' })}
                        className="bg-[#f68b1e] text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-[#e67e17] transition-all uppercase shadow-sm"
                      >
                        Confirm Order
                      </button>
                    )}
                    {pkg.status === 'READY_FOR_PICKUP' && (
                      <button 
                        onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'PICKED_UP' })}
                        className="bg-[#2196F3] text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-blue-600 transition-all uppercase shadow-sm"
                      >
                        Hand to Agent
                      </button>
                    )}
                    <button className="p-1.5 text-gray-300 hover:text-gray-600 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!filteredPackages || filteredPackages.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={32} strokeWidth={1} />
                    <p className="text-xs uppercase font-bold tracking-wider">No orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
