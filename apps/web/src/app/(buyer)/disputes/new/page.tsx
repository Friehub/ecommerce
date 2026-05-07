'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { AlertCircle, ChevronLeft, Send, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function NewDisputePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const { data: order, isLoading } = api.order.get.useQuery(
    { orderId: orderId || '' },
    { enabled: !!orderId }
  );

  const createDispute = api.dispute.openDispute.useMutation({
    onSuccess: (dispute) => {
      router.push(`/disputes/${dispute.id}`);
    }
  });

  if (!orderId) {
    return (
      <div className="container py-20 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-4">No Order ID provided</h2>
        <Link href="/account/orders" className="text-[#F68B1E] font-bold hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container py-20 text-center font-bold text-gray-500">Loading order details...</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDispute.mutate({
      orderId: orderId,
      reason: `${reason}: ${description}`
    });
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12">
      <div className="container py-12 max-w-2xl">
        <Link href={`/account/orders/${orderId}`} className="flex items-center gap-1 text-gray-500 hover:text-[#F68B1E] transition-colors font-bold text-xs mb-8 select-none">
          <ChevronLeft size={16} />
          Back to Order Details
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Open a Dispute</h1>
              <p className="text-xs font-medium text-gray-400 mt-2">Order #{orderId.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Reason for Dispute</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F68B1E]/20 focus:border-[#F68B1E] text-sm font-bold transition-all"
              >
                <option value="">Select a reason...</option>
                <option value="ITEM_NOT_RECEIVED">Item not received</option>
                <option value="WRONG_ITEM">Wrong item received</option>
                <option value="DAMAGED_ITEM">Item damaged on arrival</option>
                <option value="NOT_AS_DESCRIBED">Item not as described</option>
                <option value="PARTIAL_DELIVERY">Missing items from package</option>
                <option value="OTHER">Other issue</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Detailed Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Describe your issue in detail..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F68B1E]/20 focus:border-[#F68B1E] text-sm font-medium transition-all"
              />
            </div>

            <div className="bg-orange-50 border border-orange-100/60 p-4 rounded-xl flex gap-3">
              <AlertCircle size={18} className="text-[#F68B1E] shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                Your dispute will be sent to the seller first. If not resolved within 72 hours, it will be escalated to Jumia Support automatically.
              </p>
            </div>

            <button 
              type="submit"
              disabled={createDispute.isLoading}
              className="w-full bg-[#282828] hover:bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-black/10 active:scale-95 disabled:opacity-50"
            >
              {createDispute.isLoading ? 'Opening Dispute...' : (
                <>
                  <Send size={16} />
                  Initiate Dispute
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
      `}</style>
    </div>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center font-bold text-gray-500">Loading dispute interface...</div>}>
      <NewDisputePageContent />
    </Suspense>
  );
}
