'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  PackageCheck, 
  Truck, 
  CalendarCheck, 
  ShieldCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="w-full max-w-2xl px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden">
        {/* Top Gradient & Icon */}
        <div className="bg-primary-container/5 h-48 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent opacity-50" />
          <div className="relative group">
            <div className="absolute inset-0 bg-success/20 blur-3xl group-hover:bg-success/30 transition-all duration-500 rounded-full" />
            <div className="relative w-24 h-24 bg-success-container/10 text-success rounded-[32px] flex items-center justify-center border-4 border-success/10 shadow-lg transform group-hover:scale-110 transition-all duration-500">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="p-10 md:p-14 text-center">
          <h1 className="text-4xl font-black text-on-surface uppercase tracking-tighter leading-none mb-4">Transaction Confirmed</h1>
          <div className="flex flex-col items-center gap-2 mb-10">
            <p className="text-on-surface-variant text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Order Identity Verified</p>
            <div className="bg-surface-container-low px-6 py-2 rounded-2xl border-2 border-surface-container-lowest shadow-sm">
              <span className="font-black text-on-surface text-lg tracking-tighter">#{orderId?.substring(0, 12).toUpperCase() || 'CANONICAL-REF'}</span>
            </div>
          </div>

          <p className="text-on-surface-variant font-medium italic text-sm mb-12 max-w-md mx-auto leading-relaxed">
            Your acquisition has been recorded in our secure ledger. A confirmation manifest has been dispatched to your primary communication node.
          </p>

          {/* Operational Timeline */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-surface-container-low flex-1" />
              <p className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em] opacity-40 whitespace-nowrap">Fulfillment Pipeline</p>
              <div className="h-px bg-surface-container-low flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: PackageCheck, title: 'Packaging', color: 'primary' },
                { icon: Truck, title: 'Logistics', color: 'primary' },
                { icon: CalendarCheck, title: 'Delivery', color: 'success' }
              ].map((step, i) => (
                <div key={i} className="bg-surface-container-low p-6 rounded-[32px] border-2 border-surface-container-lowest shadow-sm group hover:translate-y-[-4px] transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-2 border-on-surface/5 shadow-sm group-hover:scale-110 transition-transform ${
                    step.color === 'success' ? 'bg-success-container/10 text-success' : 'bg-primary-container/10 text-primary-container'
                  }`}>
                    <step.icon size={22} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.2em]">{step.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Action Interface */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/account/orders/${orderId}`}
              className="flex-1 h-16 bg-surface-container-low text-on-surface font-black px-8 rounded-2xl hover:bg-surface-container-lowest border-2 border-surface-container-lowest shadow-soft transition-all text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group"
            >
              Audit Pipeline
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/"
              className="flex-1 h-16 bg-on-surface text-white font-black px-10 rounded-2xl hover:opacity-90 active:scale-95 transition-all text-[11px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 group"
            >
              <ShoppingBag size={18} />
              Return to Catalog
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-surface-container-low p-8 border-t-4 border-surface-container-lowest flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-success-container/10 text-success rounded-xl flex items-center justify-center border-2 border-success/10 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface uppercase tracking-widest">Consumer Protection</p>
              <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-40">Encrypted Transaction Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-lowest px-6 py-2.5 rounded-full border-2 border-outline-variant/5 shadow-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest opacity-60">Status: Integrated Fulfillment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center p-4 md:p-8 select-none">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-20 h-20 bg-surface-container-low rounded-[28px]" />
          <div className="h-4 w-48 bg-surface-container-low rounded-full" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
