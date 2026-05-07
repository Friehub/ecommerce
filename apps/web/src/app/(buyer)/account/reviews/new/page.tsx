'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Star, ChevronLeft, Loader2, Upload, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewReviewPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const { data: product, isLoading: productLoading } = api.catalog.getProductById.useQuery(
    { id: productId as string },
    { enabled: !!productId }
  );

  const utils = api.useUtils();
  const submitReview = api.review.create.useMutation({
    onSuccess: () => {
      utils.review.listMyReviews.invalidate();
      utils.review.getPendingReviews.invalidate();
      alert('Review submitted successfully! It will be visible after moderation.');
      router.push('/account/reviews');
    },
    onError: (err) => {
      alert(err.message || 'Failed to submit review');
    }
  });

  if (!productId) {
    return (
      <div className="container py-20 text-center select-none">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-extrabold mb-4 text-gray-900 leading-tight uppercase">Invalid Request</h2>
        <Link href="/account/reviews" className="text-[#F68B1E] font-extrabold text-sm hover:underline uppercase tracking-tight">Back to My Reviews</Link>
      </div>
    );
  }

  if (productLoading) {
    return <div className="container py-20 text-center font-extrabold text-gray-500 uppercase tracking-widest text-xs">Loading product details...</div>;
  }

  if (!product) {
    return <div className="container py-20 text-center font-extrabold text-gray-900 leading-tight uppercase tracking-tight select-none">Product not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    submitReview.mutate({
      productId: product.id,
      rating,
      comment,
    });
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-2xl mx-auto px-4">
        <Link href="/account/reviews" className="flex items-center gap-1 text-gray-500 hover:text-[#F68B1E] transition-colors font-bold text-xs mb-6 select-none uppercase tracking-tight">
          <ChevronLeft size={16} />
          Back to My Reviews
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
              Rate & Review
            </h1>

            <div className="flex gap-4 mb-8 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={product.media?.[0]?.url} alt={product.title} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight mb-1">{product.title}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Purchase</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Selector */}
              <div className="text-center py-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tap to rate</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-all duration-200 transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        size={42} 
                        className={`transition-colors duration-200 ${
                          star <= (hoverRating || rating) 
                            ? "text-[#F68B1E] fill-[#F68B1E]" 
                            : "text-gray-100 fill-gray-100"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-black text-[#F68B1E] mt-4 uppercase tracking-tighter">
                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                  </p>
                )}
              </div>

              {/* Comment Field */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How was the quality?"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#F68B1E] transition-all min-h-[160px] resize-none shadow-inner"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitReview.isLoading || rating === 0}
                className="w-full bg-[#F68B1E] hover:bg-[#e07b14] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95 duration-200 flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
              >
                {submitReview.isLoading ? <Loader2 className="animate-spin" /> : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
