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
  const utils = api.useUtils();
  const { id } = useParams() as { id: string };
  const { data: order, isLoading } = api.order.get.useQuery({ orderId: id });

  const initiateReturn = api.return.initiate.useMutation({
    onSuccess: () => {
      utils.order.get.invalidate({ orderId: id });
      alert('Return request initiated successfully!');
    }
  });

  const cancelOrder = api.order.cancel.useMutation({
    onSuccess: () => {
      utils.order.get.invalidate({ orderId: id });
      alert('Order cancelled successfully!');
    },
    onError: (err) => {
      alert(`Cancellation failed: ${err.message}`);
    }
  });

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
    <div className="bg-[#F9F9FA] min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#F68B1E] transition-all font-black text-[10px] uppercase tracking-widest mb-8 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to My Orders
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
                <div className="p-6 md:p-10 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50/30">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-1 uppercase">Order #{order.id.substring(0, 12).toUpperCase()}</h1>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {(order.status === 'PENDING' || order.status === 'PAID') && (
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          cancelOrder.mutate({ orderId: order.id });
                        }
                      }}
                      disabled={cancelOrder.isLoading}
                      className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {cancelOrder.isLoading ? 'Processing...' : 'Cancel Order'}
                    </button>
                  )}
                  <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : order.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-orange-50 text-[#F68B1E] border-orange-100'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Package List */}
              <div className="p-6 md:p-10 space-y-12">
                {order.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-gray-100 text-[#F68B1E] rounded-2xl flex items-center justify-center shadow-sm">
                        <Package size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-gray-900">Package {idx + 1} of {order.packages.length}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Handled by Jumia Express</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Tracking Timeline */}
                      <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100/50">
                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-[0.2em] flex items-center gap-2">
                          <Truck size={14} className="text-[#F68B1E]" /> Timeline
                        </h4>
                        {pkg.shipments?.[0]?.events?.length ? (
                          <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white">
                            {pkg.shipments[0].events.map((event, eIdx) => (
                              <div key={event.id} className="relative pl-8">
                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all duration-500 ${eIdx === 0 ? 'bg-[#F68B1E] scale-125 ring-4 ring-orange-500/10' : 'bg-gray-200'}`} />
                                <div className={`text-[11px] font-black uppercase tracking-widest ${eIdx === 0 ? 'text-[#F68B1E]' : 'text-gray-900'}`}>{event.status.replace('_', ' ')}</div>
                                <div className="text-[10px] font-bold text-gray-400 mt-1">{format(new Date(event.createdAt), 'MMM dd, HH:mm')}</div>
                                {event.note && <div className="text-[10px] font-medium text-gray-400 mt-2 italic bg-white/50 p-2 rounded-lg">{event.note}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Clock size={32} className="text-gray-200 mb-3" />
                            <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Awaiting Fulfillment</p>
                          </div>
                        )}
                      </div>

                      {/* Items in Package */}
                      <div className="space-y-4">
                        {pkg.lines.map((line) => (
                          <div key={line.id} className="flex gap-4 bg-white border border-gray-50 p-4 rounded-2xl hover:border-orange-100 transition-all group">
                            <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                              <img 
                                src={(line.variant?.product as any)?.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'}
                                alt={line.variant?.product?.title}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                              <div>
                                <h5 className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-2 mb-1">{line.variant?.product?.title}</h5>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md border border-gray-100">QTY: {line.quantity}</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="font-black text-xs text-[#F68B1E]">₦ {Number(line.unitPrice).toLocaleString()}</p>
                                
                                {pkg.status === 'DELIVERED' && !line.isReturned && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        if (confirm('Initiate return?')) {
                                          initiateReturn.mutate({ orderLineId: line.id, reason: 'CUSTOMER_REQUEST' });
                                        }
                                      }}
                                      className="text-[9px] font-black uppercase text-[#264996] hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-50 transition-colors"
                                    >
                                      Return
                                    </button>
                                  </div>
                                )}
                                {line.isReturned && (
                                  <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-lg">Returned</span>
                                )}
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
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/[0.02] p-8">
              <h2 className="font-black text-[10px] uppercase mb-6 tracking-[0.2em] flex items-center gap-3 text-gray-900">
                <MapPin size={18} className="text-[#F68B1E]" /> Delivery Address
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Shipping to</p>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Main Delivery Hub</p>
                  <p className="text-[11px] font-bold text-gray-500 mt-2 leading-relaxed italic">Default dropoff specified at checkout.</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#1A1A1A] text-white rounded-[32px] shadow-2xl shadow-black/20 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-black text-[10px] uppercase tracking-[0.2em]">Summary</h2>
                <CreditCard size={18} className="text-[#F68B1E]" />
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span className="text-white">₦ {Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Delivery</span>
                    <span className="text-white">₦ {Number(order.shippingFee).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Paid</p>
                    <span className="text-2xl font-black tracking-tighter">₦ {Number(order.total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Paid via {order.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-8">
              <h2 className="font-black text-[10px] uppercase mb-6 tracking-[0.2em] flex items-center gap-3 text-gray-300">
                <AlertCircle size={18} /> Need Help?
              </h2>
              <div className="space-y-3">
                <Link href={`/disputes/new?orderId=${order.id}`} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl group hover:bg-orange-50 transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Open a dispute</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-[#F68B1E] transition-colors" />
                </Link>
                <Link href="/help" className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl group hover:bg-gray-100 transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Help center</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
