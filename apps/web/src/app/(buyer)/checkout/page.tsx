// apps/web/src/app/(buyer)/checkout/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { MapPin, CreditCard, ShoppingBag, Plus, CheckCircle2, X, AlertCircle, Home, Briefcase, ChevronRight, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { NIGERIA_STATES, STATE_LOCATIONS } from '@/constants/locations';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, totalItems, sessionId } = useCart();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'POD' | 'WALLET'>('POD');
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'flutterwave' | 'monnify'>('paystack');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE'>('HOME');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const utils = api.useUtils();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const { data: addresses, isLoading: isAddressesLoading } = api.iam.getAddresses.useQuery(
    undefined,
    { enabled: !!session, retry: false }
  );

  const addAddressMutation = api.iam.addAddress.useMutation({
    onSuccess: (newAddress) => {
      utils.iam.getAddresses.invalidate();
      setSelectedAddressId(newAddress.id);
      setShowAddressModal(false);
      showToast('Address added successfully!');
    },
    onError: (err) => showToast(err.message, 'error')
  });

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      utils.cart.get.invalidate();
      if (paymentMethod === 'CARD') {
        initializePayment.mutate({ orderId: order.id, provider: paymentProvider });
      } else {
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    },
    onError: (err) => {
      showToast(err.message, 'error');
      setIsPlacingOrder(false);
    }
  });

  const initializePayment = api.payment.initializePayment.useMutation({
    onSuccess: (data) => {
      window.location.href = data.authorization_url;
    },
    onError: (err) => {
      showToast('Payment initialization failed: ' + err.message, 'error');
      setIsPlacingOrder(false);
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [status, router]);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const { data: shippingData, isLoading: isShippingLoading } = api.order.calculateShipping.useQuery(
    { cartId: cart?.id || sessionId, addressId: selectedAddressId as string },
    { enabled: !!selectedAddressId && !!(cart?.id || sessionId) }
  );

  const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
  const shipping = shippingData?.total ?? 500;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'PERCENTAGE') {
      discountAmount = subtotal * (Number(appliedPromo.discountValue) / 100);
    } else {
      discountAmount = Number(appliedPromo.discountValue);
    }
  }
  const discount = Math.min(discountAmount, subtotal);
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingPromo(true);
    setPromoError(null);
    try {
      const promo = await utils.client.promo.validateCoupon.query({
        code: couponInput.trim(),
        orderTotal: subtotal
      });
      setAppliedPromo(promo);
      setCouponCode(couponInput.trim());
      showToast('Coupon applied successfully!');
    } catch (err: any) {
      console.error(err);
      let message = 'Invalid coupon code';
      if (err.message === 'COUPON_NOT_FOUND') message = 'Coupon not found';
      else if (err.message === 'COUPON_INACTIVE') message = 'Coupon is inactive';
      else if (err.message === 'COUPON_EXHAUSTED') message = 'Coupon usage limit reached';
      else if (err.message === 'COUPON_EXPIRED') message = 'Coupon has expired';
      else if (err.message === 'MIN_ORDER_VALUE_NOT_MET') message = 'Minimum order value not met';
      else if (err.message === 'COUPON_SELLER_MISMATCH') message = 'Coupon is not applicable to items in your cart';
      else if (err.message === 'COUPON_USER_LIMIT_EXCEEDED') message = 'You have exceeded usage limit for this coupon';
      
      setPromoError(message);
      setAppliedPromo(null);
      setCouponCode('');
      showToast(message, 'error');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    setIsPlacingOrder(true);
    createOrder.mutate({
      cartId: cart?.id || sessionId,
      paymentMethod,
      addressId: selectedAddressId,
      couponCode: couponCode || undefined,
    });
  };

  if (status === 'loading' || isAddressesLoading) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-10 rounded-sm" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-64 rounded-sm" />
            <Skeleton className="h-64 rounded-sm" />
          </div>
          <div className="w-full lg:w-[380px]">
            <Skeleton className="h-96 rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-10 right-10 z-[100] px-8 py-5 rounded-sm shadow-2xl flex items-center gap-4 border-2 transition-all animate-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-white border-j-success text-j-success' : 'bg-white border-j-error text-j-error'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="font-black text-sm uppercase tracking-widest">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 hover:scale-110 transition-transform"><X size={18} /></button>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-sm border border-j-border w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-j-border flex items-center justify-between bg-j-background">
              <h3 className="font-black uppercase text-sm tracking-widest">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="hover:text-jumia-orange transition-colors"><X size={24} /></button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addAddressMutation.mutate({
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  phone: formData.get('phone') as string,
                  streetAddress: formData.get('streetAddress') as string,
                  city: selectedCity,
                  state: selectedState,
                  country: 'Nigeria',
                  addressType: addressType,
                  isDefault: true,
                });
              }}
              className="p-8 grid grid-cols-2 gap-6"
            >
              <div className="col-span-2 flex gap-4 mb-2">
                <button 
                  type="button"
                  onClick={() => setAddressType('HOME')}
                  className={`flex-1 p-4 rounded-sm border-2 font-black text-[11px] uppercase flex items-center justify-center gap-3 transition-all ${
                    addressType === 'HOME' ? 'border-jumia-orange text-jumia-orange bg-orange-50' : 'border-j-border text-j-text-muted hover:border-j-text-muted'
                  }`}
                >
                  <Home size={18} /> Home
                </button>
                <button 
                  type="button"
                  onClick={() => setAddressType('OFFICE')}
                  className={`flex-1 p-4 rounded-sm border-2 font-black text-[11px] uppercase flex items-center justify-center gap-3 transition-all ${
                    addressType === 'OFFICE' ? 'border-jumia-orange text-jumia-orange bg-orange-50' : 'border-j-border text-j-text-muted hover:border-j-text-muted'
                  }`}
                >
                  <Briefcase size={18} /> Office
                </button>
              </div>

              <input required name="firstName" placeholder="First Name" className="bg-j-background border-2 border-j-border rounded-sm p-4 text-[13px] font-bold focus:border-jumia-orange outline-none" />
              <input required name="lastName" placeholder="Last Name" className="bg-j-background border-2 border-j-border rounded-sm p-4 text-[13px] font-bold focus:border-jumia-orange outline-none" />
              <input required name="phone" placeholder="Phone Number" className="col-span-2 bg-j-background border-2 border-j-border rounded-sm p-4 text-[13px] font-bold focus:border-jumia-orange outline-none" />
              <input required name="streetAddress" placeholder="Street Address" className="col-span-2 bg-j-background border-2 border-j-border rounded-sm p-4 text-[13px] font-bold focus:border-jumia-orange outline-none" />
              
              <select 
                required 
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
                className="bg-j-background border-2 border-j-border rounded-sm p-4 text-[13px] font-bold focus:border-jumia-orange outline-none cursor-pointer"
              >
                <option value="">Select State</option>
                {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select 
                required 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-j-background border-2 border-j-border rounded-sm p-4 text-[13px] font-bold focus:border-jumia-orange outline-none cursor-pointer disabled:opacity-50"
                disabled={!selectedState}
              >
                <option value="">Select City</option>
                {STATE_LOCATIONS[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button 
                type="submit"
                disabled={addAddressMutation.isLoading}
                className="col-span-2 mt-4 bg-jumia-orange text-white py-4 rounded-sm font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {addAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1184px] mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-j-text-muted uppercase tracking-widest">
          <Link href="/cart" className="hover:text-jumia-orange transition-colors">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-j-text">Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            {/* 1. Address Section */}
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-j-border bg-j-background flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="bg-j-success text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm">1</span>
                  <h2 className="text-sm font-black uppercase tracking-widest">Address Details</h2>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-jumia-orange font-black text-[11px] uppercase tracking-widest hover:text-orange-700 transition-colors"
                >
                  Change &gt;
                </button>
              </div>
              <div className="p-6">
                {addresses && addresses.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-black text-sm uppercase tracking-tight text-j-text">{addresses[0].firstName} {addresses[0].lastName}</p>
                    <p className="text-[12px] text-j-text-muted font-bold leading-relaxed">{addresses[0].streetAddress} | {addresses[0].city} | {addresses[0].state}</p>
                    <p className="text-[11px] text-j-text font-black mt-2 opacity-80">{addresses[0].phone}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="w-full py-12 border-2 border-dashed border-j-border rounded-sm flex flex-col items-center gap-3 text-j-text-muted hover:text-jumia-orange hover:border-jumia-orange transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-j-background flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="font-black uppercase text-[11px] tracking-widest">Add Delivery Address</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Delivery Method */}
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-j-border bg-j-background flex items-center gap-4">
                <span className="bg-j-success text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm">2</span>
                <h2 className="text-sm font-black uppercase tracking-widest">Delivery Method</h2>
              </div>
              <div className="p-6">
                <div className="flex gap-4 p-5 border-2 border-jumia-orange bg-orange-50 rounded-sm relative group">
                  <div className="bg-jumia-orange text-white p-2 rounded-full shrink-0">
                    <Truck size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-tight">Door Delivery</h4>
                    <p className="text-[11px] text-j-text-muted font-bold mt-1 uppercase tracking-widest opacity-70">Scheduled between 20 May & 22 May</p>
                  </div>
                  <span className="font-black text-sm text-j-text uppercase tracking-tight">
                    {isShippingLoading ? (
                      <Skeleton className="h-5 w-16 inline-block" />
                    ) : (
                      `₦ ${shipping.toLocaleString()}`
                    )}
                  </span>
                  <div className="absolute -top-3 -right-3">
                     <CheckCircle2 className="text-jumia-orange fill-white" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-j-border bg-j-background flex items-center gap-4">
                <span className="bg-j-success text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm">3</span>
                <h2 className="text-sm font-black uppercase tracking-widest">Payment Method</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {[
                  { id: 'POD', label: 'Cash on Delivery', icon: <ShoppingBag size={20} /> },
                  { id: 'CARD', label: 'Pay with Card / Transfer', icon: <CreditCard size={20} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-center gap-5 p-5 border-2 rounded-sm transition-all text-left group ${
                      paymentMethod === m.id ? 'border-jumia-orange bg-orange-50' : 'border-j-border hover:border-j-text-muted'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === m.id ? 'border-jumia-orange bg-white' : 'border-j-border'
                    }`}>
                      {paymentMethod === m.id && <div className="w-3 h-3 bg-jumia-orange rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-[13px] uppercase tracking-tight transition-colors ${paymentMethod === m.id ? 'text-jumia-orange' : 'text-j-text'}`}>{m.label}</p>
                    </div>
                    <div className={`p-2 rounded-full transition-colors ${paymentMethod === m.id ? 'bg-jumia-orange text-white' : 'bg-j-background text-j-text-muted'}`}>
                      {m.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-sm border border-j-border shadow-sm p-6 sticky top-24 flex flex-col gap-6 overflow-hidden">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-j-text-muted border-b border-j-border pb-4">Order Summary</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-j-text-muted font-black uppercase tracking-tight">Items ({totalItems})</span>
                  <span className="text-j-text font-black text-lg">₦ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-j-text-muted">
                  <span className="font-black uppercase tracking-tight">Delivery Fee</span>
                  <span className="font-black">₦ {shipping.toLocaleString()}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-[11px] text-j-success">
                    <span className="font-black uppercase tracking-tight">Discount</span>
                    <span className="font-black">- ₦ {discount.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Promo Code Input */}
                <div className="border-t border-j-border pt-4 mt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-j-text-muted mb-2">Have a promo code?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 bg-j-background border border-j-border rounded-sm px-3 py-2 text-[12px] font-black tracking-widest focus:border-jumia-orange outline-none"
                      disabled={isValidatingPromo || !!appliedPromo}
                    />
                    {appliedPromo ? (
                      <button
                        onClick={() => {
                          setAppliedPromo(null);
                          setCouponInput('');
                          setCouponCode('');
                          showToast('Coupon removed');
                        }}
                        className="bg-j-error text-white px-4 py-2 rounded-sm font-black text-[10px] uppercase tracking-wider hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingPromo || !couponInput.trim()}
                        className="bg-jumia-orange text-white px-5 py-2 rounded-sm font-black text-[10px] uppercase tracking-wider hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {isValidatingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {promoError && (
                    <p className="text-j-error text-[10px] font-black uppercase mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {promoError}
                    </p>
                  )}
                  {appliedPromo && (
                    <p className="text-j-success text-[10px] font-black uppercase mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {appliedPromo.title || 'PROMO CODE APPLIED'} ({appliedPromo.discountType === 'PERCENTAGE' ? `${appliedPromo.discountValue}% Off` : `₦ ${Number(appliedPromo.discountValue).toLocaleString()} Off`})
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t-2 border-j-border border-dashed flex justify-between items-center">
                  <span className="text-sm font-black text-j-text uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-jumia-orange">₦ {total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !cart?.items.length}
                className="w-full bg-jumia-orange text-white py-4 rounded-sm font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-[0.98] mt-2"
              >
                {isPlacingOrder ? 'Confirming...' : 'Confirm Order'}
              </button>

              <div className="flex flex-col gap-3 mt-4 p-4 bg-j-background rounded-sm border border-j-border border-dashed">
                <div className="flex items-center gap-3 text-[10px] font-black text-j-success uppercase tracking-tighter italic">
                  <ShieldCheck size={16} />
                  Jumia SafePay Guaranteed
                </div>
                <p className="text-[9px] text-j-text-muted font-black uppercase tracking-tighter leading-tight opacity-70">Return for free within 15 days for Official Store items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
