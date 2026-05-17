'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  PackageCheck, 
  Truck, 
  CalendarCheck, 
  ShieldCheck,
  ShoppingBag,
  Activity,
  Zap,
  Box,
  XCircle,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference');
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const verifyPaymentMutation = api.payment.verifyPayment.useMutation();

  const { data: order, isLoading: isOrderLoading, refetch: refetchOrder } = api.order.get.useQuery(
    { orderId: orderId as string },
    { enabled: !!orderId }
  );

  const performVerification = () => {
    if (!reference) return;
    setVerificationStatus('loading');
    verifyPaymentMutation.mutate(
      { reference },
      {
        onSuccess: (data) => {
          if (data.status === 'SUCCESS') {
            setVerificationStatus('success');
            utils.cart.get.invalidate();
            refetchOrder();
            toast({
              title: "Payment Confirmed",
              description: "Your payment has been successfully verified!",
            });
          } else {
            setVerificationStatus('failed');
            setErrorMessage(`Provider returned status: ${data.status}`);
          }
        },
        onError: (err) => {
          setVerificationStatus('failed');
          setErrorMessage(err.message || 'Verification endpoint returned an error.');
        }
      }
    );
  };

  useEffect(() => {
    if (!orderId) {
      router.push('/account/orders');
      return;
    }

    if (reference) {
      performVerification();
    } else {
      // No reference provided. Let's invalidate cart anyway if the order is already PAID
      utils.cart.get.invalidate();
    }
  }, [orderId, reference, router, utils]);

  const copyToClipboard = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Payment reference copied to clipboard.",
      });
    }
  };

  // Loading indicator for order fetching or transaction verification
  if (isOrderLoading || verificationStatus === 'loading') {
    return (
      <div className="w-full max-w-[800px] px-4 py-20 flex flex-col items-center justify-center gap-8 text-center bg-white rounded-sm border border-j-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-jumia-orange opacity-20" />
        <div className="relative">
          <div className="absolute inset-0 bg-jumia-orange/10 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-j-background border-2 border-j-border rounded-full flex items-center justify-center shadow-md">
            <RefreshCw size={44} className="text-jumia-orange animate-spin duration-[2s]" />
          </div>
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          <h2 className="text-2xl font-black text-j-text uppercase tracking-tight">Verifying Payment</h2>
          <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-60">
            {reference ? 'Securing transaction credentials with Paystack...' : 'Loading order details...'}
          </p>
          <p className="text-xs text-on-surface-variant font-medium">Please do not close, refresh, or navigate away from this page.</p>
        </div>
      </div>
    );
  }

  // If payment verification failed
  if (verificationStatus === 'failed') {
    return (
      <div className="w-full max-w-[800px] px-4 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-sm border-2 border-outline-variant/10 shadow-2xl overflow-hidden relative group">
          <div className="bg-surface-container-high h-64 flex flex-col items-center justify-center relative border-b border-j-border">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--error)_0%,_transparent)] opacity-10" />
            <div className="relative">
              <div className="relative w-28 h-28 bg-error text-white rounded-full flex items-center justify-center shadow-2xl">
                <XCircle size={56} strokeWidth={2.5} className="animate-bounce" />
              </div>
            </div>
          </div>

          <div className="p-8 md:p-16 text-center space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-j-text uppercase tracking-tight leading-none">
                Payment <span className="text-error">Unconfirmed</span>
              </h1>
              <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">
                We could not verify your payment transaction status.
              </p>
            </div>

            <div className="bg-surface-container-low text-on-surface-variant p-6 rounded-2xl border border-outline-variant/10 text-left max-w-lg mx-auto space-y-4 shadow-inner">
              <div className="flex items-start gap-4">
                <AlertTriangle size={24} className="text-error shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-on-surface">Verification Status Alert</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    The payment gateway could not confirm completion of this transaction. If you have already been debited, do not panic; your payment reference is securely logged below.
                  </p>
                </div>
              </div>

              {reference && (
                <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Transaction Reference</span>
                    <span className="font-mono text-xs font-bold text-on-surface select-all">{reference}</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-on-surface transition-colors cursor-pointer border border-outline-variant/10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                  >
                    {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4 max-w-lg mx-auto">
              <button 
                onClick={performVerification}
                className="flex-1 h-16 bg-jumia-orange text-white font-black px-10 rounded-sm hover:bg-orange-600 transition-all transform active:scale-95 shadow-lg text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 group cursor-pointer"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Retry Verification
              </button>
              <Link 
                href="/help"
                className="flex-1 h-16 bg-j-text text-white font-black px-10 rounded-sm hover:bg-black transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-lg active:scale-95 cursor-pointer"
              >
                <HelpCircle size={18} />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no reference was supplied and the order status remains UNPAID (bypass attempt)
  if (!reference && order?.status === 'PENDING_PAYMENT' && order.paymentMethod !== 'COD') {
    return (
      <div className="w-full max-w-[800px] px-4 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-sm border-2 border-outline-variant/10 shadow-2xl overflow-hidden relative group">
          <div className="bg-surface-container-high h-64 flex flex-col items-center justify-center relative border-b border-j-border">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--warning)_0%,_transparent)] opacity-10" />
            <div className="relative">
              <div className="relative w-28 h-28 bg-jumia-orange text-white rounded-full flex items-center justify-center shadow-2xl">
                <AlertTriangle size={56} strokeWidth={2.5} className="animate-pulse" />
              </div>
            </div>
          </div>

          <div className="p-8 md:p-16 text-center space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-j-text uppercase tracking-tight leading-none">
                Payment <span className="text-jumia-orange">Required</span>
              </h1>
              <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">
                This order is unpaid and pending checkout verification.
              </p>
            </div>

            <p className="text-j-text-muted font-bold text-sm max-w-md mx-auto leading-relaxed opacity-80 uppercase tracking-tight">
              To guarantee dispatch and fulfillment of your items, please complete checkout and confirm your payment.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4 max-w-lg mx-auto">
              <Link 
                href={`/checkout?orderId=${orderId}`}
                className="flex-1 h-16 bg-jumia-orange text-white font-black px-10 rounded-sm hover:bg-orange-600 transition-all transform active:scale-95 shadow-lg text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 group cursor-pointer"
              >
                Complete Checkout
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/"
                className="flex-1 h-16 bg-j-text text-white font-black px-10 rounded-sm hover:bg-black transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-lg active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={20} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Happy Path: Display gorgeous order completion page
  return (
    <div className="w-full max-w-[800px] px-4 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-sm border border-j-border shadow-2xl overflow-hidden relative group">
        
        {/* Header Section */}
        <div className="bg-j-background h-64 flex flex-col items-center justify-center relative overflow-hidden border-b border-j-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f68b1e10,_transparent)] opacity-50" />
          <div className="relative">
            <div className="absolute inset-0 bg-jumia-orange/10 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-28 h-28 bg-jumia-orange text-white rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-500">
              <CheckCircle2 size={56} strokeWidth={2.5} className="animate-in zoom-in duration-500 delay-300" />
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-j-text uppercase tracking-tight leading-none">
              Thank You <span className="text-jumia-orange">For Your Order!</span>
            </h1>
            <div className="flex flex-col items-center gap-4">
              <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">Your order has been received successfully</p>
              <div className="bg-j-background text-j-text px-8 py-3 rounded-sm border-2 border-j-border flex items-center gap-4 group/ref shadow-sm">
                <Box size={20} className="text-jumia-orange group-hover/ref:scale-110 transition-transform" />
                <span className="font-black text-xl tracking-tight">#{orderId?.substring(0, 12).toUpperCase() || 'ORD-000000'}</span>
              </div>
            </div>
          </div>

          <p className="text-j-text-muted font-bold text-sm max-w-md mx-auto leading-relaxed opacity-80 uppercase tracking-tight">
            We've sent a confirmation email to {order?.user?.email || 'your registered address'}. Our team is now preparing your items for dispatch.
          </p>

          {/* Order Summary Snapshot */}
          {order && (
            <div className="bg-white border-2 border-j-border p-6 rounded-sm text-left flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-j-border pb-3">
                <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">
                  Items ({order.packages.reduce((acc, pkg) => acc + pkg.lines.length, 0)})
                </span>
                <span className="font-black text-j-text">₦ {Number(order.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                <span className="text-j-text-muted">Payment: {order.paymentMethod}</span>
                <span className={order.status === 'PAID' || order.status === 'DELIVERED' ? 'text-j-success' : 'text-jumia-orange'}>
                  {order.status}
                </span>
              </div>
            </div>
          )}

          {/* Fulfillment steps */}
          <div className="space-y-8 bg-j-background p-10 rounded-sm border border-j-border">
            <div className="flex items-center gap-4">
              <Activity size={18} className="text-jumia-orange animate-pulse" />
              <p className="text-[10px] font-black text-j-text uppercase tracking-widest">Order Progress</p>
              <div className="h-2 bg-white flex-1 rounded-full overflow-hidden border border-j-border">
                <div className="h-full bg-jumia-orange w-1/4 animate-in slide-in-from-left duration-1000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: PackageCheck, title: 'Confirmed', status: 'Completed' },
                { icon: Truck, title: 'Processing', status: 'In Progress' },
                { icon: CalendarCheck, title: 'Delivery', status: 'Pending' }
              ].map((step, i) => (
                <div key={i} className="bg-white p-6 rounded-sm border-2 border-j-border shadow-sm hover:translate-y-[-4px] transition-all group">
                  <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-4 border-2 transition-all ${
                    i === 0 ? 'bg-jumia-orange text-white border-jumia-orange' : 'bg-j-background text-j-text-muted border-j-border group-hover:border-j-text-muted'
                  }`}>
                    <step.icon size={22} strokeWidth={2} />
                  </div>
                  <h4 className="text-[11px] font-black text-j-text uppercase tracking-tight mb-1">{step.title}</h4>
                  <p className={`text-[9px] font-black uppercase tracking-widest italic ${i === 0 ? 'text-jumia-orange' : 'opacity-40 text-j-text-muted'}`}>{step.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Link 
              href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
              className="flex-1 h-16 bg-jumia-orange text-white font-black px-10 rounded-sm hover:bg-orange-600 transition-all transform active:scale-95 shadow-lg text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 group cursor-pointer"
            >
              Track Order
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              href="/"
              className="flex-1 h-16 bg-j-text text-white font-black px-10 rounded-sm hover:bg-black transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-lg active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* SafePay Footer */}
        <div className="bg-j-background p-10 border-t border-j-border flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white text-j-success rounded-sm flex items-center justify-center border-2 border-j-border shadow-md">
              <ShieldCheck size={32} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-j-text uppercase tracking-widest mb-1">Secure Transaction</p>
              <p className="text-[9px] text-j-text-muted font-black uppercase tracking-tighter italic opacity-60">Jumia SafePay Guaranteed</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-sm border-2 border-j-border shadow-sm">
            <Zap size={18} className="text-jumia-orange animate-pulse" />
            <span className="text-[10px] font-black uppercase text-j-text tracking-widest">Status: Priority Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="bg-j-background min-h-screen flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-jumia-orange opacity-20" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-8 animate-pulse">
          <div className="w-32 h-32 bg-white border-2 border-j-border rounded-sm" />
          <div className="space-y-4">
            <div className="h-6 w-80 bg-white border-2 border-j-border rounded-sm mx-auto" />
            <div className="h-3 w-48 bg-white border-2 border-j-border rounded-sm mx-auto opacity-50" />
          </div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
