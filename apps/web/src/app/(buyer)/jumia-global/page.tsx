'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ChevronRight, ShoppingBag } from 'lucide-react';

export default function JumiaGlobalPage() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-12">
      <div className="container py-4">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/" className="text-gray-500 hover:text-[#F68B1E] transition-colors text-xs">Home</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-900">Jumia Global</span>
        </div>

        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[#2196F3] p-4 text-white flex items-center gap-3">
            <Globe size={24} />
            <h1 className="text-xl font-bold uppercase tracking-tight">Jumia Global</h1>
          </div>

          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">International Products Delivered to You</h2>
            <p className="text-gray-500 mt-2 mb-8">Bringing the world's best brands to your doorstep.</p>
            <Link href="/" className="px-8 py-3 bg-[#F68B1E] text-white rounded font-bold uppercase hover:bg-[#E07A1A] transition-colors">
              Explore Global Brands
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .bg-white { background-color: #ffffff; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .p-20 { padding: 5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .text-gray-900 { color: #111827; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-white { color: #ffffff; }
      `}</style>
    </div>
  );
}
