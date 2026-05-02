'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { ChevronLeft, MapPin, CreditCard, ShoppingBag, Loader2, Plus, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, sessionId } = useCart();
  
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<'CARD' | 'POD' | 'WALLET'>('POD');
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  const [couponCode, setCouponCode] = React.useState('');
  const [discountValue, setDiscountValue] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = React.useState(false);

  const utils = api.useUtils();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCheckingCoupon(true);
    try {
      const promo = await utils.promo.validateCoupon.fetch({ code: couponCode.trim() });
      if (promo) {
        let discountAmount = 0;
        if (promo.type === 'PERCENTAGE') {
          discountAmount = subtotal * (parseFloat(String(promo.value)) / 100);
        } else if (promo.type === 'FIXED_AMOUNT') {
          discountAmount = parseFloat(String(promo.value));
        }
        setDiscountValue(discountAmount);
        setAppliedCoupon(couponCode);
        alert('Coupon applied successfully!');
      } else {
        alert('Invalid or expired coupon');
      }
    } catch (err: any) {
      alert('Invalid or expired coupon: ' + (err.message || 'Error checking coupon'));
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const { data: addresses, isLoading: isAddressesLoading } = api.iam.getAddresses.useQuery(
    undefined,
    { enabled: !!session }
  );

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      if (paymentMethod === 'CARD') {
        initializePaystack.mutate({
          orderId: order.id,
          amount: (order as any).total,
        });
      } else {
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    },
    onError: (err) => {
      alert(err.message);
      setIsPlacingOrder(false);
    }
  });

  const initializePaystack = api.payment.initializePaystack.useMutation({
    onSuccess: (data) => {
      window.location.href = data.authorization_url;
    },
    onError: (err) => {
      alert('Failed to initialize payment: ' + err.message);
      setIsPlacingOrder(false);
    }
  });

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [status, router]);

  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  if (status === 'loading' || isAddressesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }
    setIsPlacingOrder(true);
    createOrder.mutate({
      cartId: cart?.id || sessionId,
      paymentMethod,
      addressId: selectedAddressId,
    });
  };

  const subtotal = cart?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const shipping = 1200;
  const total = Math.max(0, subtotal + shipping - discountValue);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Cart</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* 1. Address Selection */}
            <section className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F68B1E]/10 text-[#F68B1E] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-bold uppercase">Delivery Address</h2>
              </div>
              <div className="p-6">
                {addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                          selectedAddressId === addr.id ? 'border-[#F68B1E] bg-[#F68B1E]/5' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-2 right-2 text-[#F68B1E]">
                            <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                          </div>
                        )}
                        <p className="font-bold text-sm mb-1">{addr.firstName} {addr.lastName}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {addr.streetAddress}, {addr.city}, {addr.state}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{addr.phone}</p>
                      </div>
                    ))}
                    <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#F68B1E] hover:border-[#F68B1E] transition-all group min-h-[120px]">
                      <Plus size={24} />
                      <span className="text-xs font-bold uppercase">Add New Address</span>
                    </button>
                  </div>
                ) : (
                   <button className="w-full p-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#F68B1E] hover:border-[#F68B1E] transition-all">
                    <MapPin size={32} />
                    <div className="text-center">
                      <p className="font-bold">No saved addresses</p>
                      <p className="text-xs mt-1">Add a delivery address to continue</p>
                    </div>
                    <span className="mt-2 bg-[#F68B1E] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider">Add Address</span>
                  </button>
                )}
              </div>
            </section>

            {/* 2. Payment Method */}
            <section className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F68B1E]/10 text-[#F68B1E] rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold uppercase">Payment Method</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { id: 'CARD', label: 'Cards / Bank Transfer / USSD', icon: <CreditCard size={20} />, sub: 'Securely pay with Paystack' },
                    { id: 'POD', label: 'Payment on Delivery', icon: <ShoppingBag size={20} />, sub: 'Pay with cash or card when item arrives' },
                    { id: 'WALLET', label: 'Jumia Wallet', icon: <div className="w-5 h-5 bg-[#F68B1E] rounded-full" />, sub: 'Use your account balance' },
                  ].map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-4 ${
                        paymentMethod === method.id ? 'border-[#F68B1E] bg-[#F68B1E]/5' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-[#F68B1E]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#F68B1E] rounded-full" />}
                      </div>
                      <div className="text-[#F68B1E] bg-[#F68B1E]/10 p-2 rounded-full flex items-center justify-center">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{method.label}</p>
                        <p className="text-[10px] text-gray-500">{method.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden sticky top-24">
              <div className="p-4 border-b">
                <h3 className="font-bold uppercase text-sm">Order Summary</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items ({cart?.totalItems || 0})</span>
                  <span className="font-medium text-gray-800">₦ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-gray-800">₦ {shipping.toLocaleString()}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-sm text-[#388E3C] font-semibold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>- ₦ {discountValue.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#F68B1E]" 
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isCheckingCoupon}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold uppercase transition-colors disabled:opacity-50"
                    >
                      {isCheckingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-[#F68B1E] text-xl">₦ {total.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !cart?.items.length}
                  className="w-full h-12 bg-[#F68B1E] text-white rounded font-bold uppercase tracking-wider hover:bg-[#E07A1A] transition-all disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Order'}
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                  By placing your order, you agree to Jumia's <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
                </p>
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
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\:flex-row { flex-direction: row; }
          .lg\:w-\[380px\] { width: 380px; }
        }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-\[\#F68B1E\]\/10 { background-color: rgba(246, 139, 30, 0.1); }
        .bg-\[\#F68B1E\]\/5 { background-color: rgba(246, 139, 30, 0.05); }
        .bg-\[\#F68B1E\] { background-color: #f68b1e; }
        .text-\[\#F68B1E\] { color: #f68b1e; }
        .text-white { color: #ffffff; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-xl { font-size: 1.25rem; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .border-2 { border-width: 2px; }
        .border-dashed { border-style: dashed; }
        .border-gray-100 { border-color: #f3f4f6; }
        .border-gray-200 { border-color: #e5e7eb; }
        .rounded-lg { border-radius: 8px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .min-h-\[120px\] { min-height: 120px; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .sticky { position: sticky; }
        .top-24 { top: 6rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
