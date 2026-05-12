'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '../../../context/CartContext';
import { ChevronLeft, MapPin, CreditCard, ShoppingBag, Loader2, Plus, CheckCircle2, X, AlertCircle, Home, Briefcase, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/ui/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading Map...</div>
});

// Custom Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
    type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
  }`}>
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    <p className="text-sm font-extrabold tracking-tight">{message}</p>
    <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
      <X size={16} />
    </button>
  </div>
);

import { NIGERIA_STATES, STATE_LOCATIONS } from '../../../constants/locations';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, sessionId } = useCart();
  
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<'CARD' | 'POD' | 'WALLET'>('POD');
  const [paymentProvider, setPaymentProvider] = React.useState<'paystack' | 'flutterwave' | 'monnify'>('paystack');
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  const [couponCode, setCouponCode] = React.useState('');
  const [discountValue, setDiscountValue] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = React.useState(false);

  // Modal & Toast States
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [addressType, setAddressType] = React.useState<'HOME' | 'OFFICE'>('HOME');
  const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form states for localized dropdowns
  const [selectedState, setSelectedState] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('');

  const utils = api.useUtils();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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
        showToast('Coupon applied successfully!', 'success');
      } else {
        showToast('Invalid or expired coupon', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error checking coupon', 'error');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const { data: addresses, isLoading: isAddressesLoading } = api.iam.getAddresses.useQuery(
    undefined,
    { 
      enabled: !!session,
      retry: false,
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
      }
    }
  );

  const addAddressMutation = api.iam.addAddress.useMutation({
    onSuccess: (newAddress) => {
      utils.iam.getAddresses.invalidate();
      setSelectedAddressId(newAddress.id);
      setShowAddressModal(false);
      showToast('Address added successfully!', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      if (paymentMethod === 'CARD') {
        initializePayment.mutate({
          orderId: order.id,
          provider: paymentProvider,
        });
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
      showToast('Failed to initialize payment: ' + err.message, 'error');
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
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FA]">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    
    // Read referral link ID from cookie if present
    const referralLinkId = document.cookie
      .split('; ')
      .find(row => row.startsWith('referralLinkId='))
      ?.split('=')[1];

    setIsPlacingOrder(true);
    createOrder.mutate({
      cartId: cart?.id || sessionId,
      paymentMethod,
      addressId: selectedAddressId,
      referralLinkId,
      couponCode: appliedCoupon || undefined,
    });
  };

  const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
  const shipping = 1200;
  const total = Math.max(0, subtotal + shipping - discountValue);

  const handleLocationSelect = (lat: number, lng: number, details?: any) => {
    if (details?.address) {
      const addr = details.address;
      // Try to match state from list
      const stateMatch = NIGERIA_STATES.find(s => 
        s.toLowerCase().includes(addr.state?.toLowerCase().replace(' state', ''))
      );
      if (stateMatch) setSelectedState(stateMatch);
    }
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-auto overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-800">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="p-4 md:p-6 pb-0">
                <LocationPicker onLocationSelect={handleLocationSelect} />
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
                    landmark: formData.get('landmark') as string,
                    city: selectedCity || formData.get('city') as string,
                    state: selectedState,
                    country: 'Nigeria',
                    addressType: addressType,
                    isDefault: true,
                  });
                }}
                className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2 flex gap-2 md:gap-4 mb-2">
                   <button 
                    type="button"
                    onClick={() => setAddressType('HOME')}
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      addressType === 'HOME' ? 'border-[#F68B1E] bg-orange-50/20 text-[#F68B1E]' : 'border-gray-100 text-gray-400 grayscale'
                    }`}
                   >
                    <Home size={18} />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Home</span>
                   </button>
                   <button 
                    type="button"
                    onClick={() => setAddressType('OFFICE')}
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      addressType === 'OFFICE' ? 'border-[#F68B1E] bg-orange-50/20 text-[#F68B1E]' : 'border-gray-100 text-gray-400 grayscale'
                    }`}
                   >
                    <Briefcase size={18} />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Office</span>
                   </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">First Name</label>
                  <input required name="firstName" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Last Name</label>
                  <input required name="lastName" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Phone Number</label>
                  <input required name="phone" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Street Address</label>
                  <input required name="streetAddress" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                    Landmark <Info size={10} className="text-blue-400" />
                  </label>
                  <input name="landmark" placeholder="e.g. Near the big oak tree" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">State</label>
                  <select 
                    required 
                    name="state" 
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity('');
                    }}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold appearance-none"
                  >
                    <option value="">Select State</option>
                    {NIGERIA_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">City / Town</label>
                  {STATE_LOCATIONS[selectedState] ? (
                    <select 
                      required 
                      name="city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold appearance-none"
                    >
                      <option value="">Select City</option>
                      {STATE_LOCATIONS[selectedState].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      required 
                      name="city" 
                      placeholder="Enter City"
                      className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" 
                    />
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={addAddressMutation.isLoading || !selectedState}
                  className="md:col-span-2 mt-4 w-full bg-[#F68B1E] hover:bg-[#e07a1a] text-white h-12 rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 mb-6 text-xs"
                >
                  {addAddressMutation.isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save Address'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-black text-gray-400 hover:text-gray-800 mb-6 transition-colors group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-widest uppercase">Back to Cart</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* 1. Address Selection */}
            <section className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
              <div className="p-5 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <div className="w-10 h-10 bg-white border border-gray-100 text-[#F68B1E] rounded-2xl flex items-center justify-center font-black text-sm shadow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Delivery Address</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Where should we send your items?</p>
                </div>
              </div>
              <div className="p-6">
                {addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-5 border-2 rounded-[20px] cursor-pointer transition-all relative overflow-hidden group ${
                          selectedAddressId === addr.id ? 'border-[#F68B1E] bg-orange-50/10' : 'border-gray-50 hover:border-gray-200'
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-4 right-4 text-[#F68B1E]">
                            <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-4">
                           <div className={`p-2 rounded-xl ${addr.addressType === 'HOME' ? 'bg-orange-50 text-[#F68B1E]' : 'bg-blue-50 text-blue-500'}`}>
                             {addr.addressType === 'HOME' ? <Home size={16} /> : <Briefcase size={16} />}
                           </div>
                           <p className="font-black text-sm text-gray-900 tracking-tight">{addr.firstName} {addr.lastName}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-bold leading-relaxed">{addr.streetAddress}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{addr.city}, {addr.state}</p>
                          <p className="text-[10px] text-gray-900 font-black pt-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-[#F68B1E] rounded-full" /> {addr.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setShowAddressModal(true)}
                      className="p-6 border-2 border-dashed border-gray-100 hover:border-orange-200 bg-gray-50/30 hover:bg-orange-50/20 rounded-[20px] flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#F68B1E] transition-all group min-h-[160px]"
                    >
                      <Plus size={28} className="group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add New Address</span>
                    </button>
                  </div>
                ) : (
                   <button 
                    onClick={() => setShowAddressModal(true)}
                    className="w-full p-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-[#F68B1E] hover:border-orange-200 transition-all bg-gray-50/30"
                   >
                    <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center border border-gray-50">
                      <MapPin size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-lg text-gray-900 uppercase tracking-tight">No saved addresses</p>
                      <p className="text-xs font-bold text-gray-400 uppercase mt-1">Add a delivery address to continue</p>
                    </div>
                    <span className="mt-4 bg-[#F68B1E] text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                      Add Address
                    </span>
                  </button>
                )}
              </div>
            </section>

            {/* 2. Payment Method */}
            <section className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
              <div className="p-5 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <div className="w-10 h-10 bg-white border border-gray-100 text-[#F68B1E] rounded-2xl flex items-center justify-center font-black text-sm shadow-sm">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Payment Method</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Choose your preferred payment way</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { id: 'POD', label: 'Cash on Delivery', icon: <ShoppingBag size={20} />, sub: 'Pay at your door' },
                    { id: 'CARD', label: 'Cards / Transfer / USSD', icon: <CreditCard size={20} />, sub: 'Online Secure Payment' },
                  ].map((method) => (
                    <div key={method.id}>
                      <div 
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-5 border-2 rounded-[20px] cursor-pointer transition-all flex items-center gap-4 ${
                          paymentMethod === method.id ? 'border-[#F68B1E] bg-orange-50/10' : 'border-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          paymentMethod === method.id ? 'bg-[#F68B1E] text-white' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-xs text-gray-900 uppercase tracking-tight">{method.label}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{method.sub}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id ? 'border-[#F68B1E]' : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && <div className="w-2 h-2 bg-[#F68B1E] rounded-full" />}
                        </div>
                      </div>

                      {method.id === 'CARD' && paymentMethod === 'CARD' && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pl-4 animate-in slide-in-from-top-2 duration-200">
                          {[
                            { id: 'paystack', name: 'Paystack' },
                            { id: 'flutterwave', name: 'Flutterwave' },
                            { id: 'monnify', name: 'Monnify' }
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setPaymentProvider(p.id as any)}
                              className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                                paymentProvider === p.id 
                                  ? 'border-[#F68B1E] bg-[#F68B1E] text-white' 
                                  : 'border-gray-100 text-gray-400 hover:border-gray-200'
                              }`}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-[#1A1A1A] text-white rounded-[32px] shadow-2xl shadow-black/20 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-black uppercase text-xs tracking-widest">Order Summary</h3>
                <ShoppingBag size={20} className="text-[#F68B1E]" />
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                    <span>Items ({cart?.items?.length || 0})</span>
                    <span className="text-white">₦ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                    <span>Delivery Fee</span>
                    <span className="text-white">₦ {shipping.toLocaleString()}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-400">
                      <span>Discount ({appliedCoupon})</span>
                      <span>- ₦ {discountValue.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="COUPON" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-[#F68B1E] transition-all" 
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isCheckingCoupon}
                      className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {isCheckingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Final Amount</p>
                    <span className="font-black text-3xl tracking-tighter">₦ {total.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !cart?.items.length}
                  className="w-full h-16 bg-[#F68B1E] hover:bg-white hover:text-[#1A1A1A] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all disabled:bg-white/5 disabled:text-white/20 flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/20 active:scale-95 text-xs"
                >
                  {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Complete Order'}
                </button>
                
                <p className="text-[9px] text-center font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                  Secured by Multi-Gateway Encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
