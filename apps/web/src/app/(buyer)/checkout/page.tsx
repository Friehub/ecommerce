'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { ChevronLeft, MapPin, CreditCard, ShoppingBag, Loader2, Plus, CheckCircle2, X, AlertCircle, Home, Briefcase, Info, ChevronRight, ArrowRight, Truck } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { format } from 'date-fns';

const LocationPicker = dynamic(() => import('@/components/ui/LocationPicker'), { 
 ssr: false,
 loading: () => <div className="h-[300px] w-full bg-surface-container-low animate-pulse rounded-[24px] border border-outline-variant flex flex-col items-center justify-center gap-4">
 <div className="w-10 h-10 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">Initializing Geospatial Engine</span>
 </div>
});

// Custom Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
 <div className={`fixed top-6 right-6 z-[100] flex items-center gap-4 px-8 py-5 rounded-[24px] shadow-2xl border-2 animate-in fade-in slide-in-from-top-6 duration-500 ${
 type === 'success' ? 'bg-surface-container-lowest border-success/20 text-success' : 'bg-surface-container-lowest border-error/20 text-error'
 }`}>
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-success/10' : 'bg-error/10'}`}>
 {type === 'success' ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <AlertCircle size={20} strokeWidth={2.5} />}
 </div>
 <div>
 <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{type === 'success' ? 'Operation Success' : 'System Alert'}</p>
 <p className="text-sm font-bold text-on-surface tracking-tight leading-tight">{message}</p>
 </div>
 <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity p-2 bg-on-surface/5 rounded-full">
 <X size={16} />
 </button>
 </div>
);

