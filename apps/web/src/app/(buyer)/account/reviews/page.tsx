'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ChevronRight, ShieldCheck, ShoppingBag, Activity, ArrowRight, StarHalf } from 'lucide-react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function UserReviewsPage() {
 const { data: session } = useSession();
 const [activeTab, setActiveTab] = useState<'reviewed' | 'pending'>('pending');

 const { data: reviews, isLoading: reviewsLoading } = api.review.listMyReviews.useQuery(undefined, {
 enabled: !!session?.user
 });

 const { data: pending, isLoading: pendingLoading } = api.review.getPendingReviews.useQuery(undefined, {
 enabled: !!session?.user
 });

 if (!session?.user) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center p-6">
 <div className="bg-surface-container-lowest p-16 rounded-[48px] border border-surface-container-low shadow-soft text-center max-w-lg w-full">
 <ShieldCheck className="mx-auto text-on-surface-variant/20 mb-8" size={64} />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic mb-10">IDENTITY VERIFICATION REQUIRED TO ACCESS FEEDBACK NODES.</p>
 <Link href="/login" className="h-16 px-12 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase tracking-[0.4em] hover:bg-jumia-orange-dark transition-all flex items-center justify-center gap-4 mx-auto w-fit shadow-2xl">
 Sign In <ArrowRight size={18} />
 </Link>
 </div>
 </div>
 );
 }

 const isLoading = reviewsLoading || pendingLoading;

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Perception Data</p>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-5xl mx-auto px-6">
 {/* Breadcrumbs */}
 <div className="flex items-center gap-4 mb-12 font-semibold text-on-surface-variant/40 text-[10px] uppercase tracking-[0.4em]">
 <Link href="/" className="hover:text-on-surface transition-colors">Core</Link>
 <ChevronRight size={12} className="opacity-20" />
 <Link href="/account" className="hover:text-on-surface transition-colors">Profile</Link>
 <ChevronRight size={12} className="opacity-20" />
 <span className="text-on-surface">Perception</span>
 </div>

 {/* Page Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-4 border-surface-container-low pb-10">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <MessageSquare size={24} className="text-jumia-orange" />
 <h2 className="text-[10px] font-semibold text-jumia-orange uppercase tracking-[0.4em]">Sentiment Engine</h2>
 </div>
 <h1 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Reviews <span className="text-jumia-orange">& Ratings</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Management of feedback logs and purchase validation metrics.</p>
 </div>
 <div className="flex items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic">
 <span className="flex items-center gap-2 px-4 py-2 bg-jumia-orange/5 text-jumia-orange rounded-xl border-2 border-jumia-orange/10">
 <Activity size={14} /> Notifications Active
 </span>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex gap-12 border-b-4 border-surface-container-low mb-12 overflow-x-auto no-scrollbar">
 <button 
 onClick={() => setActiveTab('pending')}
 className={`pb-8 text-[11px] font-semibold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'pending' ? 'text-jumia-orange' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
 >
 Awaiting Calibration ({pending?.length || 0})
 {activeTab === 'pending' && <div className="absolute bottom-[-4px] left-0 right-0 h-2 bg-jumia-orange rounded-t-full shadow-[0_0_20px_rgba(var(--primary-container),0.4)]" />}
 </button>
 <button 
 onClick={() => setActiveTab('reviewed')}
 className={`pb-8 text-[11px] font-semibold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'reviewed' ? 'text-jumia-orange' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
 >
 Processed Logs ({reviews?.length || 0})
 {activeTab === 'reviewed' && <div className="absolute bottom-[-4px] left-0 right-0 h-2 bg-jumia-orange rounded-t-full shadow-[0_0_20px_rgba(var(--primary-container),0.4)]" />}
 </button>
 </div>

 {/* Content */}
 <div className="grid grid-cols-1 gap-10">
 {activeTab === 'pending' ? (
 pending && pending.length > 0 ? (
 pending.map((item: any, idx: number) => (
 <div key={item.id} className="bg-surface-container-lowest rounded-[48px] border border-surface-container-low hover:border-jumia-orange/20 transition-all duration-500 shadow-soft p-10 flex flex-col md:flex-row items-center gap-10 group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
 <div className="w-24 h-24 bg-surface-container-low rounded flex items-center justify-center border-2 border-surface-container-low flex-shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
 <img src={item.variant?.product?.media?.[0]?.url} alt={item.variant?.product?.title} className="w-full h-full object-contain p-3" />
 </div>
 <div className="flex-1 text-center md:text-left">
 <h3 className="text-xl font-semibold text-on-surface uppercase tracking-tighter leading-tight mb-2 group-hover:text-jumia-orange transition-colors">{item.variant?.product?.title}</h3>
 <div className="flex items-center justify-center md:justify-start gap-3">
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-widest italic">Delivered {format(new Date(item.updatedAt), 'MMM dd, yyyy').toUpperCase()}</p>
 <div className="w-1 h-1 bg-surface-container-low rounded-full" />
 <span className="text-[9px] font-semibold text-jumia-orange/40 uppercase tracking-[0.2em]">WAITING PERCEPTION</span>
 </div>
 </div>
 <Link 
 href={`/account/reviews/new?productId=${item.variant?.product?.id}`}
 className="h-16 px-10 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase tracking-[0.3em] hover:bg-jumia-orange-dark transition-all active:scale-95 flex items-center gap-4 shrink-0 shadow-2xl group/btn"
 >
 Calibrate Sentiment <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
 </Link>
 </div>
 ))
 ) : (
 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low py-32 text-center shadow-soft animate-in zoom-in-95 duration-1000">
 <ShoppingBag className="mx-auto text-surface-container-low mb-10 opacity-40" size={80} />
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Pipeline <span className="text-success">Nominal</span></h3>
 <p className="text-on-surface-variant/40 text-[10px] font-semibold uppercase tracking-[0.3em] italic px-10 leading-relaxed">ALL RECENT ACQUISITIONS HAVE BEEN SYSTEMICALLY RATED AND CALIBRATED.</p>
 </div>
 )
 ) : (
 reviews && reviews.length > 0 ? (
 reviews.map((review: any, idx: number) => (
 <div key={review.id} className="bg-surface-container-lowest rounded-[48px] border border-surface-container-low hover:border-jumia-orange/20 transition-all duration-500 shadow-soft p-10 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
 <div className="flex flex-col md:flex-row gap-10">
 <div className="w-24 h-24 bg-surface-container-low rounded flex items-center justify-center border-2 border-surface-container-low flex-shrink-0 shadow-inner">
 {review.product?.media?.[0]?.url ? (
 <img src={review.product.media[0].url} alt={review.product.title} className="w-full h-full object-contain p-3" />
 ) : (
 <ShoppingBag className="text-on-surface-variant/20" size={32} />
 )}
 </div>
 <div className="flex-1">
 <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
 <div>
 <h3 className="text-xl font-semibold text-on-surface uppercase tracking-tighter leading-tight mb-4">{review.product?.title || 'UNKNOWN NODE'}</h3>
 <div className="flex items-center gap-1.5 p-1 px-3 bg-jumia-orange text-white w-fit rounded-full shadow-xl">
 {[...Array(5)].map((_, i) => (
 <Star 
 key={i} 
 size={14} 
 className={i < review.rating ? "text-jumia-orange fill-primary-container" : "text-white/10 fill-white/10"} 
 />
 ))}
 <span className="text-[10px] font-semibold ml-2">{review.rating}.0</span>
 </div>
 </div>
 <span className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic bg-surface-container-low px-4 py-2 rounded-xl">
 {review.createdAt ? format(new Date(review.createdAt), 'dd MMM yyyy').toUpperCase() : 'UNKNOWN TEMPORAL'}
 </span>
 </div>
 <div className="bg-surface-container-low/30 p-8 rounded border-2 border-surface-container-low mb-8">
 <p className="text-[11px] font-semibold text-on-surface uppercase tracking-widest leading-loose italic opacity-60">"{review.comment.toUpperCase()}"</p>
 </div>
 <div className="flex flex-wrap items-center gap-6">
 <div className="flex items-center gap-3 text-[10px] font-semibold text-success uppercase tracking-[0.2em]">
 <div className="w-10 h-10 bg-success/5 rounded-xl flex items-center justify-center border-2 border-success/10">
 <ShieldCheck size={20} />
 </div>
 VERIFIED ACQUISITION
 </div>
 <div className="h-10 px-4 bg-surface-container-low text-on-surface-variant/60 rounded-xl flex items-center justify-center text-[9px] font-semibold uppercase tracking-[0.3em] border-2 border-surface-container-low italic">
 Status: {review.status}
 </div>
 </div>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low py-32 text-center shadow-soft">
 <MessageSquare className="mx-auto text-surface-container-low mb-10 opacity-40" size={80} />
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">No <span className="text-jumia-orange">Telemetries</span></h3>
 <p className="text-on-surface-variant/40 text-[10px] font-semibold uppercase tracking-[0.3em] italic px-10 leading-relaxed max-w-sm mx-auto">INITIATE ACQUISITIONS AND CALIBRATE PERCEPTIONS TO POPULATE THIS DATASET.</p>
 </div>
 )
 )}
 </div>
 </div>
 </div>
 );
}
