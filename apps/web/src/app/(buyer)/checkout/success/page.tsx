'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border max-w-[500px] w-full text-center">
      <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={48} />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for shopping with Jumia. Your order <span className="font-bold text-gray-800">#{orderId}</span> has been received and is being processed.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Package className="text-gray-400" size={18} />
          <span className="text-gray-600">You will receive a confirmation email shortly.</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle className="text-green-500" size={18} />
          <span className="text-gray-600">Our agent will contact you for delivery.</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => router.push('/')}
          className="flex-1 h-12 border-2 border-[#F68B1E] text-[#F68B1E] rounded font-bold uppercase hover:bg-[#F68B1E]/5 transition-all flex items-center justify-center gap-2"
        >
          Track Order
          <ArrowRight size={18} />
        </button>
        <button 
          onClick={() => router.push('/')}
          className="flex-1 h-12 bg-[#F68B1E] text-white rounded font-bold uppercase hover:bg-[#E07A1A] transition-all flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Go Home
        </button>
      </div>

      <style jsx>{`
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-green-50 { background-color: #f0fdf4; }
        .text-green-500 { color: #22c55e; }
        .p-8 { padding: 2rem; }
        .rounded-lg { border-radius: 8px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .border { border: 1px solid #e5e7eb; }
        .w-20 { width: 5rem; }
        .h-20 { height: 5rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .text-2xl { font-size: 1.5rem; }
        .font-bold { font-weight: 700; }
        .text-gray-900 { color: #111827; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-400 { color: #9ca3af; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .h-12 { height: 3rem; }
        .border-2 { border-width: 2px; }
        .border-\[\#F68B1E\] { border-color: #f68b1e; }
        .text-\[\#F68B1E\] { color: #f68b1e; }
        .bg-\[\#F68B1E\] { background-color: #f68b1e; }
        .text-white { color: #ffffff; }
        .uppercase { text-transform: uppercase; }
        .transition-all { transition: all 0.2s ease; }
        @media (min-width: 640px) {
          .sm\:flex-row { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
