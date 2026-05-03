'use client';

import React, { useState } from 'react';
import { HelpCircle, Search, ChevronRight, MessageSquare, Shield, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Orders & Deliveries',
      icon: RefreshCw,
      items: [
        { q: 'How do I track my order?', a: 'You can track your order status directly from the Order Tracking Timeline in your My Account -> Orders dashboard.' },
        { q: 'What are the shipping costs?', a: 'Standard shipping fees are ₦1,200 for regular packages. Large items may attract additional handling fees.' }
      ]
    },
    {
      category: 'Payments & Accounts',
      icon: CreditCard,
      items: [
        { q: 'What payment methods do you accept?', a: 'We accept Paystack, local debit/credit cards, bank transfers, and direct wallet balances.' },
        { q: 'How do I change my password?', a: 'You can update your login credentials in your My Account -> Settings -> Change Password section.' }
      ]
    },
    {
      category: 'Returns & Refunds',
      icon: Shield,
      items: [
        { q: 'What is the return policy?', a: 'Items can be returned within 7 days of delivery if they are in original packaging and have all tags intact.' },
        { q: 'How long do refunds take?', a: 'Once the returned item passes quality assessment, refunds are credited back to your original payment method in 3 to 5 business days.' }
      ]
    }
  ];

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/" className="hover:text-[#F68B1E] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Help Center</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 md:p-10 text-center shadow-md mb-8">
          <div className="w-16 h-16 bg-orange-50 text-[#F68B1E] rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">How can we help you?</h1>
          <p className="text-sm font-medium text-gray-400 mb-6 max-w-md mx-auto">
            Search our frequently asked questions or discover direct support channels.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g., refunds, shipping)"
              className="w-full h-12 pl-12 pr-4 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqs.map((cat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-5 lg:p-7">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
                <div className="w-10 h-10 bg-orange-50/80 rounded-xl flex items-center justify-center text-[#F68B1E] border border-orange-100/50">
                  <cat.icon size={20} />
                </div>
                <h2 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight">{cat.category}</h2>
              </div>

              <div className="divide-y divide-gray-50">
                {cat.items.filter(item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                  <div key={idx} className="py-4 last:pb-0">
                    <h3 className="text-sm md:text-base font-extrabold text-gray-800 leading-tight mb-1 cursor-pointer hover:text-[#F68B1E] transition-colors">{item.q}</h3>
                    <p className="text-xs md:text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Need Direct Support */}
        <div className="bg-orange-50 border border-orange-100/60 rounded-xl p-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#F68B1E] shadow-sm border border-orange-50/50 flex-shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm md:text-base leading-tight">Can't find what you need?</h4>
              <p className="text-gray-500 font-medium text-xs md:text-sm mt-0.5">Talk to our live agents 24/7 for immediate order resolutions.</p>
            </div>
          </div>
          <Link href="/support" className="inline-block px-5 py-3 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 duration-200 flex-shrink-0">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
