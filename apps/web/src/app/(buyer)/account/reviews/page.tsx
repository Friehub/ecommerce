'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ChevronRight, ThumbsUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      productTitle: 'Premium Wireless Headphones',
      rating: 5,
      comment: 'Absolutely amazing sound quality and long-lasting battery. Worth every single Naira.',
      date: 'May 01, 2026',
      helpful: 4
    }
  ]);

  const [productTitle, setProductTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle.trim() || !comment.trim()) return;

    const newRev = {
      id: reviews.length + 1,
      productTitle,
      rating,
      comment,
      date: 'Today',
      helpful: 0
    };
    setReviews([newRev, ...reviews]);
    setProductTitle('');
    setRating(5);
    setComment('');
  };

  const handleHelpful = (id: number) => {
    setReviews((prev) =>
      prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r)
    );
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/" className="hover:text-[#F68B1E] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link href="/account" className="hover:text-[#F68B1E] transition-colors">My Account</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Reviews & Ratings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Write a Review */}
          <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 p-6 shadow-md h-fit">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-3 mb-4 select-none">
              <MessageSquare size={16} className="text-[#F68B1E]" /> Write Review
            </h2>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wide leading-tight mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="e.g., Ultra Smartwatch Series 7"
                  className="w-full h-11 px-3 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-xs md:text-sm text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wide leading-tight mb-1">Rating</label>
                <select 
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full h-11 px-3 border border-gray-200 focus:border-[#F68B1E] rounded-xl outline-none font-extrabold text-xs md:text-sm text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200 cursor-pointer select-none"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Very Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wide leading-tight mb-1">Feedback</label>
                <textarea 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience using the product..."
                  className="w-full p-3 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-xs md:text-sm text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200 leading-normal resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full h-11 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 duration-200 flex items-center justify-center select-none"
              >
                Submit Feedback
              </button>
            </form>
          </div>

          {/* List of Previous Reviews */}
          <div className="md:col-span-2 space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-5 shadow-md flex flex-col justify-between select-text">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-gray-900 tracking-tight leading-tight select-none">{rev.productTitle}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-bold select-none">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" className="text-yellow-400 flex-shrink-0" />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-xl border border-green-100/50 select-none flex-shrink-0">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-wide">Verified Buy</span>
                  </div>
                </div>

                <p className="text-xs md:text-sm font-medium text-gray-600 leading-relaxed max-w-2xl">{rev.comment}</p>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between select-none">
                  <button 
                    onClick={() => handleHelpful(rev.id)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#F68B1E] hover:bg-orange-50/60 px-3 py-1.5 rounded-xl transition-all duration-200"
                  >
                    <ThumbsUp size={14} />
                    Helpful ({rev.helpful})
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">Social verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
