'use client';

import React from 'react';
import Link from 'next/link';
import { PackageSearch, ArrowRight, Truck, Search, ShieldCheck } from 'lucide-react';

export default function TrackOrderPage() {
  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-sm border border-j-border shadow-2xl overflow-hidden max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-j-background p-10 md:p-16 text-center border-b border-j-border relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f68b1e05,_transparent)]" />
            <div className="relative space-y-6">
              <div className="w-20 h-20 bg-jumia-orange/10 text-jumia-orange rounded-2xl flex items-center justify-center mx-auto border-2 border-jumia-orange/20 shadow-sm animate-bounce duration-[3000ms]">
                <PackageSearch size={40} />
              </div>
              <h1 className="text-4xl font-black text-j-text uppercase tracking-tight">Track Your Order</h1>
              <p className="text-j-text-muted text-[11px] font-black uppercase tracking-widest opacity-60 max-w-md mx-auto">
                Enter your order number to see real-time updates on your fulfillment progress.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-10 md:p-20 space-y-12">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="ORDER NUMBER (E.G. #ORD-123456)" 
                  className="w-full h-20 pl-16 pr-8 bg-j-background border-2 border-j-border rounded-sm font-black text-xl tracking-tight focus:border-jumia-orange outline-none transition-all placeholder:text-j-text-muted/30 uppercase"
                />
              </div>
              <button className="w-full h-20 bg-jumia-orange text-white font-black text-sm uppercase tracking-widest rounded-sm shadow-xl hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group">
                Track Package
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="flex gap-5 p-6 bg-j-background rounded-sm border border-j-border border-dashed">
                <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border-2 border-j-border shrink-0">
                  <Truck size={24} className="text-jumia-orange" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">Standard Delivery</h4>
                  <p className="text-[9px] font-bold text-j-text-muted uppercase tracking-tighter opacity-70">Lagos: 1-3 Business Days<br />Rest of Nigeria: 3-7 Business Days</p>
                </div>
              </div>
              <div className="flex gap-5 p-6 bg-j-background rounded-sm border border-j-border border-dashed">
                <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border-2 border-j-border shrink-0">
                  <ShieldCheck size={24} className="text-j-success" />
                </div>
                <div>
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
