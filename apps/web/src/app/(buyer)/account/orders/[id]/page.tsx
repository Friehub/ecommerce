'use client';

import Image from 'next/image';
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
 <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
 <Skeleton className="h-4 w-48 rounded-lg" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <Skeleton className="h-64 w-full rounded-[40px]" />
 <Skeleton className="h-96 w-full rounded-[40px]" />
 </div>
 <div className="space-y-6">
 <Skeleton className="h-48 w-full rounded-[40px]" />
 <Skeleton className="h-64 w-full rounded-[40px]" />
 </div>
 </div>
 </div>
 );
 }

 if (!order) {
 return (
 <div className="max-w-6xl mx-auto px-4 py-24 text-center">
 <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter mb-4">Order Not Found</h2>
 <Link href="/account/orders" className="text-primary-container font-black uppercase tracking-widest hover:underline">Back to My Orders</Link>
 </div>
 );
 }

 return (
 <div className="min-h-screen pb-24 bg-surface-container-lowest/50">
 <div className="max-w-6xl mx-auto px-4 py-12">
 {/* Breadcrumb with Fade Mask */}
 <div className="relative mb-10 overflow-hidden">
 <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto scrollbar-hide pr-12">
 <Link href="/account/orders" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-all font-black text-[10px] uppercase tracking-[0.2em] group">
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Back to My Orders
 </Link>
 <span className="text-on-surface-variant/20">/</span>
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 italic">Order Details</span>
 </div>
 <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-surface-container-lowest/50 to-transparent pointer-events-none" />
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 <div className="bg-surface-container-low rounded-[48px] border-4 border-surface-container-lowest shadow-soft overflow-hidden">
 <div className="p-8 md:p-12 border-b-2 border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-surface-container-low/50">
 <div className="flex flex-col gap-2">
 <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tighter uppercase leading-none">Order #{order.id.substring(0, 12).toUpperCase()}</h1>
 <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-60 italic">Committed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
 </div>
 <div className="flex flex-wrap items-center gap-4">
 {(order.status === 'PENDING' || order.status === 'PAID') && (
 <button 
 onClick={() => setIsCancelModalOpen(true)}
 className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-error/20 text-error hover:bg-error/10 transition-all active:scale-95 flex items-center gap-2 group"
 >
 <XCircle size={14} className="group-hover:rotate-90 transition-transform" />
 Abort Order
 </button>
 )}
 <span className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-2 ${
 order.status === 'DELIVERED' || order.status === 'COMPLETED' 
 ? 'bg-success-container/10 text-success border-success/20' 
 : order.status === 'CANCELLED'
 ? 'bg-error-container/10 text-error border-error/20'
 : 'bg-primary-container/10 text-primary-container border-primary-container/20'
 }`}>
 {order.status.replace('_', ' ')}
 </span>
 </div>
 </div>

 {/* Package List */}
 <div className="p-8 md:p-12 space-y-16">
 {order.packages.map((pkg, idx) => (
 <div key={pkg.id} className="space-y-8">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-surface-container rounded-[20px] text-primary-container flex items-center justify-center border-2 border-outline-variant/30 shadow-lg">
 <Package size={28} />
 </div>
 <div className="flex flex-col">
 <h3 className="text-lg font-black uppercase tracking-tighter text-on-surface leading-none">Package {idx + 1} of {order.packages.length}</h3>
 <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1 opacity-60">Verified Logistics Hub</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 {/* Tracking Timeline */}
 <div className="bg-surface-container-lowest/50 rounded-[32px] p-8 border-2 border-outline-variant/30 relative">
 <div className="flex items-center gap-3 mb-8">
 <Truck size={18} className="text-primary-container" />
 <h4 className="text-[10px] font-black uppercase text-on-surface tracking-[0.3em]">Logistic Timeline</h4>
 </div>
 {pkg.shipments?.[0]?.events?.length ? (
 <div className="space-y-8 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
 {pkg.shipments[0].events.map((event, eIdx) => (
 <div key={event.id} className="relative pl-10 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${eIdx * 100}ms` }}>
 <div className={`absolute left-0 top-1 w-[20px] h-[20px] rounded-full border-4 border-surface-container-lowest flex items-center justify-center transition-all duration-700 ${eIdx === 0 ? 'bg-primary-container scale-125 shadow-lg shadow-primary-container/30' : 'bg-outline-variant opacity-40'}`} />
 <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${eIdx === 0 ? 'text-primary-container' : 'text-on-surface-variant'}`}>{event.status.replace('_', ' ')}</div>
 <div className="text-[9px] font-black text-on-surface-variant/40 mt-1 uppercase tracking-widest">{format(new Date(event.createdAt), 'MMM dd • HH:mm')}</div>
 {event.note && <div className="text-[10px] font-medium text-on-surface-variant mt-3 italic bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">{event.note}</div>}
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
 <Clock size={40} className="text-on-surface-variant mb-4" />
 <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.3em]">Awaiting Processing</p>
 </div>
 )}
 </div>

 {/* Items in Package */}
 <div className="space-y-6">
 {pkg.lines.map((line, lIdx) => (
 <div key={line.id} className="flex gap-5 bg-surface-container-lowest p-5 rounded-[28px] border-2 border-outline-variant/30 hover:border-primary-container/30 transition-all group/item shadow-soft animate-in fade-in slide-in-from-right-2" style={{ animationDelay: `${lIdx * 100}ms` }}>
 <div className="w-24 h-24 bg-surface-container-low rounded-[20px] flex-shrink-0 relative overflow-hidden p-4 border border-outline-variant/10">
 <Image 
 src={(line.variant?.product as any)?.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
 alt={line.variant?.product?.title || 'Product'}
 fill
 sizes="100px"
 className="object-contain p-4 group-hover/item:scale-110 transition-transform duration-700"
 />
 </div>
 <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
 <div>
 <h5 className="text-[11px] font-black text-on-surface leading-tight uppercase tracking-tight line-clamp-2 mb-2">{line.variant?.product?.title}</h5>
 <div className="flex items-center gap-3">
 <span className="text-[8px] font-black uppercase bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg border border-outline-variant/20 tracking-widest">Units: {line.quantity}</span>
 </div>
 </div>
 <div className="flex justify-between items-center mt-4">
 <p className="font-black text-sm text-primary-container tracking-tighter">₦ {Number(line.unitPrice).toLocaleString()}</p>
 
 {pkg.status === 'DELIVERED' && !line.isReturned && (
 <button 
 onClick={() => {
 setSelectedLineId(line.id);
 setIsReturnModalOpen(true);
 }}
 className="flex items-center gap-2 text-[9px] font-black uppercase text-primary-container hover:bg-primary-container/10 px-4 py-2 rounded-xl border-2 border-primary-container/10 transition-all group/btn"
 >
 <RefreshCcw size={12} className="group-hover/btn:rotate-180 transition-transform duration-700" />
 Recall Item
 </button>
 )}
 {line.isReturned && (
 <span className="text-[9px] font-black uppercase text-success bg-success-container/10 px-3 py-1.5 rounded-xl border border-success/20">Archived</span>
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
 {/* Delivery Details */}
 <div className="bg-surface-container-low rounded-[40px] border-4 border-surface-container-lowest shadow-soft p-8">
 <h2 className="text-[10px] font-black uppercase mb-8 tracking-[0.3em] flex items-center gap-4 text-on-surface">
 <MapPin size={20} className="text-primary-container" /> Distribution
 </h2>
 <div className="space-y-4">
 <div className="bg-surface-container-lowest/50 p-6 rounded-[28px] border-2 border-outline-variant/30 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/5 rounded-full blur-2xl" />
 <p className="text-[9px] font-black uppercase text-on-surface-variant mb-2 tracking-[0.2em] opacity-60 italic">Dropoff Point</p>
 <p className="text-xs font-black text-on-surface uppercase tracking-tight">Main Distribution Center</p>
 <p className="text-[10px] font-bold text-on-surface-variant mt-3 leading-relaxed opacity-70">Strategic hub fulfillment for ultra-fast delivery.</p>
 </div>
 </div>
 </div>

 {/* Payment Summary */}
 <div className="bg-on-surface text-white rounded-[40px] shadow-2xl border-4 border-surface-container-low relative overflow-hidden">
 <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/10 rounded-full blur-[80px]" />
 <div className="p-8 border-b-2 border-white/10 flex items-center justify-between relative z-10">
 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Financial Invoice</h2>
 <CreditCard size={20} className="text-primary-container" />
 </div>
 <div className="p-8 space-y-8 relative z-10">
 <div className="space-y-5">
 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
 <span>Base Value</span>
 <span className="text-white">₦ {Number(order.subtotal).toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
 <span>Logistics Fee</span>
 <span className="text-white">₦ {Number(order.shippingFee).toLocaleString()}</span>
 </div>
 </div>
 
 <div className="pt-8 border-t-2 border-white/10 flex justify-between items-end">
 <div>
 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary-container mb-2 italic">Gross Settlement</p>
 <span className="text-3xl font-black tracking-tighter">₦ {Number(order.total).toLocaleString()}</span>
 </div>
 </div>

 <div className="bg-white/5 border-2 border-white/10 rounded-[24px] p-5 flex items-center gap-4">
 <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
 <CheckCircle2 size={20} className="text-success" />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Secured via {order.paymentMethod}</span>
 <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mt-0.5 italic">Transaction Authenticated</span>
 </div>
 </div>
 </div>
 </div>

 {/* Help Section */}
 <div className="bg-surface-container-low rounded-[40px] border-4 border-surface-container-lowest p-8 shadow-soft">
 <h2 className="text-[10px] font-black uppercase mb-8 tracking-[0.3em] flex items-center gap-4 text-on-surface-variant opacity-40">
 <AlertCircle size={20} /> Resolution Hub
 </h2>
 <div className="space-y-4">
 <Link href={`/disputes/new?orderId=${order.id}`} className="flex items-center justify-between p-5 bg-surface-container-lowest/50 rounded-[24px] group/btn hover:bg-primary-container/10 border-2 border-transparent hover:border-primary-container/20 transition-all">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">Initiate Dispute</span>
 <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center group-hover/btn:bg-primary-container transition-all">
 <ChevronRight size={14} className="text-on-surface-variant group-hover/btn:text-white transition-colors" />
 </div>
 </Link>
 <Link href="/help" className="flex items-center justify-between p-5 bg-surface-container-lowest/50 rounded-[24px] group/btn hover:bg-surface-container-high transition-all border-2 border-transparent">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Help Center</span>
 <ChevronRight size={14} className="text-on-surface-variant opacity-20" />
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Modals */}
 <ConfirmModal 
 isOpen={isCancelModalOpen}
 onClose={() => setIsCancelModalOpen(false)}
 onConfirm={() => cancelOrder.mutate({ orderId: order.id })}
 title="Abort Transaction?"
 message="Are you certain you want to terminate this order? This action will halt logistics immediately."
 confirmLabel="Confirm Abortion"
 type="danger"
 />

 <ConfirmModal 
 isOpen={isReturnModalOpen}
 onClose={() => setIsReturnModalOpen(false)}
 onConfirm={() => {
 if (selectedLineId) {
 initiateReturn.mutate({ orderLineId: selectedLineId, reason: 'CUSTOMER_REQUEST' });
 }
 }}
 title="Recall Item?"
 message="Initiate an official return request for this asset? Our logistics team will contact you for pickup."
 confirmLabel="Initiate Recall"
 type="warning"
 />
 </div>
 );
}

