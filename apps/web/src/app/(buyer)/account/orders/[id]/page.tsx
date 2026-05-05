'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../../../trpc/react';
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
    return <div className="container py-20 text-center font-extrabold text-gray-500">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="container py-20 text-center select-none">
        <h2 className="text-xl font-extrabold mb-4 text-gray-900 leading-tight">Order not found</h2>
        <Link href="/account/orders" className="text-[#F68B1E] font-extrabold text-sm hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-6">
        <Link href="/account/orders" className="flex items-center gap-1 text-gray-500 hover:text-[#F68B1E] transition-colors font-bold text-xs mb-6 select-none">
          <ChevronLeft size={16} />
          Back to My Orders
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 md:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight mb-1 leading-tight select-none uppercase">Order #{order.id.toUpperCase()}</h1>
                  <p className="text-xs md:text-sm font-medium text-gray-400">Placed on {format(new Date(order.createdAt), 'PPPP')}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-tight border w-fit ${
                  order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : order.status === 'CANCELLED'
                    ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-orange-50 text-orange-700 border-orange-100'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              {/* Package List */}
              <div className="space-y-8">
                {order.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-orange-50 text-[#F68B1E] rounded-xl flex items-center justify-center border border-orange-100/60">
                        <Package size={20} />
                      </div>
                      <h3 className="font-extrabold text-sm md:text-base tracking-tight text-gray-800">Package {idx + 1} of {order.packages.length}</h3>
                      <span className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-xl text-gray-500 uppercase font-black tracking-tight select-none">
                        {pkg.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tracking Timeline */}
                      <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100/80">
                        <h4 className="text-xs font-black uppercase text-gray-400 mb-5 tracking-wide flex items-center gap-1.5 select-none">
                          <Truck size={15} /> Tracking History
                        </h4>
                        {pkg.shipments?.[0]?.events?.length ? (
                          <div className="space-y-5 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            {pkg.shipments[0].events.map((event, eIdx) => (
                              <div key={event.id} className="relative pl-7 select-text">
                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300 ${eIdx === 0 ? 'bg-[#F68B1E] scale-110 ring-4 ring-orange-100/50' : 'bg-gray-300'}`} />
                                <div className={`text-xs font-extrabold tracking-tight ${eIdx === 0 ? 'text-[#F68B1E]' : 'text-gray-800'}`}>{event.status.replace('_', ' ')}</div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">{format(new Date(event.createdAt), 'dd MMM, HH:mm')}</div>
                                {event.note && <div className="text-[10px] font-medium text-gray-400 mt-1 italic leading-relaxed">{event.note}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 font-medium italic py-3 select-none">Waiting for pickup by courier...</div>
                        )}
                      </div>

                      {/* Items in Package */}
                      <div className="space-y-3">
                        {pkg.lines.map((line) => (
                          <div key={line.id} className="flex gap-3 bg-gray-50/20 hover:bg-gray-50/40 duration-200 transition-all p-3 rounded-xl border border-transparent hover:border-gray-100/60 select-none">
                            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-1.5">
                              <img 
                                src={(line.variant?.product as any)?.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'}
                                alt={line.variant?.product?.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <h5 className="text-xs md:text-sm font-extrabold text-gray-900 leading-tight line-clamp-2 hover:text-[#F68B1E] transition-colors cursor-pointer">{line.variant?.product?.title}</h5>
                              <div className="flex justify-between items-end mt-1">
                                <p className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded w-fit border border-gray-100/50">Qty: {line.quantity}</p>
                                <p className="text-sm font-black text-[#F68B1E]">₦{Number(line.unitPrice).toLocaleString()}</p>
                              </div>
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
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 shadow-md select-none">
              <h2 className="font-extrabold text-xs uppercase mb-4 tracking-wide flex items-center gap-2 text-gray-900">
                <MapPin size={16} className="text-[#F68B1E]" /> Delivery Address
              </h2>
              <div className="text-xs md:text-sm font-medium space-y-1 text-gray-600">
                <p className="font-extrabold text-gray-800">Shipping Address</p>
                <p>Default delivery dropoff specified at checkout.</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 shadow-md select-none">
              <h2 className="font-extrabold text-xs uppercase mb-4 tracking-wide flex items-center gap-2 text-gray-900">
                <CreditCard size={16} className="text-[#F68B1E]" /> Payment Summary
              </h2>
              <div className="space-y-2 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-800">₦{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Fee</span>
                  <span className="font-bold text-gray-800">₦{Number(order.shippingFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 font-extrabold text-base md:text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#F68B1E]">₦{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-500 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100/50">
                  <CheckCircle2 size={14} className="text-green-500" />
                  Paid via {order.paymentMethod.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 shadow-md select-none">
              <h2 className="font-extrabold text-xs uppercase mb-4 tracking-wide flex items-center gap-2 text-gray-400">
                <AlertCircle size={16} /> Need Help?
              </h2>
              <div className="space-y-2 text-sm font-extrabold">
                <Link href={`/disputes/new?orderId=${order.id}`} className="block text-[#F68B1E] hover:underline">
                  Open a dispute
                </Link>
                <Link href="/help" className="block text-gray-600 hover:underline">
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
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .flex-col { flex-direction: column; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
