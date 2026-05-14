'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Star, Camera, ChevronLeft, Send, Loader2, X, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ReviewFormContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const productId = searchParams.get('productId');

 const [rating, setRating] = useState(0);
 const [hover, setHover] = useState(0);
 const [comment, setComment] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 const { data: product, isLoading: productLoading } = api.catalog.getProduct.useQuery(
 { id: productId as string },
 { enabled: !!productId }
 );

 const createReview = api.review.create.useMutation({
 onSuccess: () => {
 router.push('/account/reviews');
 },
 onError: (err) => {
 setIsSubmitting(false);
 }
 });

 const [images, setImages] = useState<string[]>([]);
 const [uploading, setUploading] = useState(false);

 const getUploadUrl = api.media.getUploadUrl.useMutation();

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setUploading(true);
 try {
 const { url, key } = await getUploadUrl.mutateAsync({
 path: file.name,
 contentType: file.type
 });

 await fetch(url, {
 method: 'PUT',
 body: file,
 headers: { 'Content-Type': file.type }
 });

 setImages(prev => [...prev, key]);
 } catch (err: any) {
 console.error(err);
 } finally {
 setUploading(false);
 }
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (rating === 0 || !comment || !productId) return;

 setIsSubmitting(true);
  createReview.mutate({
    productId,
    rating,
    comment,
    images
  });
 };

 if (productLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant opacity-40 animate-pulse">Fetching Node Metadata</p>
 </div>
 </div>
 );
 }

 if (!product) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center p-6">
 <div className="bg-surface-container-lowest p-16 rounded border border-surface-container-low shadow-soft text-center max-w-lg w-full">
 <X className="mx-auto text-error mb-8" size={64} />
 <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Node <span className="text-error">Not Found</span></h2>
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant/40 italic mb-10">THE TARGET PRODUCT IDENTITY DOES NOT EXIST IN THE CURRENT CATALOG.</p>
 <Link href="/account/reviews" className="h-16 px-12 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase  hover:bg-jumia-orange-dark transition-all flex items-center justify-center gap-4 mx-auto w-fit">
 Return to Profile <ArrowRight size={18} />
 </Link>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-3xl mx-auto px-6">
 <Link 
 href="/account/reviews"
 className="flex items-center gap-3 mb-12 text-[10px] font-semibold text-on-surface-variant/40 uppercase  hover:text-on-surface transition-all group"
 >
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Back to Perception Logs
 </Link>

 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="p-10 md:p-16 border-b-4 border-surface-container-low bg-surface-container-low/30">
 <h1 className="text-4xl font-semibold text-on-surface tracking-tighter uppercase mb-10 leading-none">Calibrate <span className="text-jumia-orange">Sentiment</span></h1>
 
 <div className="flex items-center gap-8 p-8 bg-surface-container-lowest rounded border-2 border-surface-container-low shadow-inner">
 <div className="w-20 h-20 bg-surface-container-low rounded-sm flex items-center justify-center border-2 border-surface-container-low shrink-0 overflow-hidden">
 <img src={product.media[0]?.url} alt={product.title} className="w-full h-full object-contain p-2" />
 </div>
 <div className="min-w-0">
 <h3 className="text-xl font-semibold text-on-surface uppercase tracking-tighter leading-tight truncate">{product.title}</h3>
 <div className="flex items-center gap-3 mt-2">
 <ShieldCheck size={14} className="text-jumia-orange" />
 <p className="text-[10px] font-semibold text-jumia-orange uppercase  italic">Verified Acquisition</p>
 </div>
 </div>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
 {/* Rating Stars */}
 <div className="text-center">
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  mb-8 italic">Specify Performance Magnitude</p>
 <div className="flex justify-center gap-4">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setRating(star)}
 onMouseEnter={() => setHover(star)}
 onMouseLeave={() => setHover(0)}
 className="transition-all duration-500 hover:scale-125 active:scale-90"
 >
 <Star 
 size={48} 
 className={`transition-all duration-500 ${
 (hover || rating) >= star ? 'text-jumia-orange fill-primary-container drop-shadow-[0_0_15px_rgba(var(--primary-container),0.4)]' : 'text-surface-container-low fill-surface-container-low'
 }`}
 />
 </button>
 ))}
 </div>
 {rating > 0 && (
 <p className="text-[11px] font-semibold text-jumia-orange uppercase  mt-8 animate-in fade-in zoom-in duration-300">
 {['Critical Failure', 'Below Spec', 'Operational', 'High Grade', 'Peak Performance'][rating - 1]}
 </p>
 )}
 </div>

 {/* Comment Area */}
 <div className="space-y-4">
 <label className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  block ml-2 italic">Perception Narrative</label>
 <textarea
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 placeholder="TRANSMIT YOUR EXPERIENCE LOG... WAS THE PRODUCT SPECIFICATION COMPLIANT?"
 className="w-full min-h-[200px] p-8 bg-surface-container-low/30 border-2 border-surface-container-low rounded focus:border-jumia-orange text-[11px] font-semibold text-on-surface uppercase tracking-widest leading-loose outline-none placeholder:font-normal placeholder:text-on-surface-variant/50 transition-all"
 />
 </div>

 {/* Photo Upload */}
 <div className="space-y-4">
 <label className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  block ml-2 italic">Visual Notifications</label>
 <div className="flex flex-wrap gap-6">
 {images.map((img, idx) => (
 <div key={idx} className="w-28 h-28 bg-surface-container-low rounded border-2 border-surface-container-low overflow-hidden group/img relative shadow-inner">
 <img src={`${process.env.NEXT_PUBLIC_R2_URL || ''}/${img}`} className="w-full h-full object-cover" />
 <button 
 type="button"
 onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
 className="absolute inset-0 bg-jumia-orange/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
 >
 <X size={24} />
 </button>
 </div>
 ))}
 
 {images.length < 5 && (
 <label className="w-28 h-28 border border-dashed border-surface-container-low rounded flex flex-col items-center justify-center gap-3 text-on-surface-variant/20 hover:border-jumia-orange/40 hover:text-jumia-orange transition-all cursor-pointer group">
 {uploading ? (
 <Loader2 size={24} className="animate-spin" />
 ) : (
 <>
 <Camera size={28} className="group-hover:scale-110 transition-transform" />
 <span className="text-[8px] font-semibold uppercase ">Add Node</span>
 </>
 )}
 <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
 </label>
 )}
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting || rating === 0 || !comment}
 className={`w-full h-24 rounded font-semibold text-[11px] uppercase  shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20 group ${
 isSubmitting || rating === 0 || !comment
 ? 'bg-surface-container-low text-on-surface-variant' 
 : 'bg-jumia-orange text-white hover:bg-jumia-orange-dark'
 }`}
 >
 {isSubmitting ? (
 <>
 <Loader2 size={24} className="animate-spin" />
 Transmitting...
 </>
 ) : (
 <>
 Transmit Sentiment Log <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
 </>
 )}
 </button>
 </form>
 </div>
 
 <div className="mt-12 flex items-center gap-4 bg-jumia-orange/5 p-8 rounded border-2 border-jumia-orange/10">
 <Activity size={24} className="text-jumia-orange animate-pulse shrink-0" />
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant/60 leading-relaxed italic">
 ALL SUBMITTED LOGS UNDERGO SYSTEMIC CONTENT VERIFICATION BEFORE BEING COMMITTED TO THE PUBLIC LEDGER.
 </p>
 </div>
 </div>
 </div>
 );
}

export default function NewReviewPage() {
 return (
 <Suspense fallback={
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 </div>
 }>
 <ReviewFormContent />
 </Suspense>
 );
}
