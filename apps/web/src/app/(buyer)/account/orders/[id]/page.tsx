'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { 
 ChevronLeft, 
 ChevronRight,
 Package, 
 MapPin, 
 CreditCard, 
 Clock, 
 CheckCircle2, 
 Truck, 
 AlertCircle,
 ExternalLink,
 ShieldCheck,
 RefreshCcw,
 XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/useToast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailPage() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { id } = useParams() as { id: string };
  const { data: order, isLoading } = api.order.get.useQuery({ orderId: id });
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const initiateReturn = api.return.initiate.useMutation({
    onSuccess: () => {
      utils.order.get.invalidate({ orderId: id });
      toast({ title: 'Return Initiated', message: 'Your return request has been submitted.', type: 'success' });
      setIsReturnModalOpen(false);
    }
  });

  const cancelOrder = api.order.cancel.useMutation({
    onSuccess: () => {
      utils.order.get.invalidate({ orderId: id });
      toast({ title: 'Order Cancelled', message: 'Your order has been cancelled successfully.', type: 'success' });
      setIsCancelModalOpen(false);
    },
    onError: (err) => {
      toast({ title: 'Cancellation Failed', message: err.message, type: 'error' });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-6 w-48 rounded-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-sm" />
            <Skeleton className="h-96 w-full rounded-sm" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-sm" />
            <Skeleton className="h-64 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-j-background border-2 border-dashed border-j-border rounded-full flex items-center justify-center mx-auto mb-8 text-j-border">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-j-text uppercase tracking-tight mb-4">Order Not Found</h2>
        <Link href="/account/orders" className="text-jumia-orange font-black uppercase tracking-widest hover:underline text-xs">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-j-background">
      <div className="max-w-[1184px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-j-text-muted uppercase tracking-widest">
          <Link href="/account/orders" className="inline-flex items-center gap-2 hover:text-jumia-orange transition-colors group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </Link>
          <span className="opacity-20">/</span>
          <span className="text-j-text">Order Details</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-j-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-j-background">
                <div className="flex flex-col gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-j-text tracking-tight uppercase leading-none">Order #{order.id.substring(0, 12).toUpperCase()}</h1>
                  <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Placed on {format(new Date(order.createdAt), 'dd MMMM yyyy')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {(order.status === 'PENDING_PAYMENT' || order.status === 'PAID') && (
                    <button 
                      onClick={() => setIsCancelModalOpen(true)}
                      className="px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest border border-j-error text-j-error hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <XCircle size={14} />
                      Cancel Order
                    </button>
                  )}
                  <span className={`px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest border ${
                    order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                    ? 'bg-green-50 text-j-success border-green-100' 
                    : order.status === 'CANCELLED'
                    ? 'bg-red-50 text-j-error border-red-100'
                    : 'bg-orange-50 text-jumia-orange border-orange-100'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Package List */}
              <div className="p-6 md:p-8 space-y-12">
                {order.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-j-border pb-4">
                      <div className="w-10 h-10 bg-j-background rounded-sm text-jumia-orange flex items-center justify-center border border-j-border">
                        <Package size={20} />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-tight text-j-text">Package {idx + 1} of {order.packages.length}</h3>
                        <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Shipping via Jumia Logistics</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Tracking Timeline */}
                      <div className="bg-j-background rounded-sm p-6 border border-j-border relative">
                        <div className="flex items-center gap-3 mb-6">
                          <Truck size={16} className="text-jumia-orange" />
                          <h4 className="text-[10px] font-black uppercase text-j-text tracking-widest">Delivery Tracking</h4>
                        </div>
                        {pkg.shipments?.[0]?.events?.length ? (
                          <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-j-border">
                            {pkg.shipments[0].events.map((event, eIdx) => (
                              <div key={event.id} className="relative pl-8">
                                <div className={`absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-white flex items-center justify-center transition-all ${eIdx === 0 ? 'bg-jumia-orange scale-110 shadow-sm' : 'bg-j-border'}`} />
                                <div className={`text-[10px] font-black uppercase tracking-tight ${eIdx === 0 ? 'text-jumia-orange' : 'text-j-text-muted'}`}>{event.status.replace('_', ' ')}</div>
                                <div className="text-[9px] font-black text-j-text-muted/60 mt-0.5 uppercase tracking-tighter">{format(new Date(event.createdAt), 'dd MMM • HH:mm')}</div>
                                {event.note && <div className="text-[10px] font-bold text-j-text-muted mt-2 italic bg-white p-2 rounded-sm border border-j-border border-dashed">{event.note}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                            <Clock size={32} className="text-j-text-muted mb-3" />
                            <p className="text-[9px] font-black uppercase text-j-text-muted tracking-widest">Preparing Shipment</p>
                          </div>
                        )}
                      </div>

                      {/* Items in Package */}
                      <div className="space-y-4">
                        {pkg.lines.map((line, lIdx) => (
                          <div key={line.id} className="flex gap-4 bg-white p-4 rounded-sm border border-j-border hover:border-jumia-orange/30 transition-all group/item shadow-sm">
                            <div className="w-20 h-20 bg-j-background rounded-sm flex-shrink-0 relative overflow-hidden p-2 border border-j-border">
                              <Image 
                                src={(line.variant?.product as any)?.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                                alt={line.variant?.product?.title || 'Product'}
                                fill
                                sizes="80px"
                                className="object-contain p-2 group-hover/item:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                              <div>
                                <h5 className="text-[10px] font-black text-j-text leading-tight uppercase tracking-tight line-clamp-2 mb-1">{line.variant?.product?.title}</h5>
                                <span className="text-[8px] font-black uppercase bg-j-background text-j-text-muted px-2 py-0.5 rounded-sm border border-j-border tracking-widest">Qty: {line.quantity}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <p className="font-black text-xs text-jumia-orange tracking-tight">₦ {Number(line.unitPrice).toLocaleString()}</p>
                                
                                {pkg.status === 'DELIVERED' && !line.isReturned && (
                                  <button 
                                    onClick={() => {
                                      setSelectedLineId(line.id);
                                      setIsReturnModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 text-[8px] font-black uppercase text-jumia-orange hover:bg-orange-50 px-3 py-1.5 rounded-sm border border-jumia-orange/20 transition-all"
                                  >
                                    <RefreshCcw size={10} />
                                    Return Item
                                  </button>
                                )}
                                {line.isReturned && (
                                  <span className="text-[8px] font-black uppercase text-j-success bg-green-50 px-2 py-1 rounded-sm border border-green-100">Returned</span>
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
          <div className="space-y-8">
            {/* Delivery Info */}
            <div className="bg-white rounded-sm border border-j-border shadow-sm p-6">
              <h2 className="text-[11px] font-black uppercase mb-6 flex items-center gap-3 text-j-text tracking-widest">
                <MapPin size={18} className="text-jumia-orange" /> Delivery Information
              </h2>
              <div className="space-y-4">
                <div className="bg-j-background p-4 rounded-sm border border-j-border border-dashed">
                  <p className="text-[9px] font-black uppercase text-j-text-muted mb-2 tracking-widest opacity-60">Shipping Address</p>
                  <p className="text-[11px] font-black text-j-text uppercase tracking-tight">{order.addressId ? 'Selected Delivery Address' : 'Main Distribution Center'}</p>
                  <p className="text-[10px] font-bold text-j-text-muted mt-2 leading-relaxed opacity-80 italic">Standard door delivery to your preferred location.</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-j-text text-white rounded-sm shadow-xl border border-j-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
                <h2 className="text-[10px] font-black uppercase tracking-widest opacity-60">Order Summary</h2>
                <CreditCard size={18} className="text-jumia-orange" />
              </div>
              <div className="p-6 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-white/40">
                    <span>Subtotal</span>
                    <span className="text-white">₦ {Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-white/40">
                    <span>Shipping Fee</span>
                    <span className="text-white">₦ {Number(order.shippingFee).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase text-jumia-orange mb-1 tracking-widest">Total Amount</p>
                    <span className="text-2xl font-black tracking-tight">₦ {Number(order.total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-sm p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-j-success/20 rounded-sm flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-j-success" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-white/80 tracking-tight">Paid via {order.paymentMethod}</span>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-0.5 italic">Payment Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-sm border border-j-border p-6 shadow-sm">
              <h2 className="text-[11px] font-black uppercase mb-6 flex items-center gap-3 text-j-text-muted tracking-widest">
                <AlertCircle size={18} /> Customer Support
              </h2>
              <div className="space-y-3">
                <Link href={`/disputes/new?orderId=${order.id}`} className="flex items-center justify-between p-4 bg-j-background rounded-sm group/btn hover:border-jumia-orange/30 border border-j-border transition-all">
                  <span className="text-[10px] font-black uppercase text-j-text tracking-widest">Open Dispute</span>
                  <ChevronRight size={14} className="text-j-text-muted group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/help" className="flex items-center justify-between p-4 bg-j-background rounded-sm group/btn border border-j-border transition-all">
                  <span className="text-[10px] font-black uppercase text-j-text-muted tracking-widest opacity-60">Help Center</span>
                  <ChevronRight size={14} className="text-j-text-muted opacity-40" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onConfirm={() => cancelOrder.mutate({ orderId: order.id })}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel Order"
        variant="danger"
      />

      <ConfirmModal 
        isOpen={isReturnModalOpen}
        onCancel={() => setIsReturnModalOpen(false)}
        onConfirm={() => {
          if (selectedLineId) {
            initiateReturn.mutate({ orderLineId: selectedLineId, reason: 'CUSTOMER_REQUEST' });
          }
        }}
        title="Return Item?"
        message="Would you like to initiate a return for this item? Our team will contact you for pickup."
        confirmLabel="Confirm Return"
        variant="warning"
      />
    </div>
  );
}
