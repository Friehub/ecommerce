'use client';

import React from 'react';
import { Mail, ArrowLeft, Inbox, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AccountInboxPage() {
  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-12">
        <div className="bg-white rounded-sm border border-j-border shadow-soft overflow-hidden max-w-4xl mx-auto">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-j-border bg-j-background flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/account" className="w-10 h-10 bg-white rounded-sm border-2 border-j-border flex items-center justify-center hover:text-jumia-orange hover:border-jumia-orange transition-all">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-black text-j-text uppercase tracking-tight">Message Center</h1>
                <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Manage your conversations with sellers and support</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white px-6 py-3 rounded-sm border-2 border-j-border">
              <Clock size={16} className="text-jumia-orange" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Status</span>
            </div>
          </div>

          {/* Empty State / Coming Soon */}
          <div className="py-32 md:py-48 text-center px-10">
            <div className="w-24 h-24 bg-j-background rounded-3xl flex items-center justify-center mx-auto mb-10 border-2 border-j-border shadow-inner group">
              <Inbox size={48} className="text-j-text-muted opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
            </div>
            <h2 className="text-3xl font-black text-j-text uppercase tracking-tighter mb-4">Inbox Is Empty</h2>
            <p className="text-j-text-muted text-[11px] font-black uppercase tracking-widest opacity-40 max-w-xs mx-auto leading-relaxed mb-12 italic">
              Your message archive is currently empty. Direct communication with vendors is coming soon.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3 text-j-success bg-j-success/5 px-6 py-3 rounded-sm border border-j-success/10">
                <Shield size={16} />
                <span className="text-[10px] font-black uppercase tracking-tight">Encrypted Channel</span>
              </div>
              <Link href="/help" className="text-[10px] font-black text-jumia-orange uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                Contact Customer Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
