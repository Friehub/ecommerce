// apps/web/src/app/(buyer)/help/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, ChevronRight, MessageSquare, Shield, CreditCard, 
  Truck, User, Package, Mail, Phone, ChevronDown, X, Info
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const helpTopics = [
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
  { id: 'delivery', label: 'Delivery', icon: Truck, color: 'bg-j-success/5 text-j-success' },
  { id: 'returns-&-refunds', label: 'Returns & Refunds', icon: Shield, color: 'bg-red-50 text-red-600' },
  { id: 'account', label: 'Account', icon: User, color: 'bg-purple-50 text-purple-600' },
  { id: 'sell-on-jumia', label: 'Sell on Jumia', icon: Package, color: 'bg-jumia-orange/5 text-jumia-orange' },
  { id: 'place-&-track-order', label: 'Place & Track Order', icon: Search, color: 'bg-j-surface-container-low text-j-text' },
];

const faqs: FAQItem[] = [
  // Payments
  {
    category: 'payments',
    question: 'How do I pay on Jumia?',
    answer: 'You can pay securely at checkout using Credit/Debit cards (Visa, Mastercard, Verve), Direct Bank Transfer, or via your JumiaPay wallet balance. All transactions are protected by industry-standard secure socket layers (SSL).'
  },
  {
    category: 'payments',
    question: 'Can I pay on delivery?',
    answer: 'To ensure maximum safety and contactless delivery, we currently require prepaid secure payment methods at checkout. Payment on delivery is not supported at this time.'
  },
  {
    category: 'payments',
    question: 'My payment failed, what should I do?',
    answer: 'If your transaction was declined, please verify that your card has sufficient funds, has not expired, and is enabled for international/online payments. You can also try choosing Direct Bank Transfer.'
  },
  // Delivery
  {
    category: 'delivery',
    question: 'How long does delivery take?',
    answer: 'Standard door delivery typically takes between 2 to 4 business days for major metropolitan areas, and up to 5 to 7 business days for outlying regions. You can check the estimated delivery timeline on the product details page.'
  },
  {
    category: 'delivery',
    question: 'What is Jumia Express?',
    answer: 'Jumia Express is our premium logistics service. Items carrying the Jumia Express badge are stored in our local warehouses and are processed, packed, and dispatched immediately, resulting in next-day or 2-day delivery.'
  },
  {
    category: 'delivery',
    question: 'Can I pick up my package from a station?',
    answer: 'Yes! During checkout, you can opt for Pickup Stations instead of Home Delivery. Pickup stations are generally cheaper and allow you to collect your package at your convenience within 5 business days.'
  },
  // Returns & Refunds
  {
    category: 'returns-&-refunds',
    question: 'What is the return policy?',
    answer: 'You can return any eligible product within 7 days of delivery for standard items, and up to 15 days if the product was purchased from an Official Store. The item must be unused, in its original packaging, and with all tags intact.'
  },
  {
    category: 'returns-&-refunds',
    question: 'How do I request a refund?',
    answer: 'To initiate a return, go to your Account Dashboard under "Disputes & Returns", select the completed order containing the item, fill out the return reason form, and choose your preferred return method.'
  },
  {
    category: 'returns-&-refunds',
    question: 'How long do refunds take?',
    answer: 'Once your return arrives at our inspection center and is approved, bank card refunds are processed within 3 to 5 business days, bank transfers take 2 to 3 days, and JumiaPay wallet transfers are immediate.'
  },
  // Account
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'Navigate to the Login page, click on "Forgot Password?", enter your registered email address, and we will immediately send you a secure link to choose a new password.'
  },
  {
    category: 'account',
    question: 'How do I edit my address book?',
    answer: 'Log into your account, click on "Address Book" in the sidebar menu, where you can add new delivery addresses or edit your default billing and shipping destinations.'
  },
  // Sell on Jumia
  {
    category: 'sell-on-jumia',
    question: 'How do I register as a seller?',
    answer: 'You can start selling today! Click on "Sell on Jumia" in the footer, or go directly to `/seller/register` to enter your business credentials, verify your identity (KYC), and upload your inventory.'
  },
  {
    category: 'sell-on-jumia',
    question: 'What commission rates apply?',
    answer: 'Registration on Jumia is completely free. We only charge a small percentage commission on items successfully sold. Commission rates vary from 5% to 15% depending on the product category.'
  },
  // Place & Track Order
  {
    category: 'place-&-track-order',
    question: 'How do I track my order?',
    answer: 'To check your package fulfillment status in real-time, visit the `/track-order` page in the header and input your unique order tracking reference (e.g. #CMP9Q...).'
  },
  {
    category: 'place-&-track-order',
    question: 'Can I cancel an order?',
    answer: 'Orders can only be cancelled before they enter the "Shipped" or "In Transit" status. Go to your active orders list in your account dashboard and select "Cancel Order" if the button is available.'
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const [chatActive, setChatActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);

  // Dynamic search & category filtering
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory ? faq.category === activeCategory : true;
      const matchesSearch = searchQuery
        ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const handleTopicClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setExpandedFaq(null);
  };

  const toggleFaq = (question: string) => {
    setExpandedFaq(expandedFaq === question ? null : question);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory(null);
    setExpandedFaq(null);
  };

  const handleStartChat = () => {
    setChatActive(true);
    setTimeout(() => setChatActive(false), 5000);
  };

  const handleSendEmail = () => {
    setEmailActive(true);
    setTimeout(() => setEmailActive(false), 5000);
  };

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-container-max mx-auto px-margin-desktop py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-body-sm text-j-text-muted">
          <Link href="/" className="hover:text-jumia-orange">Home</Link>
          <ChevronRight size={14} />
          <span className="text-j-text">Help Center</span>
        </div>

        {/* Hero Banner with Search */}
        <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden mb-8">
          <div className="bg-jumia-orange px-6 py-12 md:py-16 text-center flex flex-col items-center gap-4 relative">
            <div className="absolute inset-0 bg-black/[0.03] pointer-events-none" />
            <h1 className="text-display-sm md:text-display-md font-bold text-white uppercase tracking-tight">Help Center</h1>
            <p className="text-body-lg text-white/90 font-medium">How can we help you today?</p>
            <div className="relative w-full max-w-2xl mt-4 z-10">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-j-text-muted" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setExpandedFaq(null);
                }}
                placeholder="Search topics, questions, or keywords..."
                className="w-full h-14 pl-14 pr-12 rounded border-none shadow-md text-body-md focus:ring-2 focus:ring-white outline-none placeholder:text-j-text-muted/50 font-medium text-j-text"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-j-text-muted hover:text-j-text transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="p-6 md:p-10 border-b border-j-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-label-bold font-bold uppercase text-j-text-muted">Help Categories</h2>
              {(activeCategory || searchQuery) && (
                <button 
                  onClick={resetFilters}
                  className="text-body-xs font-black text-jumia-orange hover:text-orange-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  Clear Filters <X size={12} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpTopics.map((topic) => {
                const isSelected = activeCategory === topic.id;
                return (
                  <button 
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className={`flex items-center gap-4 p-5 border rounded transition-all group text-left ${
                      isSelected 
                        ? 'border-jumia-orange bg-orange-50/5 ring-1 ring-jumia-orange shadow-sm' 
                        : 'border-j-outline-variant hover:border-jumia-orange bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 transition-transform ${
                      isSelected ? 'bg-jumia-orange text-white' : topic.color
                    } group-hover:scale-105`}>
                      <topic.icon size={22} />
                    </div>
                    <span className={`text-body-md font-bold uppercase transition-colors ${
                      isSelected ? 'text-jumia-orange' : 'text-j-text group-hover:text-jumia-orange'
                    }`}>
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion FAQs Section */}
          <div className="p-6 md:p-10 bg-j-background/30">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-body-lg font-black uppercase text-j-text tracking-tight">
                  {activeCategory 
                    ? `${helpTopics.find(t => t.id === activeCategory)?.label} FAQ` 
                    : searchQuery 
                    ? 'Search Results' 
                    : 'Frequently Asked Questions'}
                </h3>
                <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest bg-j-surface-container-low px-3 py-1 rounded">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Article' : 'Articles'}
                </span>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="p-12 text-center bg-white border border-j-outline-variant rounded space-y-4">
                  <Info size={40} className="text-j-text-muted mx-auto opacity-40 animate-pulse" />
                  <h4 className="font-bold text-body-md uppercase text-j-text">No articles found</h4>
                  <p className="text-body-sm text-j-text-muted max-w-sm mx-auto">
                    We couldn't find anything matching your search. Try resetting the filters or modifying your search terms.
                  </p>
                  <button 
                    onClick={resetFilters}
                    className="h-10 px-6 bg-jumia-orange text-white text-body-xs font-black uppercase tracking-wider rounded shadow hover:bg-orange-600 transition-all"
                  >
                    View All Topics
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaq === faq.question;
                    return (
                      <div 
                        key={faq.question} 
                        className={`bg-white border rounded transition-all duration-300 ${
                          isExpanded ? 'border-jumia-orange/40 shadow-sm' : 'border-j-outline-variant hover:border-j-text-muted/30'
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(faq.question)}
                          className="w-full p-5 flex items-center justify-between gap-4 text-left group"
                        >
                          <span className={`text-body-sm font-bold uppercase transition-colors leading-snug ${
                            isExpanded ? 'text-jumia-orange' : 'text-j-text group-hover:text-jumia-orange'
                          }`}>
                            {faq.question}
                          </span>
                          <ChevronDown 
                            size={18} 
                            className={`text-j-text-muted group-hover:text-jumia-orange shrink-0 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180 text-jumia-orange' : ''
                            }`}
                          />
                        </button>
                        
                        {isExpanded && (
                          <div className="px-5 pb-6 text-body-sm text-j-text-muted leading-relaxed border-t border-j-outline-variant/60 pt-4 bg-j-background/10">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
            <h2 className="text-label-bold font-bold uppercase tracking-tight">Still Need Help? Contact Us</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Live Chat */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-body-md font-bold uppercase text-j-text">Live Chat Support</h3>
              <p className="text-body-xs text-j-text-muted max-w-[200px] leading-relaxed">Connect immediately with a live support agent 24/7.</p>
              {chatActive ? (
                <span className="mt-2 text-j-success font-black uppercase text-[10px] tracking-wider bg-green-50 px-3 py-1.5 rounded animate-bounce">
                  Initiating Chat Window...
                </span>
              ) : (
                <button 
                  onClick={handleStartChat}
                  className="mt-2 text-jumia-orange font-black uppercase text-body-xs hover:underline tracking-widest"
                >
                  Start Chat Now
                </button>
              )}
            </div>

            {/* Telephone Call */}
            <div className="flex flex-col items-center text-center gap-3 border-y md:border-y-0 md:border-x border-j-outline-variant py-8 md:py-0">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-j-success shadow-inner">
                <Phone size={28} />
              </div>
              <h3 className="text-body-md font-bold uppercase text-j-text">Call Phone Center</h3>
              <p className="text-body-md font-black text-j-text tracking-tight">0700-6000-000</p>
              <p className="text-[9px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Mon-Sat: 8:00 AM - 8:00 PM</p>
            </div>

            {/* Email Form */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shadow-inner">
                <Mail size={28} />
              </div>
              <h3 className="text-body-md font-bold uppercase text-j-text">Submit Email Ticket</h3>
              <p className="text-body-xs text-j-text-muted max-w-[200px] leading-relaxed">Create a support ticket and receive answers within 24 hours.</p>
              {emailActive ? (
                <span className="mt-2 text-j-success font-black uppercase text-[10px] tracking-wider bg-green-50 px-3 py-1.5 rounded animate-bounce">
                  Ticket Form Ready!
                </span>
              ) : (
                <button 
                  onClick={handleSendEmail}
                  className="mt-2 text-jumia-orange font-black uppercase text-body-xs hover:underline tracking-widest"
                >
                  Send Email Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
