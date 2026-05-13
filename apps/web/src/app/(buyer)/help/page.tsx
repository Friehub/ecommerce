'use client';

import React, { useState } from 'react';
import { HelpCircle, Search, ChevronRight, MessageSquare, Shield, CreditCard, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
 const [searchQuery, setSearchQuery] = useState('');

 const faqs = [
 {
 category: 'Logistics & Dispatch',
 icon: RefreshCw,
 items: [
 { q: 'How do I track my order?', a: 'You can track your order status directly from the Order Tracking Timeline in your My Account -> Orders dashboard.' },
 { q: 'What are the shipping costs?', a: 'Standard shipping fees are ₦1,200 for regular packages. Large items may attract additional handling fees.' }
 ]
 },
 {
 category: 'Settlements & Identity',
 icon: CreditCard,
 items: [
 { q: 'What payment methods do you accept?', a: 'We accept Paystack, local debit/credit cards, bank transfers, and direct wallet balances.' },
 { q: 'How do I change my password?', a: 'You can update your login credentials in your My Account -> Settings -> Change Password section.' }
 ]
 },
 {
 category: 'Protocol & Reversal',
 icon: Shield,
 items: [
 { q: 'What is the return policy?', a: 'Items can be returned within 7 days of delivery if they are in original packaging and have all tags intact.' },
 { q: 'How long do refunds take?', a: 'Once the returned item passes quality assessment, refunds are credited back to your original payment method in 3 to 5 business days.' }
 ]
 }
 ];

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-5xl mx-auto px-6">
 {/* Breadcrumbs */}
 <div className="flex items-center gap-3 mb-10 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.4em]">
 <Link href="/" className="hover:text-primary-container transition-colors">Hub</Link>
 <ChevronRight size={14} className="opacity-30" />
 <span className="text-on-surface">Intelligence Center</span>
 </div>

 {/* Hero Section */}
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-12 md:p-20 text-center mb-12 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px] -translate-x-1/4 -translate-y-1/4 group-hover:scale-150 transition-transform duration-1000" />
 
 <div className="relative z-10">
 <div className="w-20 h-20 bg-primary-container/10 border-2 border-primary-container/20 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-primary-container shadow-xl shadow-primary-container/5">
 <HelpCircle size={40} />
 </div>
 <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase leading-none mb-4">Central <span className="text-primary-container">Support</span></h1>
 <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-12 max-w-md mx-auto italic">
 Query the knowledge base or initiate a direct operational handshake.
 </p>
 
 <div className="relative max-w-2xl mx-auto">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary-container transition-colors" size={20} />
 <input 
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="SEARCH KNOWLEDGE BASE (E.G. DISPATCH, REVERSAL)"
 className="w-full h-16 pl-16 pr-6 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface focus:border-primary-container focus:bg-surface-container-lowest transition-all outline-none placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 </div>
 </div>
 </div>

 {/* FAQ Categories */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {faqs.map((cat, index) => (
 <div key={index} className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low p-10 hover:border-primary-container/20 transition-all duration-500 shadow-soft flex flex-col">
 <div className="flex items-center gap-4 mb-8">
 <div className="w-12 h-12 bg-surface-container-low rounded-[18px] flex items-center justify-center text-primary-container border-2 border-surface-container-low">
 <cat.icon size={20} />
 </div>
 <h2 className="text-xs font-black text-on-surface uppercase tracking-widest leading-none">{cat.category}</h2>
 </div>

 <div className="space-y-8 flex-1">
 {cat.items.filter(item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
 <div key={idx} className="group cursor-pointer">
 <h3 className="text-[11px] font-black text-on-surface uppercase tracking-tight leading-tight mb-2 group-hover:text-primary-container transition-colors flex items-start gap-2">
 <ArrowRight size={14} className="mt-0.5 shrink-0 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
 {item.q}
 </h3>
 <p className="text-[10px] font-black text-on-surface-variant/40 leading-relaxed uppercase tracking-widest italic ml-6">{item.a}</p>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {/* Need Direct Support */}
 <div className="bg-primary-container/5 border-4 border-primary-container/10 rounded-[48px] p-10 mt-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
 <div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
 
 <div className="flex items-center gap-6 relative z-10">
 <div className="w-16 h-16 bg-surface-container-lowest rounded-[24px] flex items-center justify-center text-primary-container shadow-soft border-2 border-primary-container/10">
 <MessageSquare size={32} />
 </div>
 <div>
 <h4 className="font-black text-on-surface text-xl uppercase tracking-tighter leading-none">Operational Handshake</h4>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] mt-3 italic">Initiate real-time support sequence with Tier-1 Agents.</p>
 </div>
 </div>
 
 <Link href="/support" className="h-16 px-12 bg-on-surface text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl hover:bg-primary-container active:scale-95 transform relative z-10 flex items-center justify-center gap-4 group/btn">
 Connect Now <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
 </Link>
 </div>
 </div>
 </div>
 );
}
