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

  const averageRating = stats?.averageRating || 0;
  const reviewCount = stats?.reviewCount || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="flex flex-col gap-2 pb-4 border-b border-j-outline-variant">
        <div className="flex items-center gap-2">
          <span className="text-display-lg font-bold text-jumia-orange">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-headline-sm font-bold text-j-text-muted">/ 5</span>
        </div>
        <div className="flex gap-0.5 text-jumia-orange">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={18} 
              fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} 
              className={i < Math.round(Number(averageRating)) ? "text-jumia-orange" : "text-j-outline-variant"} 
            />
          ))}
        </div>
        <p className="text-body-sm text-j-text-muted">{reviewCount} verified ratings</p>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-6">
        {reviews?.length === 0 ? (
          <p className="text-body-md text-j-text-muted italic py-4">No reviews yet for this product.</p>
        ) : (
          reviews?.map((review: any) => (
            <div key={review.id} className="flex flex-col gap-2 pb-4 border-b border-j-outline-variant last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-jumia-orange">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      fill={i < review.rating ? "currentColor" : "none"} 
                      className={i < review.rating ? "text-jumia-orange" : "text-j-outline-variant"} 
                    />
                  ))}
                </div>
                <span className="text-body-sm text-j-text-muted">
                  {format(new Date(review.createdAt), 'dd-MM-yyyy')}
                </span>
              </div>
              <h4 className="text-body-md font-bold text-j-text uppercase truncate">
                {review.comment.split('.')[0]}
              </h4>
              <p className="text-body-sm text-j-text">
                {review.comment}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-body-sm text-j-text-muted">
                  by {review.user.firstName}
                </p>
                <div className="flex items-center gap-1 text-j-success text-[10px] font-bold uppercase">
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
