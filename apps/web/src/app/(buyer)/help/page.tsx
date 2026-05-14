// apps/web/src/app/(buyer)/help/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Search, ChevronRight, MessageSquare, Shield, CreditCard, 
  Truck, User, Package, Headphones, Mail, Phone
} from 'lucide-react';
import Link from 'next/link';

const helpTopics = [
  { label: 'Payments', icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
  { label: 'Delivery', icon: Truck, color: 'bg-j-success/5 text-j-success' },
  { label: 'Returns & Refunds', icon: Shield, color: 'bg-red-50 text-red-600' },
  { label: 'Account', icon: User, color: 'bg-purple-50 text-purple-600' },
  { label: 'Sell on Jumia', icon: Package, color: 'bg-jumia-orange/5 text-jumia-orange' },
  { label: 'Place & Track Order', icon: Search, color: 'bg-j-surface-container-low text-j-text' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-j-background min-h-screen pb-12">
      <div className="max-w-container-max mx-auto px-margin-desktop py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-body-sm text-j-text-muted">
          <Link href="/" className="hover:text-jumia-orange">Home</Link>
          <ChevronRight size={14} />
          <span className="text-j-text">Help Center</span>
        </div>

        {/* Hero */}
        <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden mb-gutter">
          <div className="bg-jumia-orange px-6 py-12 md:py-16 text-center flex flex-col items-center gap-6">
            <h1 className="text-display-sm md:text-display-md font-bold text-white uppercase">Help Center</h1>
            <p className="text-body-lg text-white/90">How can we help you?</p>
            <div className="relative w-full max-w-2xl mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics or keywords"
                className="w-full h-14 pl-12 pr-6 rounded border-none shadow-lg text-body-md focus:ring-2 focus:ring-white outline-none"
              />
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="text-label-bold font-bold uppercase text-j-text-muted mb-6">Help Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpTopics.map((topic) => (
                <Link 
                  key={topic.label}
                  href={`/help/${topic.label.toLowerCase().replace(/ /g, '-')}`}
                  className="flex items-center gap-4 p-5 border border-j-outline-variant rounded hover:border-jumia-orange transition-all group"
                >
                  <div className={`w-12 h-12 rounded flex items-center justify-center ${topic.color} transition-transform group-hover:scale-110`}>
                    <topic.icon size={24} />
                  </div>
                  <span className="text-body-md font-bold text-j-text uppercase group-hover:text-jumia-orange">{topic.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
            <h2 className="text-label-bold font-bold uppercase">Contact Us</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-j-surface-container-low rounded-full flex items-center justify-center text-jumia-orange">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-body-md font-bold uppercase">Live Chat</h3>
              <p className="text-body-sm text-j-text-muted">Chat with our agents 24/7</p>
              <button className="mt-2 text-jumia-orange font-bold uppercase text-label-bold hover:underline">Start Chat</button>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-j-surface-container-low rounded-full flex items-center justify-center text-jumia-orange">
                <Phone size={32} />
              </div>
              <h3 className="text-body-md font-bold uppercase">Call Us</h3>
              <p className="text-body-sm text-j-text-muted">0700-6000-000</p>
              <p className="text-body-xs text-j-text-muted">Mon-Sat: 8am - 8pm</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-j-surface-container-low rounded-full flex items-center justify-center text-jumia-orange">
                <Mail size={32} />
              </div>
              <h3 className="text-body-md font-bold uppercase">Email Us</h3>
              <p className="text-body-sm text-j-text-muted">help@jumia.com.ng</p>
              <button className="mt-2 text-jumia-orange font-bold uppercase text-label-bold hover:underline">Send Email</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
