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

  const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
  const shipping = 500;
  const total = subtotal + shipping;

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
    });
  };

  if (status === 'loading' || isAddressesLoading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-desktop py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <div className="w-full lg:w-[350px]">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded shadow-xl flex items-center gap-3 border ${
          toast.type === 'success' ? 'bg-white border-j-success text-j-success' : 'bg-white border-j-error text-j-error'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-body-md uppercase">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2"><X size={16} /></button>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded border border-j-outline-variant w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-j-outline-variant flex items-center justify-between bg-j-surface-container-low">
              <h3 className="font-bold uppercase text-label-bold">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)}><X size={20} /></button>
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
              className="p-6 grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 flex gap-4 mb-2">
                <button 
                  type="button"
                  onClick={() => setAddressType('HOME')}
                  className={`flex-1 p-3 rounded border font-bold text-label-bold uppercase flex items-center justify-center gap-2 ${
                    addressType === 'HOME' ? 'border-jumia-orange text-jumia-orange bg-jumia-orange/5' : 'border-j-outline-variant text-j-text-muted'
                  }`}
                >
                  <Home size={18} /> Home
                </button>
                <button 
                  type="button"
                  onClick={() => setAddressType('OFFICE')}
                  className={`flex-1 p-3 rounded border font-bold text-label-bold uppercase flex items-center justify-center gap-2 ${
                    addressType === 'OFFICE' ? 'border-jumia-orange text-jumia-orange bg-jumia-orange/5' : 'border-j-outline-variant text-j-text-muted'
                  }`}
                >
                  <Briefcase size={18} /> Office
                </button>
              </div>

              <input required name="firstName" placeholder="First Name" className="border border-j-outline-variant rounded p-3 text-body-md" />
              <input required name="lastName" placeholder="Last Name" className="border border-j-outline-variant rounded p-3 text-body-md" />
              <input required name="phone" placeholder="Phone Number" className="col-span-2 border border-j-outline-variant rounded p-3 text-body-md" />
              <input required name="streetAddress" placeholder="Street Address" className="col-span-2 border border-j-outline-variant rounded p-3 text-body-md" />
              
              <select 
                required 
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
                className="border border-j-outline-variant rounded p-3 text-body-md"
              >
                <option value="">Select State</option>
                {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select 
                required 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-j-outline-variant rounded p-3 text-body-md"
                disabled={!selectedState}
              >
                <option value="">Select City</option>
                {STATE_LOCATIONS[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button 
                type="submit"
                disabled={addAddressMutation.isLoading}
                className="col-span-2 mt-4 bg-jumia-orange text-white py-3 rounded font-bold uppercase hover:bg-jumia-orange-dark transition-all disabled:opacity-50"
              >
                {addAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-container-max mx-auto px-margin-desktop py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-body-sm text-j-text-muted">
          <Link href="/cart" className="hover:text-jumia-orange font-bold uppercase">Cart</Link>
          <ChevronRight size={14} />
          <span className="text-j-text font-bold uppercase">Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-gutter">
          <div className="flex-1 flex flex-col gap-4">
            {/* 1. Address Section */}
            <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-j-success text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <h2 className="text-label-bold font-bold uppercase">Address Details</h2>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-jumia-orange font-bold text-label-bold uppercase hover:underline"
                >
                  Change &gt;
                </button>
              </div>
              <div className="p-4">
                {addresses && addresses.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-body-md uppercase">{addresses[0].firstName} {addresses[0].lastName}</p>
                    <p className="text-body-sm text-j-text-muted">{addresses[0].streetAddress} | {addresses[0].city} | {addresses[0].state}</p>
                    <p className="text-body-sm text-j-text-muted mt-1">{addresses[0].phone}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="w-full py-8 border-2 border-dashed border-j-outline-variant rounded flex flex-col items-center gap-2 text-j-text-muted hover:text-jumia-orange hover:border-jumia-orange transition-all"
                  >
                    <Plus size={24} />
                    <span className="font-bold uppercase text-label-bold">Add Delivery Address</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Delivery Method */}
            <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low flex items-center gap-2">
                <span className="bg-j-success text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-label-bold font-bold uppercase">Delivery Method</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex gap-3 p-3 border border-jumia-orange bg-jumia-orange/5 rounded">
                  <CheckCircle2 className="text-jumia-orange" size={20} />
                  <div>
                    <h4 className="text-body-md font-bold">Door Delivery</h4>
                    <p className="text-body-sm text-j-text-muted mt-1">Delivery scheduled between 20 May & 22 May</p>
                  </div>
                  <span className="ml-auto font-bold text-body-md uppercase">₦ {shipping.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low flex items-center gap-2">
                <span className="bg-j-success text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <h2 className="text-label-bold font-bold uppercase">Payment Method</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {[
                  { id: 'POD', label: 'Cash on Delivery', icon: <ShoppingBag size={20} /> },
                  { id: 'CARD', label: 'Pay with Card / Transfer', icon: <CreditCard size={20} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-center gap-4 p-4 border rounded transition-all ${
                      paymentMethod === m.id ? 'border-jumia-orange bg-jumia-orange/5' : 'border-j-outline-variant'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === m.id ? 'border-jumia-orange' : 'border-j-outline-variant'
                    }`}>
                      {paymentMethod === m.id && <div className="w-2.5 h-2.5 bg-jumia-orange rounded-full" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-body-md uppercase">{m.label}</p>
                    </div>
                    {m.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="w-full lg:w-[350px]">
            <div className="bg-white rounded border border-j-outline-variant shadow-sm p-4 sticky top-24 flex flex-col gap-4">
              <h3 className="text-label-bold font-bold uppercase text-j-text-muted border-b border-j-outline-variant pb-3">Order Summary</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-body-md">
                  <span className="text-j-text-muted">Items ({totalItems})</span>
                  <span className="text-j-text font-bold">₦ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-j-text-muted">Delivery Fee</span>
                  <span className="text-j-text font-bold">₦ {shipping.toLocaleString()}</span>
                </div>
                <div className="border-t border-j-outline-variant pt-3 flex justify-between items-center">
                  <span className="text-body-lg font-bold text-j-text">Total</span>
                  <span className="text-price-sm text-j-text font-extrabold">₦ {total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !cart?.items.length}
                className="w-full bg-jumia-orange text-white py-3.5 rounded font-bold uppercase shadow-sm hover:bg-jumia-orange-dark transition-all disabled:opacity-50 mt-4"
              >
                {isPlacingOrder ? 'Confirming...' : 'Confirm Order'}
              </button>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-j-outline-variant">
                <div className="flex items-center gap-2 text-[10px] font-bold text-j-text-muted uppercase">
                  <ShieldCheck size={14} className="text-j-success" />
                  Jumia SafePay Guaranteed
                </div>
                <p className="text-[10px] text-j-text-muted">Return for free within 15 days for Official Store items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
