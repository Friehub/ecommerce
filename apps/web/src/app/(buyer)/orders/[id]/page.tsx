'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: order, isLoading } = api.order.get.useQuery({ orderId: id });

  if (isLoading) {
    return <div className="container py-20 text-center text-gray-500">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-xl font-bold mb-4">Order not found</h2>
        <Link href="/orders" className="text-[#F68B1E] font-bold">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container py-6">
        <Link href="/orders" className="flex items-center gap-1 text-gray-500 hover:text-[#F68B1E] transition-colors text-sm mb-6">
          <ChevronLeft size={16} />
          Back to My Orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b">
                <div>
                  <h1 className="text-xl font-bold mb-1">Order #{order.id.toUpperCase()}</h1>
                  <p className="text-sm text-gray-500">Placed on {format(new Date(order.createdAt), 'PPPP')}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${
                  order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                    ? 'bg-green-100 text-green-700' 
                    : order.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-[#F68B1E]/10 text-[#F68B1E]'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              {/* Package List */}
              <div className="space-y-8">
                {order.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Package size={18} />
                      </div>
                      <h3 className="font-bold">Package {idx + 1} of {order.packages.length}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase font-bold tracking-tight">
                        {pkg.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tracking Timeline */}
                      <div className="bg-gray-50 rounded p-4 border border-gray-100">
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider flex items-center gap-1">
                          <Truck size={14} /> Tracking History
                        </h4>
                        {pkg.shipments?.[0]?.events?.length ? (
                          <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                            {pkg.shipments[0].events.map((event, eIdx) => (
                              <div key={event.id} className="relative pl-6">
                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white ${eIdx === 0 ? 'bg-[#F68B1E]' : 'bg-gray-300'}`} />
                                <div className="text-xs font-bold">{event.status.replace('_', ' ')}</div>
                                <div className="text-[10px] text-gray-500">{format(new Date(event.createdAt), 'dd MMM, HH:mm')}</div>
                                {event.note && <div className="text-[10px] text-gray-400 mt-0.5 italic">{event.note}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic py-2">Waiting for pickup by courier...</div>
                        )}
                      </div>

                      {/* Items in Package */}
                      <div className="space-y-3">
                        {pkg.lines.map((line) => (
                          <div key={line.id} className="flex gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium line-clamp-2">{line.variant.product.title}</h5>
                              <p className="text-xs text-gray-500 mt-0.5">Qty: {line.quantity}</p>
                              <p className="text-sm font-bold mt-1">₦{Number(line.unitPrice).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="font-bold text-sm uppercase mb-4 tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-[#F68B1E]" /> Delivery Address
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-bold">Shipping Address</p>
                <p className="text-gray-600">Refer to checkout address details</p>
                {/* In a real app we'd fetch the address details via the addressId */}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="font-bold text-sm uppercase mb-4 tracking-wider flex items-center gap-2">
                <CreditCard size={16} className="text-[#F68B1E]" /> Payment Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span>₦{Number(order.shippingFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total</span>
                  <span>₦{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <CheckCircle2 size={14} className="text-green-500" />
                  Paid via {order.paymentMethod.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="font-bold text-sm uppercase mb-4 tracking-wider flex items-center gap-2 text-gray-400">
                <AlertCircle size={16} /> Need Help?
              </h2>
              <div className="space-y-2">
                <Link href={`/disputes/new?orderId=${order.id}`} className="block text-sm text-[#F68B1E] font-bold hover:underline">
                  Open a dispute
                </Link>
                <Link href="/help" className="block text-sm text-gray-600 hover:underline">
                  Frequently asked questions
                </Link>
              </div>
            </div>
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
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .flex-col { flex-direction: column; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-green-100 { background-color: #dcfce7; }
        .bg-red-100 { background-color: #fee2e2; }
        .bg-gray-300 { background-color: #d1d5db; }
        .bg-gray-200 { background-color: #e5e7eb; }
        .text-green-700 { color: #15803d; }
        .text-red-700 { color: #b91c1c; }
        .text-[#F68B1E] { color: #F68B1E; }
        .text-gray-900 { color: #111827; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .border-gray-100 { border-color: #f3f4f6; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-2 { padding: 0.5rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .pb-6 { padding-bottom: 1.5rem; }
        .pb-12 { padding-bottom: 3rem; }
        .pt-2 { padding-top: 0.5rem; }
        .pt-4 { padding-top: 1rem; }
        .pl-6 { padding-left: 1.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-0.5 { margin-top: 0.125rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-4 { margin-top: 1rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-tight { letter-spacing: -0.025em; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .sm\\:flex-row { flex-direction: row; }
          .sm\\:items-center { align-items: center; }
        }
        @media (min-width: 768px) {
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\\:col-span-2 { grid-column: span 2 / span 2; }
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
}
