'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { 
  PackageSearch, 
  ArrowRight, 
  Truck, 
  Search, 
  ShieldCheck, 
  CalendarCheck, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Box, 
  Activity, 
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';

export default function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchId, setSearchId] = useState<string | null>(null);

  const { data: order, error, isLoading } = api.order.track.useQuery(
    { orderId: searchId as string },
    { enabled: !!searchId, retry: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      setSearchId(orderIdInput.trim());
    }
  };

  // Helper to determine active step in the order lifecycle
  const getActiveStep = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PAID':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Awaiting Payment' },
    { label: 'Payment Confirmed', desc: 'Ready for processing' },
    { label: 'Processing', desc: 'Item being packed' },
    { label: 'Shipped', desc: 'In transit to your city' },
    { label: 'Delivered', desc: 'Arrived at your location' },
  ];

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-sm border border-j-border shadow-2xl overflow-hidden max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-j-background p-10 md:p-16 text-center border-b border-j-border relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f68b1e05,_transparent)]" />
            <div className="relative space-y-6">
              <div className="w-20 h-20 bg-jumia-orange/10 text-jumia-orange rounded-2xl flex items-center justify-center mx-auto border-2 border-jumia-orange/20 shadow-sm">
                <PackageSearch size={40} />
              </div>
              <h1 className="text-4xl font-black text-j-text uppercase tracking-tight">Track Your Order</h1>
              <p className="text-j-text-muted text-[11px] font-black uppercase tracking-widest opacity-60 max-w-md mx-auto">
                Enter your order number to see real-time updates on your fulfillment progress.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 md:p-12 space-y-10">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="ORDER NUMBER (E.G. #CMP9Q...)" 
                  className="w-full h-20 pl-16 pr-8 bg-j-background border-2 border-j-border rounded-sm font-black text-xl tracking-tight focus:border-jumia-orange outline-none transition-all placeholder:text-j-text-muted/30 uppercase"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-20 bg-jumia-orange text-white font-black text-sm uppercase tracking-widest rounded-sm shadow-xl hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Locating Package...
                  </>
                ) : (
                  <>
                    Track Package
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="p-6 bg-red-50 border-2 border-j-error/20 rounded-sm text-j-error flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={22} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-[11px] uppercase tracking-wider mb-1">Search Failed</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tight opacity-90">{error.message}</p>
                </div>
              </div>
            )}

            {/* Result Area */}
            {order && !isLoading && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
                <div className="border-2 border-j-border rounded-sm overflow-hidden shadow-sm">
                  {/* Status Banner */}
                  <div className="bg-j-background p-6 border-b border-j-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Order Reference</span>
                      <h3 className="font-black text-lg text-j-text">#{order.id.toUpperCase()}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-j-text-muted uppercase tracking-widest">Status:</span>
                      <span className={`text-[10px] px-4 py-2 rounded-sm font-black uppercase shadow-sm border ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                          ? 'bg-green-50 text-j-success border-green-100' 
                          : order.status === 'CANCELLED'
                          ? 'bg-red-50 text-j-error border-red-100'
                          : 'bg-orange-50 text-jumia-orange border-orange-100'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Cancelled Alert */}
                  {order.status === 'CANCELLED' ? (
                    <div className="p-8 bg-red-50 border-b border-j-border text-center text-j-error space-y-3">
                      <AlertCircle size={40} className="mx-auto" />
                      <h4 className="font-black text-sm uppercase tracking-wider">This order has been cancelled</h4>
                      <p className="text-[10px] font-bold uppercase tracking-tight opacity-75 max-w-md mx-auto">
                        If you have questions about refunds or replacement orders, please reach out to our Customer Service Help Center.
                      </p>
                    </div>
                  ) : (
                    /* Elegant Progress Timeline */
                    <div className="p-8 border-b border-j-border space-y-8 bg-white">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-jumia-orange animate-pulse" />
                        <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">Fulfillment Progress</span>
                      </div>
                      
                      {/* Horizontal Step Bar */}
                      <div className="relative pt-6 pb-2">
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-j-background -translate-y-1/2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-jumia-orange transition-all duration-1000" 
                            style={{ width: `${(getActiveStep(order.status) / 4) * 100}%` }}
                          />
                        </div>
                        <div className="relative flex justify-between">
                          {steps.map((step, idx) => {
                            const isActive = idx <= getActiveStep(order.status);
                            return (
                              <div key={idx} className="flex flex-col items-center text-center max-w-[120px] relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-md ${
                                  isActive 
                                    ? 'bg-jumia-orange border-jumia-orange text-white' 
                                    : 'bg-white border-j-border text-j-text-muted'
                                }`}>
                                  {isActive ? (
                                    <CheckCircle2 size={16} strokeWidth={2.5} />
                                  ) : (
                                    <span className="text-[10px] font-black">{idx + 1}</span>
                                  )}
                                </div>
                                <h4 className={`text-[9px] font-black uppercase tracking-tight mt-3 ${
                                  isActive ? 'text-j-text font-black' : 'text-j-text-muted opacity-40 font-bold'
                                }`}>
                                  {step.label}
                                </h4>
                                <p className="text-[7px] font-black uppercase tracking-tight text-j-text-muted opacity-60 hidden md:block mt-0.5">
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Packages Details */}
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Box size={16} className="text-jumia-orange" />
                      <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">Fulfillment Packages ({order.packages.length})</span>
                    </div>

                    <div className="space-y-6">
                      {order.packages.map((pkg: any) => (
                        <div key={pkg.id} className="bg-j-background border-2 border-j-border p-6 rounded-sm space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-j-border/60 pb-3 gap-3">
                            <div>
                              <p className="text-[8px] font-black text-j-text-muted uppercase tracking-widest">Package ID</p>
                              <p className="font-black text-xs text-j-text uppercase">#{pkg.id.substring(0, 16).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[8px] font-black text-j-text-muted uppercase tracking-widest">Delivery Status:</span>
                              <span className="text-[9px] px-3 py-1 bg-white border border-j-border rounded-sm font-black text-jumia-orange uppercase">
                                {pkg.status}
                              </span>
                            </div>
                          </div>

                          <div className="divide-y divide-j-border/40">
                            {pkg.lines.map((line: any) => (
                              <div key={line.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white border border-j-border rounded-sm flex items-center justify-center shrink-0 text-j-text-muted overflow-hidden">
                                    {line.variant.product.media?.[0]?.url ? (
                                      <img src={line.variant.product.media[0].url} alt={line.variant.product.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package size={20} />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-black text-xs text-j-text line-clamp-1 uppercase tracking-tight">{line.variant.product.title}</h4>
                                    <p className="text-[8px] font-black text-j-text-muted uppercase tracking-wider">Qty: {line.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-black text-xs text-j-text">₦ {Number(line.priceSnapshot).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="flex gap-5 p-6 bg-j-background rounded-sm border border-j-border border-dashed">
                <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border-2 border-j-border shrink-0">
                  <Truck size={24} className="text-jumia-orange" />
                </div>
                <div className="text-left">
                  <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">Standard Delivery</h4>
                  <p className="text-[9px] font-bold text-j-text-muted uppercase tracking-tighter opacity-70">Lagos: 1-3 Business Days<br />Rest of Nigeria: 3-7 Business Days</p>
                </div>
              </div>
              <div className="flex gap-5 p-6 bg-j-background rounded-sm border border-j-border border-dashed">
                <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border-2 border-j-border shrink-0">
                  <ShieldCheck size={24} className="text-j-success" />
                </div>
                <div className="text-left">
                  <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">Purchase Protection</h4>
                  <p className="text-[9px] font-bold text-j-text-muted uppercase tracking-tighter opacity-70">15 Days Free Return<br />On All Official Store Items</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-[10px] font-black text-j-text-muted uppercase tracking-widest hover:text-jumia-orange transition-colors flex items-center justify-center gap-2">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