import { NIGERIA_STATES, STATE_LOCATIONS } from '@/constants/locations';

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

 const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
 const shipping = 1200;
 const total = Math.max(0, subtotal + shipping - discountValue);

 const handlePlaceOrder = () => {
 if (!selectedAddressId) {
 showToast('Please select a delivery address', 'error');
 return;
 }
 
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

 const handleLocationSelect = (lat: number, lng: number, details?: any) => {
 if (details?.address) {
 const addr = details.address;
 const stateMatch = NIGERIA_STATES.find(s => 
 s.toLowerCase().includes(addr.state?.toLowerCase().replace(' state', ''))
 );
 if (stateMatch) setSelectedState(stateMatch);
 }
 };

 if (status === 'loading' || isAddressesLoading) {
 return (
 <div className="bg-background min-h-screen py-8">
 <div className="container mx-auto px-4">
 <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse mb-8" />
 <div className="flex flex-col lg:flex-row gap-8">
 <div className="flex-1 space-y-6">
 {[...Array(2)].map((_, i) => (
 <div key={i} className="bg-surface-container-lowest rounded-[24px] border border-outline-variant h-64 animate-pulse" />
 ))}
 </div>
 <div className="w-full lg:w-[380px]">
 <div className="bg-surface-container-highest rounded-[32px] h-96 animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-12 select-none relative">
 {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

 {/* Add Address Modal */}
 {showAddressModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
 <div className="bg-surface-container-lowest rounded-[48px] w-full max-w-2xl my-auto overflow-hidden shadow-2xl border-4 border-surface-container-low animate-in zoom-in-95 duration-500">
 <div className="p-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
 <h3 className="font-black uppercase text-sm tracking-[0.2em] text-on-surface">Initialize New Destination</h3>
 <button onClick={() => setShowAddressModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-3 bg-surface-container rounded-2xl">
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
 <div className="md:col-span-2 flex gap-4 mb-4">
 <button 
 type="button"
 onClick={() => setAddressType('HOME')}
 className={`flex-1 p-5 rounded-[24px] border-2 flex items-center justify-center gap-4 transition-all duration-300 ${
 addressType === 'HOME' ? 'border-primary-container bg-primary-container/5 text-primary-container' : 'border-outline-variant text-on-surface-variant opacity-40 grayscale'
 }`}
 >
 <Home size={20} />
 <span className="text-xs font-black uppercase tracking-widest">Residency</span>
 </button>
 <button 
 type="button"
 onClick={() => setAddressType('OFFICE')}
 className={`flex-1 p-5 rounded-[24px] border-2 flex items-center justify-center gap-4 transition-all duration-300 ${
 addressType === 'OFFICE' ? 'border-primary-container bg-primary-container/5 text-primary-container' : 'border-outline-variant text-on-surface-variant opacity-40 grayscale'
 }`}
 >
 <Briefcase size={20} />
 <span className="text-xs font-black uppercase tracking-widest">Operational</span>
 </button>
 </div>

 <div className="space-y-2">
 <label htmlFor="firstName" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60">Legal First Name</label>
 <input id="firstName" required name="firstName" className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface" />
 </div>
 <div className="space-y-2">
 <label htmlFor="lastName" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60">Legal Last Name</label>
 <input id="lastName" required name="lastName" className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface" />
 </div>
 <div className="md:col-span-2 space-y-2">
 <label htmlFor="phone" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60">Communication Protocol (Phone)</label>
 <input id="phone" required name="phone" className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface" />
 </div>
 <div className="md:col-span-2 space-y-2">
 <label htmlFor="streetAddress" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60">Geospatial Vector (Street Address)</label>
 <input id="streetAddress" required name="streetAddress" className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface" />
 </div>
 <div className="md:col-span-2 space-y-2">
 <label htmlFor="landmark" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60 flex items-center gap-2">
 Secondary Identifier (Landmark) <Info size={12} className="text-primary-container/40" />
 </label>
 <input id="landmark" name="landmark" placeholder="e.g. Proximal to established node" className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface" />
 </div>
 
 <div className="space-y-2">
 <label htmlFor="state" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60">Regional Node (State)</label>
 <select 
 id="state"
 required 
 name="state" 
 value={selectedState}
 onChange={(e) => {
 setSelectedState(e.target.value);
 setSelectedCity('');
 }}
 className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface appearance-none"
 >
 <option value="">Select Region</option>
 {NIGERIA_STATES.map(state => (
 <option key={state} value={state}>{state}</option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label htmlFor="city" className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] px-1 opacity-60">Local Node (City)</label>
 {STATE_LOCATIONS[selectedState] ? (
 <select 
 id="city"
 required 
 name="city"
 value={selectedCity}
 onChange={(e) => setSelectedCity(e.target.value)}
 className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface appearance-none"
 >
 <option value="">Select Node</option>
 {STATE_LOCATIONS[selectedState].map(city => (
 <option key={city} value={city}>{city}</option>
 ))}
 </select>
 ) : (
 <input 
 id="city"
 required 
 name="city" 
 placeholder="Specify Node"
 className="w-full border-2 border-outline-variant bg-surface-container-low/50 rounded-[20px] px-6 py-4 text-sm focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all font-bold text-on-surface" 
 />
 )}
 </div>

 <button 
 type="submit"
 disabled={addAddressMutation.isLoading || !selectedState}
 className="md:col-span-2 mt-8 w-full bg-primary-container hover:shadow-2xl hover:shadow-primary-container/30 text-white h-16 rounded-[24px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-30 mb-8 text-xs flex items-center justify-center gap-3"
 >
 {addAddressMutation.isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Synchronize Address'}
 </button>
 </form>
 </div>
 </div>
 </div>
 )}

 <div className="container py-8">
 <div className="flex items-center gap-3 mb-12 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.4em]">
 <Link href="/cart" className="hover:text-primary-container transition-colors">Shopping Cart</Link>
 <ChevronRight size={14} className="opacity-30" />
 <span className="text-on-surface">Secure Checkout Protocol</span>
 </div>

 <div className="flex flex-col lg:flex-row gap-12">
 <div className="flex-1 space-y-10">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-10 hover:border-primary-container/20 transition-all duration-500">
 <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-surface-container-low">
 <div className="w-12 h-12 bg-primary-container/10 rounded-2xl flex items-center justify-center text-primary-container border-2 border-primary-container/20">
 <MapPin size={24} />
 </div>
 <h2 className="text-xl font-black text-on-surface uppercase tracking-tighter">Delivery Matrix</h2>
 </div>
 
 {addresses && addresses.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {addresses.map((addr: any) => (
 <div 
 key={addr.id}
 onClick={() => setSelectedAddressId(addr.id)}
 className={`p-6 border-2 rounded-[28px] cursor-pointer transition-all duration-300 relative overflow-hidden group ${
 selectedAddressId === addr.id ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant hover:border-outline bg-surface-container-low/10'
 }`}
 >
 {selectedAddressId === addr.id && (
 <div className="absolute top-6 right-6 text-primary-container animate-in zoom-in duration-300">
 <CheckCircle2 size={24} fill="currentColor" className="text-white" />
 </div>
 )}
 
 <div className="flex items-center gap-4 mb-6">
 <div className={`p-3 rounded-2xl transition-colors duration-300 ${addr.addressType === 'HOME' ? 'bg-primary-container/10 text-primary-container' : 'bg-tertiary-container/10 text-tertiary'}`}>
 {addr.addressType === 'HOME' ? <Home size={18} /> : <Briefcase size={18} />}
 </div>
 <p className="font-black text-sm text-on-surface uppercase tracking-tight">{addr.firstName} {addr.lastName}</p>
 </div>

 <div className="space-y-2">
 <p className="text-xs text-on-surface-variant font-bold leading-relaxed opacity-80">{addr.streetAddress}</p>
 <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-40 italic">{addr.city} • {addr.state}</p>
 <p className="text-[10px] text-on-surface font-black pt-4 flex items-center gap-3 border-t border-outline-variant/30 mt-4">
 <span className="w-1.5 h-1.5 bg-primary-container rounded-full" /> {addr.phone}
 </p>
 </div>
 </div>
 ))}
 <button 
 onClick={() => setShowAddressModal(true)}
 className="p-8 border-2 border-dashed border-outline-variant hover:border-primary-container bg-surface-container-low/20 hover:bg-primary-container/5 rounded-[28px] flex flex-col items-center justify-center gap-4 text-on-surface-variant hover:text-primary-container transition-all group min-h-[200px]"
 >
 <div className="w-14 h-14 bg-surface-container-lowest rounded-2xl flex items-center justify-center border-2 border-outline-variant group-hover:border-primary-container/30 transition-all">
 <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize New Node</span>
 </button>
 </div>
 ) : (
 <button 
 onClick={() => setShowAddressModal(true)}
 className="w-full p-12 border-2 border-dashed border-outline-variant/30 rounded-[32px] flex flex-col items-center justify-center gap-4 text-on-surface-variant hover:text-primary-container hover:border-primary-container/20 transition-all bg-surface-container-low/10"
 >
 <div className="w-20 h-20 bg-surface-container-lowest rounded-[24px] shadow-sm flex items-center justify-center border border-outline-variant/10">
 <MapPin size={32} />
 </div>
 <div className="text-center">
 <p className="font-black text-lg text-on-surface uppercase tracking-tight">No saved addresses</p>
 <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">Add a delivery address to continue</p>
 </div>
 </button>
 )}
 </div>

 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-10 hover:border-primary-container/20 transition-all duration-500">
 <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-surface-container-low">
 <div className="w-12 h-12 bg-primary-container/10 rounded-2xl flex items-center justify-center text-primary-container border-2 border-primary-container/20">
 <ShieldCheck size={24} />
 </div>
 <h2 className="text-xl font-black text-on-surface uppercase tracking-tighter">Payment Protocol</h2>
 </div>
 <div className="space-y-4">
 {[
 { id: 'POD', label: 'Cash on Delivery', icon: <ShoppingBag size={20} />, sub: 'Pay at your door' },
 { id: 'CARD', label: 'Cards / Transfer / USSD', icon: <CreditCard size={20} />, sub: 'Online Secure Payment' },
 ].map((method) => (
 <div key={method.id} className="group">
 <div 
 onClick={() => setPaymentMethod(method.id as any)}
 className={`p-6 border-2 rounded-[28px] cursor-pointer transition-all duration-300 flex items-center gap-5 ${
 paymentMethod === method.id ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant hover:border-outline bg-surface-container-low/10'
 }`}
 >
 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
 paymentMethod === method.id ? 'bg-primary-container text-white shadow-lg shadow-primary-container/20' : 'bg-surface-container text-on-surface-variant opacity-40'
 }`}>
 {method.icon}
 </div>
 <div className="flex-1">
 <p className="font-black text-xs text-on-surface uppercase tracking-[0.1em]">{method.label}</p>
 <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1 opacity-40 italic">{method.sub}</p>
 </div>
 <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
 paymentMethod === method.id ? 'border-primary-container' : 'border-outline-variant'
 }`}>
 {paymentMethod === method.id && <div className="w-2 h-2 bg-primary-container rounded-full animate-in zoom-in" />}
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
 className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
 paymentProvider === p.id 
 ? 'border-primary-container bg-primary-container text-white shadow-lg shadow-primary-container/20' 
 : 'border-outline-variant text-on-surface-variant hover:border-outline'
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
 </div>

 <div className="w-full lg:w-[420px]">
 <div className="bg-on-surface text-white rounded-[48px] border-4 border-surface-container-highest/10 shadow-2xl p-10 sticky top-24 overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 border-b-2 border-white/5 pb-6 relative z-10">Payload Verification</h3>
 <div className="space-y-6 relative z-10">
 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">
 <span>Subtotal Matrix</span>
 <span className="text-white">₦ {subtotal.toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">
 <span>Logistics Fee</span>
 <span className="text-white">₦ {shipping.toLocaleString()}</span>
 </div>
 {discountValue > 0 && (
 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-success">
 <span>Incentive Applied</span>
 <span>- ₦ {discountValue.toLocaleString()}</span>
 </div>
 )}
 <div className="pt-8 border-t-2 border-white/5 flex justify-between items-center">
 <span className="font-black text-white uppercase tracking-tight">Final Settlement</span>
 <span className="text-3xl font-black text-primary-container tracking-tighter">₦ {total.toLocaleString()}</span>
 </div>
 
 <div className="pt-8">
 <div className="flex gap-3 mb-10">
 <input 
 type="text" 
 placeholder="COUPON" 
 value={couponCode}
 onChange={(e) => setCouponCode(e.target.value)}
 className="flex-1 bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-[0.3em] outline-none focus:border-primary-container transition-all text-white placeholder:font-normal placeholder:text-white/40" 
 />
 <button 
 onClick={handleApplyCoupon}
 disabled={isCheckingCoupon}
 className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
 >
 {isCheckingCoupon ? '...' : 'APPLY'}
 </button>
 </div>
 </div>

 <button 
 onClick={handlePlaceOrder}
 disabled={isPlacingOrder || !cart?.items.length}
 className="w-full h-20 bg-primary-container hover:bg-white hover:text-on-surface text-white rounded-[24px] font-black text-xs uppercase tracking-[0.4em] mt-2 hover:opacity-90 transition-all transform active:scale-95 shadow-xl shadow-primary-container/20 flex items-center justify-center gap-4 group disabled:opacity-30"
 >
 {isPlacingOrder ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : (
 <>
 Execute Transaction <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </>
 )}
 </button>
 <p className="text-[9px] text-center font-black opacity-20 uppercase tracking-[0.4em] leading-relaxed italic mt-6">
 End-to-End Encrypted Settlement
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
