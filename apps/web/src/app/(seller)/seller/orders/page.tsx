'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Search, Filter, MoreVertical, ExternalLink, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

const tabs = [
  { name: 'All', count: 0 },
  { name: 'Pending', count: 0 },
  { name: 'Processing', count: 0 },
  { name: 'Shipped', count: 0 },
  { name: 'Delivered', count: 0 },
];

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const { data: packages, isLoading, refetch } = api.order.listSellerPackages.useQuery();
  const updateStatus = api.order.updatePackageStatus.useMutation({
    onSuccess: () => refetch()
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-24 select-none font-bold uppercase text-xs tracking-widest text-gray-400">
        Loading shipments & orders...
      </div>
    );
  }

  const filteredPackages = packages?.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return p.status === 'PENDING';
    if (activeTab === 'Processing') return ['READY_FOR_PICKUP', 'PICKED_UP'].includes(p.status);
    if (activeTab === 'Shipped') return p.status === 'IN_TRANSIT' || p.status === 'SHIPPED';
    if (activeTab === 'Delivered') return p.status === 'DELIVERED';
    return p.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
            <Package className="text-[#F68B1E]" /> SELLER ORDER FULFILLMENT
          </h1>
          <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
            Fulfill items, monitor customer dispatch queues, and update carrier delivery status.
          </p>
        </div>
        <div className="flex gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-sm w-full sm:w-auto">
          <Search className="text-gray-400 shrink-0 mt-0.5" size={16} />
          <input 
            type="text" 
            placeholder="Search Order ID..."
            className="text-xs font-bold text-gray-900 bg-transparent focus:outline-none placeholder-gray-400 w-full"
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (activeTab === tab.name) ? (
          <button
            key={tab.name}
            className="px-5 py-3 text-xs font-black uppercase border-b-2 border-[#F68B1E] text-[#F68B1E] tracking-wider shrink-0 duration-200 transition-all cursor-pointer"
          >
            {tab.name}
          </button>
        ) : (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className="px-5 py-3 text-xs font-bold uppercase text-gray-400 hover:text-gray-600 border-b-2 border-transparent transition-all tracking-wider shrink-0 duration-200 cursor-pointer"
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black tracking-widest text-gray-500 uppercase">
                <th className="px-6 py-4">Shipment Detail</th>
                <th className="px-6 py-4">Product Category/Line</th>
                <th className="px-6 py-4">Total Fee</th>
                <th className="px-6 py-4">Fulfillment Status</th>
                <th className="px-6 py-4 text-right">Update Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {filteredPackages?.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900 tracking-tight">#{pkg.orderId.slice(-8).toUpperCase()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                      Ordered {new Date(pkg.order.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package size={18} className="text-gray-300" />
                      </div>
                      <div className="max-w-[220px] truncate">
                        <h4 className="font-extrabold text-xs text-gray-800 tracking-tight truncate">
                          {(pkg.lines[0]?.variant as any)?.product?.title || (pkg.lines[0]?.variant as any)?.product?.name || 'Assorted Item Bundle'}
                        </h4>
                        {pkg.lines.length > 1 && (
                          <div className="text-[10px] text-[#F68B1E] font-black uppercase tracking-wider mt-0.5">+{pkg.lines.length - 1} other items</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900 tracking-tight">₦ {Number(pkg.order.total).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {pkg.order.paymentMethod || 'WALLET'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      pkg.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      pkg.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      pkg.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {pkg.status === 'PENDING' && (
                      <button 
                        onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'READY_FOR_PICKUP' })}
                        disabled={updateStatus.isLoading}
                        className="bg-[#F68B1E] hover:bg-[#e07a1a] text-white px-3.5 py-2 rounded-xl text-[10px] font-extrabold hover:shadow-md transition-all duration-200 uppercase tracking-wider active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        CONFIRM
                      </button>
                    )}
                    {pkg.status === 'READY_FOR_PICKUP' && (
                      <button 
                        onClick={() => updateStatus.mutate({ packageId: pkg.id, status: 'PICKED_UP' })}
                        disabled={updateStatus.isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-[10px] font-extrabold hover:shadow-md transition-all duration-200 uppercase tracking-wider active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        DISPATCH
                      </button>
                    )}
                    {pkg.status === 'PICKED_UP' && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80 border border-gray-100 px-2 py-1 rounded">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!filteredPackages || filteredPackages.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center select-none">
                    <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
                      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100 text-[#F68B1E] mb-1">
                        <Package size={22} />
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900 tracking-tight leading-tight">No shipments available</h4>
                      <p className="text-gray-400 text-xs font-medium">Orders matching this status display here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
