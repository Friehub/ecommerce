'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ChevronRight, ShieldCheck, ShoppingBag } from 'lucide-react';
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
      <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
        Please log in to see your reviews.
      </div>
    );
  }

  const isLoading = reviewsLoading || pendingLoading;

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/" className="hover:text-[#F68B1E] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link href="/account" className="hover:text-[#F68B1E] transition-colors">My Account</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Reviews</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
              <MessageSquare size={28} className="text-[#F68B1E]" />
              Reviews & Ratings
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage your feedback and rate your recent purchases.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'pending' ? 'text-[#F68B1E]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            To Rate ({pending?.length || 0})
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F68B1E] rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('reviewed')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'reviewed' ? 'text-[#F68B1E]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            My Reviews ({reviews?.length || 0})
            {activeTab === 'reviewed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F68B1E] rounded-t-full" />}
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'pending' ? (
            pending && pending.length > 0 ? (
              pending.map((item: any) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden">
                    <img src={item.variant?.product?.media?.[0]?.url} alt={item.variant?.product?.title} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-extrabold text-gray-900 leading-tight mb-1">{item.variant?.product?.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivered on {format(new Date(item.updatedAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <Link 
                    href={`/account/reviews/new?productId=${item.variant?.product?.id}`}
                    className="bg-orange-50 text-[#F68B1E] hover:bg-[#F68B1E] hover:text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-orange-100"
                  >
                    Rate Product
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
                <ShoppingBag className="mx-auto text-gray-100 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                <p className="text-gray-500 text-sm mt-1">You've rated all your recent delivered items.</p>
              </div>
            )
          ) : (
            reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                      {review.product?.media?.[0]?.url ? (
                        <img src={review.product.media[0].url} alt={review.product.title} className="w-full h-full object-contain p-2" />
                      ) : (
                        <ShoppingBag className="text-gray-300" size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-extrabold text-gray-900 leading-tight mb-1">{review.product?.title || 'Unknown Product'}</h3>
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < review.rating ? "text-[#F68B1E] fill-[#F68B1E]" : "text-gray-200 fill-gray-200"} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : 'Unknown Date'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic mb-4">"{review.comment}"</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#48A44C]">
                          <ShieldCheck size={14} />
                          VERIFIED PURCHASE
                        </div>
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-100 text-gray-400 uppercase tracking-tighter">
                          Status: {review.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
                <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900">No reviews yet</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Once you've purchased items and shared your feedback, they will appear here.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
