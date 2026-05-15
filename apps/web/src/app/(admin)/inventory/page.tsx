'use client';

import React from 'react';
import { Package, Warehouse, AlertTriangle, CheckCircle, Activity, ShieldCheck } from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminInventoryPage() {
  const { data: stockLevels, isLoading } = api.inventory.listStockLevels.useQuery();

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8">
        <div className="h-20 w-64 bg-white/50 rounded-sm animate-pulse" />
        <div className="bg-white rounded-sm border border-j-border h-[600px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
                <Warehouse size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Inventory Hub</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Stock <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Real-time stock tracking across all warehouses</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <Activity size={16} className="text-jumia-orange animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Stock Tracking Active</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background/50 text-[9px] font-black uppercase tracking-widest text-j-text-muted/60 border-b border-j-border">
                  <th className="px-8 py-5">Product Details</th>
                  <th className="px-8 py-5">SKU</th>
                  <th className="px-8 py-5">Warehouse</th>
                  <th className="px-8 py-5">Stock Levels</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {stockLevels?.map((stock: any) => (
                  <tr key={stock.id} className="hover:bg-j-background/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-j-background rounded-sm flex items-center justify-center text-j-text-muted border border-j-border group-hover:border-jumia-orange/30 transition-colors">
                          <Package size={18} />
                        </div>
                        <div>
                          <div className="font-black text-sm text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors">
                            {stock.variant.product.title}
                          </div>
                          <div className="text-[10px] font-black text-j-text-muted/40 uppercase tracking-widest mt-0.5">
                            ID: {stock.variant.product.id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-j-text uppercase tracking-widest bg-j-background px-3 py-1 rounded-sm border border-j-border">
                        {stock.variant.sku}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Warehouse size={14} className="text-j-text-muted/40" />
                        <span className="text-[10px] font-black text-j-text uppercase tracking-tight">{stock.warehouse.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-j-text">{stock.qtyOnHand}</span>
                          <span className="text-[9px] font-black text-j-text-muted uppercase opacity-40">Available</span>
                        </div>
                        <div className="text-[9px] font-black text-jumia-orange uppercase tracking-tight flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-jumia-orange rounded-full" />
                          {stock.qtyReserved} Reserved
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {stock.qtyOnHand <= 10 ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-j-error border border-red-100 animate-pulse">
                          <AlertTriangle size={12} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-50 text-j-success border border-green-100">
                          <CheckCircle size={12} />
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!stockLevels || stockLevels.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-j-background rounded-full flex items-center justify-center mx-auto mb-2 opacity-20 border border-j-border">
                          <Warehouse size={32} />
                        </div>
                        <h3 className="text-xl font-black text-j-text uppercase tracking-tight">No Stock Found</h3>
                        <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">No inventory records were found in the system.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info Section */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <ShieldCheck size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Inventory <span className="text-jumia-orange">Standards</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  Stock levels are updated in real-time across all warehouses. Automatic audits are performed to ensure inventory accuracy and prevent overselling.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">System Sync Active</span>
              <Activity size={16} className="text-jumia-orange animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
