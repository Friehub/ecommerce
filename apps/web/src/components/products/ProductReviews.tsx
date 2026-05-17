// apps/web/src/components/products/ProductReviews.tsx
'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Star, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../ui/Skeleton';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { data: reviews, isLoading } = api.review.getByProduct.useQuery({ productId });
  const { data: stats } = api.review.getRatingStats.useQuery({ productId });

  const averageRating = Number(stats?.averageRating || 0);
  const reviewCount = stats?.reviewCount || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-sm" />
        <Skeleton className="h-32 w-full rounded-sm" />
        <Skeleton className="h-32 w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary */}
      <div className="flex flex-col gap-4 pb-8 border-b border-j-border">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-jumia-orange">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-lg font-black text-j-text-muted">/ 5</span>
        </div>
        <div className="space-y-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                fill={i < Math.round(Number(averageRating)) ? "#f68b1e" : "none"} 
                className={i < Math.round(Number(averageRating)) ? "text-jumia-orange" : "text-j-border"} 
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-j-text-muted">{reviewCount} verified ratings</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-8">
        {reviews?.length === 0 ? (
          <div className="text-center py-12 bg-j-background rounded-sm border-2 border-dashed border-j-border">
             <p className="text-[11px] font-black uppercase tracking-widest text-j-text-muted">No reviews yet</p>
          </div>
        ) : (
          reviews?.map((review: any) => (
            <div key={review.id} className="flex flex-col gap-3 pb-8 border-b border-j-border last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < review.rating ? "#f68b1e" : "none"} 
                      className={i < review.rating ? "text-jumia-orange" : "text-j-border"} 
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-j-text-muted uppercase">
                  {format(new Date(review.createdAt), 'dd MMM yyyy')}
                </span>
              </div>
              <h4 className="text-xs font-black text-j-text uppercase tracking-tight leading-tight">
                {review.comment.split('.')[0]}
              </h4>
              <p className="text-[11px] text-j-text font-medium leading-relaxed">
                {review.comment}
              </p>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-j-border/50">
                <p className="text-[10px] font-black text-j-text-muted uppercase tracking-tight">
                  by {review.user.firstName}
                </p>
                <div className="flex items-center gap-1.5 text-j-success text-[9px] font-black uppercase italic tracking-tighter">
                  <CheckCircle2 size={12} />
                  Verified Purchase
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
