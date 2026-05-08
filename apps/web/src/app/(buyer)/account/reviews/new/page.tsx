'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Star, Camera, ChevronLeft, Send, Loader2 } from 'lucide-react';
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
      alert('Review submitted successfully! It will appear once approved.');
      router.push('/account/reviews');
    },
    onError: (err) => {
      alert(err.message || 'Failed to submit review');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    if (!comment) return alert('Please enter a comment');
    if (!productId) return;

    setIsSubmitting(true);
    createReview.mutate({
      productId,
      rating,
      comment,
      images: [] // TODO: Implement image upload
    });
  };

  if (productLoading) return <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Loading Product Info...</div>;
  if (!product) return <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-red-500">Product not found</div>;

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-2xl mx-auto px-4">
        <Link 
          href="/account/reviews"
          className="flex items-center gap-2 mb-8 text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-[#F68B1E] transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Reviews
        </Link>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-white to-gray-50/30">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Rate & Review</h1>
            
            <div className="flex items-center gap-6 p-4 bg-orange-50/30 rounded-2xl border border-orange-100">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-orange-100/50 shrink-0 overflow-hidden">
                <img src={product.media[0]?.url} alt={product.title} className="w-full h-full object-contain p-2" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-gray-900 leading-tight truncate">{product.title}</h3>
                <p className="text-[10px] font-bold text-[#F68B1E] uppercase tracking-widest mt-1">Verified Purchase</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Rating Stars */}
            <div className="text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">How would you rate this product?</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-all duration-300 hover:scale-125 active:scale-95"
                  >
                    <Star 
                      size={40} 
                      className={`transition-colors duration-300 ${
                        (hover || rating) >= star ? 'text-orange-400 fill-orange-400' : 'text-gray-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-4 animate-bounce">
                  {['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'][rating - 1]}!
                </p>
              )}
            </div>

            {/* Comment Area */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product... Was it what you expected? How is the quality?"
                className="w-full min-h-[160px] p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium leading-relaxed"
              />
            </div>

            {/* Photo Upload (Placeholder UI) */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Add Photos</label>
              <div className="flex gap-4">
                <button type="button" className="w-24 h-24 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-orange-200 hover:text-orange-300 transition-all">
                  <Camera size={24} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Add Photo</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                isSubmitting || rating === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#F68B1E] to-[#DF3131] text-white hover:shadow-orange-200/50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewFormContent />
    </Suspense>
  );
}
