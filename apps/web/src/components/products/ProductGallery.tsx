'use client';

import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; id: string }[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 font-black uppercase tracking-widest text-[10px] border border-gray-100">
        No images available
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex]?.url;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Main Image Container */}
      <div className="relative aspect-square bg-white rounded-[32px] border border-gray-100 overflow-hidden group shadow-xl shadow-black/[0.02]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.02] pointer-events-none" />
        
        <img 
          src={selectedImage} 
          alt="Product" 
          className="w-full h-full object-contain p-6 md:p-10 transition-all duration-700 ease-out group-hover:scale-110"
        />

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={() => setIsLightboxOpen(true)}
            className="w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center text-gray-900 hover:bg-[#F68B1E] hover:text-white transition-all active:scale-90"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between md:hidden pointer-events-none">
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-900 pointer-events-auto active:scale-90"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-900 pointer-events-auto active:scale-90"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelectedImageIndex(index)}
            className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 border-2 rounded-2xl overflow-hidden bg-white p-1.5 transition-all snap-start relative group ${
              selectedImageIndex === index 
                ? 'border-[#F68B1E] shadow-lg shadow-orange-500/10' 
                : 'border-gray-50 hover:border-gray-200'
            }`}
          >
            <img src={img.url} alt="Thumbnail" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
            {selectedImageIndex === index && (
              <div className="absolute inset-0 bg-orange-500/5 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
          <div className="p-4 flex justify-between items-center border-b bg-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Image {selectedImageIndex + 1} of {images.length}
            </span>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center bg-gray-50/50">
            <img 
              src={selectedImage} 
              alt="Full Product View" 
              className="max-w-full max-h-[70vh] object-contain p-6"
            />
            
            {/* Lightbox Nav */}
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button 
                onClick={prevImage}
                className="w-12 h-12 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-gray-900 pointer-events-auto hover:bg-[#F68B1E] hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage}
                className="w-12 h-12 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-gray-900 pointer-events-auto hover:bg-[#F68B1E] hover:text-white transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 border-t bg-white">
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {images.map((img, index) => (
                  <button
                    key={`lb-${img.id}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 flex-shrink-0 border-2 rounded-xl overflow-hidden bg-white p-1 transition-all ${
                      selectedImageIndex === index ? 'border-[#F68B1E]' : 'border-gray-100'
                    }`}
                  >
                    <img src={img.url} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
