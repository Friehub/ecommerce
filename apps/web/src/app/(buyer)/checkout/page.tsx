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

  // Modal & Toast States
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [addressType, setAddressType] = React.useState<'HOME' | 'OFFICE'>('HOME');
  const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form Auto-fill states from Map
  const [mapAddress, setMapAddress] = React.useState<{
    street?: string;
    city?: string;
    state?: string;
  }>({});

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
        initializePaystack.mutate({
          orderId: order.id,
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

  const initializePaystack = api.payment.initializePaystack.useMutation({
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
    setIsPlacingOrder(true);
    createOrder.mutate({
      cartId: cart?.id || sessionId,
      paymentMethod,
      addressId: selectedAddressId,
    });
  };

  const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
  const shipping = 1200;
  const total = Math.max(0, subtotal + shipping - discountValue);

  const handleLocationSelect = (lat: number, lng: number, details?: any) => {
    if (details?.address) {
      const addr = details.address;
      setMapAddress({
        street: addr.road || addr.suburb || addr.neighbourhood || '',
        city: addr.city || addr.town || addr.village || '',
        state: addr.state || '',
      });
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
              <h3 className="font-extrabold uppercase text-sm tracking-widest text-gray-800">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="p-6 pb-0">
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
                    city: formData.get('city') as string,
                    state: formData.get('state') as string,
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
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      addressType === 'HOME' ? 'border-[#F68B1E] bg-orange-50/20 text-[#F68B1E]' : 'border-gray-100 text-gray-400 grayscale'
                    }`}
                   >
                    <Home size={18} />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Home</span>
                   </button>
                   <button 
                    type="button"
                    onClick={() => setAddressType('OFFICE')}
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      addressType === 'OFFICE' ? 'border-[#F68B1E] bg-orange-50/20 text-[#F68B1E]' : 'border-gray-100 text-gray-400 grayscale'
                    }`}
                   >
                    <Briefcase size={18} />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Office</span>
                   </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide">First Name</label>
                  <input required name="firstName" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide">Last Name</label>
                  <input required name="lastName" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide">Phone Number</label>
                  <input required name="phone" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide">Street Address (House No, Building Name)</label>
                  <input required name="streetAddress" defaultValue={mapAddress.street} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide flex items-center gap-1.5">
                    Landmark / Additional Info <Info size={10} className="text-blue-400" />
                  </label>
                  <input name="landmark" placeholder="e.g. Near the big oak tree, 2nd floor" className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide">City</label>
                  <input required name="city" defaultValue={mapAddress.city} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wide">State</label>
                  <input required name="state" defaultValue={mapAddress.state} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:border-[#F68B1E] focus:bg-white outline-none transition-all font-bold" />
                </div>
                <button 
                  type="submit"
                  disabled={addAddressMutation.isLoading}
                  className="col-span-2 mt-4 w-full bg-[#F68B1E] hover:bg-[#e07a1a] text-white h-12 rounded-xl font-extrabold uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 mb-6"
                >
                  {addAddressMutation.isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save Address'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors select-none">
          <ChevronLeft size={20} />
          <span className="text-xs tracking-wide uppercase">Back to Cart</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* 1. Address Selection */}
            <section className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md overflow-hidden select-none">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 border border-orange-100 text-[#F68B1E] rounded-full flex items-center justify-center font-extrabold text-sm select-none">
                  1
                </div>
                <h2 className="text-base md:text-lg font-extrabold uppercase tracking-tight text-gray-900">
                  Delivery Address
                </h2>
              </div>
              <div className="p-6">
                {addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-5 border-2 rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                          selectedAddressId === addr.id ? 'border-[#F68B1E] bg-orange-50/20' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 flex">
                          <div className={`flex-1 ${addr.addressType === 'HOME' ? 'bg-[#F68B1E]' : 'bg-blue-400'} opacity-20`} />
                        </div>

                        {selectedAddressId === addr.id && (
                          <div className="absolute top-3 right-3 text-[#F68B1E]">
                            <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                           <div className={`p-1.5 rounded-lg ${addr.addressType === 'HOME' ? 'bg-orange-50 text-[#F68B1E]' : 'bg-blue-50 text-blue-500'}`}>
                             {addr.addressType === 'HOME' ? <Home size={14} /> : <Briefcase size={14} />}
                           </div>
                           <p className="font-extrabold text-sm text-gray-800">{addr.firstName} {addr.lastName}</p>
                        </div>

                        <p className="text-xs text-gray-600 font-bold leading-relaxed pr-6">
                          {addr.streetAddress}
                        </p>
                        {addr.landmark && (
                          <p className="text-[10px] text-gray-400 font-medium italic mt-1 flex items-start gap-1">
                            <span className="text-[#F68B1E] font-black not-italic">@</span> {addr.landmark}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500 font-extrabold mt-3 tracking-wide">
                          {addr.city.toUpperCase()}, {addr.state.toUpperCase()}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-gray-300 rounded-full" /> {addr.phone}
                        </p>
                      </div>
                    ))}
                    <button 
                      onClick={() => setShowAddressModal(true)}
                      className="p-4 border-2 border-dashed border-gray-200 hover:border-orange-200 bg-gray-50/50 hover:bg-orange-50/30 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#F68B1E] transition-all group min-h-[160px] cursor-pointer"
                    >
                      <Plus size={24} className="group-hover:scale-110 duration-200 transition-transform" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">Add New Address</span>
                    </button>
                  </div>
                ) : (
                   <button 
                    onClick={() => setShowAddressModal(true)}
                    className="w-full p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#F68B1E] hover:border-orange-200 transition-all bg-gray-50/50"
                   >
                    <MapPin size={32} />
                    <div className="text-center">
                      <p className="font-extrabold text-base text-gray-800">No saved addresses</p>
                      <p className="text-xs font-medium mt-1">Add a delivery address to continue</p>
                    </div>
                    <span className="mt-2 bg-[#F68B1E] hover:bg-[#e07a1a] text-white px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wide select-none transition-all shadow-md">
                      Add Address
                    </span>
                  </button>
                )}
              </div>
            </section>

            {/* 2. Payment Method */}
            <section className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md overflow-hidden select-none">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 border border-orange-100 text-[#F68B1E] rounded-full flex items-center justify-center font-extrabold text-sm select-none">
                  2
                </div>
                <h2 className="text-base md:text-lg font-extrabold uppercase tracking-tight text-gray-900">
                  Payment Method
                </h2>
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
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${
                        paymentMethod === method.id ? 'border-[#F68B1E] bg-orange-50/20' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-[#F68B1E]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#F68B1E] rounded-full" />}
                      </div>
                      <div className="text-[#F68B1E] bg-orange-50 border border-orange-100/50 p-2.5 rounded-xl flex items-center justify-center">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-sm text-gray-800">{method.label}</p>
                        <p className="text-[11px] font-medium text-gray-400">{method.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] select-none">
            <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md overflow-hidden sticky top-24">
              <div className="p-4 bg-gray-50/60 border-b border-gray-100">
                <h3 className="font-extrabold uppercase text-sm tracking-tight text-gray-800">Order Summary</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Items ({cart?.items?.length || 0})</span>
                  <span className="font-bold text-gray-800">₦ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Shipping</span>
                  <span className="font-bold text-gray-800">₦ {shipping.toLocaleString()}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-extrabold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>- ₦ {discountValue.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-2 select-none">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-lg px-3 py-1.5 text-sm outline-none font-medium text-gray-800" 
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isCheckingCoupon}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all disabled:opacity-50 select-none"
                    >
                      {isCheckingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center select-none">
                  <span className="font-extrabold text-gray-800">Total</span>
                  <span className="font-extrabold text-[#F68B1E] text-xl">₦ {total.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !cart?.items.length}
                  className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-105 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-md active:scale-95 duration-200"
                >
                  {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Order'}
                </button>
                <p className="text-[10px] text-center font-medium text-gray-400 mt-4 leading-relaxed">
                  By placing your order, you agree to Jumia&apos;s <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
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
        .gap-1 { gap: 4px; }
        .gap-1\.5 { gap: 6px; }
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
        .rounded-xl { border-radius: 12px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .p-4 { padding: 1rem; }
        .p-5 { padding: 1.25rem; }
        .p-6 { padding: 1.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .min-h-\[160px\] { min-height: 160px; }
        .font-bold { font-weight: 700; }
        .font-extrabold { font-weight: 800; }
        .font-black { font-weight: 900; }
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
