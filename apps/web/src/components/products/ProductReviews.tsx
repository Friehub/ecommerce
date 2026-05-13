'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Star, ThumbsUp, MessageSquare, Camera, User, CheckCircle2, StarHalf, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../ui/Skeleton';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'images'>('all');
  
  const { data: reviews, isLoading } = api.review.getByProduct.useQuery({ productId });
  const { data: stats } = api.review.getRatingStats.useQuery({ productId });

  const averageRating = stats?.averageRating || 0;
  const reviewCount = stats?.reviewCount || 0;

  const renderStars = (rating: number, size = 12) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={size} className="fill-primary-container text-primary-container" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} size={size} className="fill-primary-container text-primary-container" />);
      } else {
        stars.push(<Star key={i} size={size} className="text-outline-variant fill-outline-variant/30" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="mt-12 space-y-8 animate-in fade-in duration-700">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <Skeleton className="h-64 rounded-[40px]" />
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-[32px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 selection:bg-primary-container/30">
      <div className="flex flex-col lg:flex-row gap-16 border-b-4 border-surface-container-low pb-16">
        {/* Summary Stats */}
        <div className="lg:w-1/3">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary-container/10 p-2.5 rounded-2xl border-2 border-primary-container/20">
              <Activity size={24} className="text-primary-container" />
            </div>
            <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none">Intelligence <span className="text-primary-container italic">Report.</span></h2>
          </div>
          
          <div className="bg-surface-container-lowest rounded-[48px] p-10 border-4 border-surface-container-low shadow-soft relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-[2s]" />
            
            <div className="text-center mb-10 relative z-10">
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-4 italic">Aggregate Satisfaction</p>
              <div className="text-6xl font-black text-on-surface tracking-tighter mb-4 leading-none">
                {averageRating.toFixed(1)} <span className="text-2xl text-on-surface-variant/20 italic">/ 5.0</span>
              </div>
              <div className="flex justify-center gap-1.5 mb-4">
                {renderStars(averageRating, 24)}
              </div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] bg-surface-container-low/50 px-4 py-2 rounded-xl inline-block border border-surface-container-low">
                {reviewCount} VERIFIED ENTRIES
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 relative z-10">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-4 group/bar">
                  <span className="text-[10px] font-black text-on-surface-variant/40 w-3">{star}</span>
                  <div className="flex-1 h-2.5 bg-surface-container-low rounded-full overflow-hidden border border-surface-container-low/50">
                    <div 
                      className="h-full bg-primary-container rounded-full shadow-[0_0_15px_rgba(246,139,30,0.3)] transition-all duration-1000" 
                      style={{ width: star === 5 ? '75%' : star === 4 ? '15%' : '5%' }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-on-surface-variant/60 w-10 text-right italic group-hover/bar:text-primary-container transition-colors">
                    {star === 5 ? '92%' : star === 4 ? '18%' : '5%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1">
          <div className="flex items-center gap-10 border-b-4 border-surface-container-low mb-12 bg-surface-container-low/10 p-2 rounded-[24px]">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-[18px] relative ${
                activeTab === 'all' 
                  ? 'bg-on-surface text-white shadow-xl translate-y-[-2px]' 
                  : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              All Data ({reviewCount})
            </button>
            <button 
              onClick={() => setActiveTab('images')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-[18px] relative ${
                activeTab === 'images' 
                  ? 'bg-on-surface text-white shadow-xl translate-y-[-2px]' 
                  : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Visual Proof (12)
            </button>
          </div>

          <div className="space-y-10">
            {reviews?.length === 0 ? (
              <div className="py-24 text-center bg-surface-container-low/10 rounded-[48px] border-4 border-dashed border-surface-container-low">
                <div className="w-20 h-20 bg-surface-container-lowest rounded-[28px] flex items-center justify-center mx-auto mb-8 border-4 border-surface-container-low shadow-soft">
                  <MessageSquare size={32} className="text-on-surface-variant/20" />
                </div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.4em] mb-2 italic">Zero Intel Found</h3>
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-relaxed">No telemetry data has been recorded for this asset yet.</p>
              </div>
            ) : (
              reviews?.map((review: any, idx: number) => (
                <div 
                  key={review.id} 
                  className="bg-surface-container-lowest p-10 rounded-[48px] border-4 border-surface-container-low shadow-soft hover:border-primary-container/10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 group"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-on-surface text-white rounded-2xl flex items-center justify-center font-black uppercase text-xl border-4 border-white/5 shadow-xl group-hover:rotate-6 transition-transform">
                        {review.user.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-sm font-black text-on-surface uppercase tracking-tighter leading-none">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <div className="flex items-center gap-2 bg-success/5 text-success px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 border-success/10">
                            <CheckCircle2 size={10} />
                            Verified Node
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <div className="w-1.5 h-1.5 bg-surface-container-low rounded-full" />
                          <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] italic">
                            {format(new Date(review.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface font-medium leading-relaxed mb-8 italic opacity-80 border-l-4 border-surface-container-low pl-6">
                    "{review.comment}"
                  </p>

                  {review.media?.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-8">
                      {review.media.map((img: any, i: number) => (
                        <div key={i} className="w-24 h-24 rounded-[24px] overflow-hidden border-4 border-surface-container-low hover:border-primary-container/30 transition-all cursor-zoom-in group/img">
                          <img src={img.url} alt="Review Evidence" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover/img:scale-110" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-8 pt-8 border-t-2 border-surface-container-low">
                    <button className="flex items-center gap-2.5 text-[9px] font-black text-on-surface-variant/40 hover:text-primary-container uppercase tracking-[0.4em] transition-all group/btn">
                      <ThumbsUp size={16} className="group-hover/btn:-translate-y-1 transition-transform" />
                      Helpful Log (0)
                    </button>
                    <button className="flex items-center gap-2.5 text-[9px] font-black text-on-surface-variant/20 hover:text-error uppercase tracking-[0.4em] transition-all ml-auto">
                      Flag Anomaly
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
