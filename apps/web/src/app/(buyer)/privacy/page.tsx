'use client';

import React from 'react';
import { ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyTermsPage() {
  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/" className="hover:text-[#F68B1E] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Terms & Privacy</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 md:p-8 flex items-center gap-4 shadow-md mb-8">
          <div className="w-14 h-14 bg-orange-50 text-[#F68B1E] rounded-full flex items-center justify-center border border-orange-100/60 flex-shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight mb-1">Privacy & Terms of Service</h1>
            <p className="text-xs md:text-sm font-medium text-gray-400">Effective Date: May 2026. Review our legal commitments and standard user terms.</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 md:p-10 shadow-md space-y-8 select-text">
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileText size={18} className="text-[#F68B1E]" />
              <h2 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight">1. General Terms</h2>
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-600 leading-relaxed">
              By accessing the Jumia Clone platform, you confirm that you agree to the conditions, notices, and legal disclosures set out within these General Terms. 
              The platform facilitates buying and selling between multi-vendor sellers and individual buyers.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileText size={18} className="text-[#F68B1E]" />
              <h2 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight">2. Privacy & Data Integrity</h2>
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-600 leading-relaxed">
              We collect identity information (e.g., your first name, last name, phone number, and delivery addresses) to perform direct transaction fulfillment. Your details will not be shared with unauthorized external processing networks. All passwords and authentication parameters are securely hashed using high-grade cryptographic measures.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileText size={18} className="text-[#F68B1E]" />
              <h2 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight">3. Secure Payments & Financial Verification</h2>
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-600 leading-relaxed">
              Payments processed across our network are securely verified through authorized Paystack interfaces. Escrow processing maintains all balances until deliveries pass basic client verification. This protects individual buyers from fraudulent product distribution.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
