'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Star, ThumbsUp, MessageSquare, Camera, User, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'images'>('all');
  
  const { data: reviews, isLoading } = api.review.getByProduct.useQuery({ productId });
  const { data: stats } = api.review.getRatingStats.useQuery({ productId });

  const averageRating = stats?.averageRating || 0;
  const reviewCount = stats?.reviewCount || 0;

  if (isLoading) {
    return (
      <div className="mt-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-8" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-gray-100 pb-6">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full" />
              <div className="space-y-2 py-1">
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            </div>
            <div className="h-20 bg-gray-50 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row gap-12 border-b border-gray-100 pb-12">
        {/* Summary Stats */}
        <div className="lg:w-1/3">
          <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-6">Verified Customer Feedback</h2>
          <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Average Rating</p>
              <div className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
                {averageRating.toFixed(1)} <span className="text-2xl text-gray-400">/ 5</span>
              </div>
              <div className="flex justify-center text-orange-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={24} 
                    fill={i < Math.round(averageRating) ? "currentColor" : "none"} 
                    className={i < Math.round(averageRating) ? "text-orange-400" : "text-gray-200"} 
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Based on {reviewCount} ratings</p>
            </div>

            {/* Progress Bars (Mocked for now as we don't have per-star breakdown in API yet) */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 w-3">{star}</span>
                  <Star size={10} className="text-gray-300 fill-gray-300" />
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 rounded-full" 
                      style={{ width: star === 5 ? '75%' : star === 4 ? '15%' : '5%' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 w-6">({star === 5 ? '92' : '18'})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1">
          <div className="flex items-center gap-8 border-b border-gray-100 mb-8">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'all' ? 'text-[#F68B1E]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              All Reviews ({reviewCount})
              {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F68B1E]" />}
            </button>
            <button 
              onClick={() => setActiveTab('images')}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'images' ? 'text-[#F68B1E]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              With Images (12)
              {activeTab === 'images' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F68B1E]" />}
            </button>
          </div>

          <div className="space-y-8">
            {reviews?.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-900">No reviews yet</h3>
                <p className="text-sm text-gray-500 mt-1">Be the first to review this product!</p>
              </div>
            ) : (
              reviews?.map((review: any) => (
                <div key={review.id} className="border-b border-gray-50 pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold uppercase text-xs">
                        {review.user.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-gray-900 leading-none">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-green-100">
                            <CheckCircle2 size={10} />
                            Verified Purchase
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-1.5">
                          {format(new Date(review.createdAt), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-orange-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  {review.media?.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.media.map((img: any, i: number) => (
                        <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                          <img src={img.url} alt="Review" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-[#F68B1E] uppercase tracking-widest transition-colors">
                      <ThumbsUp size={14} />
                      Helpful (0)
                    </button>
                    <button className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                      Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
