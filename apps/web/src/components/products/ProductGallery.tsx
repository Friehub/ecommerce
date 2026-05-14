// apps/web/src/components/products/ProductGallery.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; id: string }[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-j-background rounded-sm flex items-center justify-center text-j-text-muted text-[10px] font-black border-2 border-dashed border-j-border uppercase tracking-widest">
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
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white rounded-sm border border-j-border overflow-hidden group shadow-sm">
        <Image 
          src={selectedImage} 
          alt="Product Display" 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
        />
        
        <button 
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-white/90 p-2.5 rounded-full hover:bg-white shadow-lg transition-all text-j-text border border-j-border active:scale-90"
        >
          <Maximize2 size={18} />
        </button>

        {/* Nav Arrows for multi-image */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-j-border text-j-text"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-j-border text-j-text"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-16 h-16 flex-shrink-0 border-2 rounded-sm overflow-hidden bg-white p-1 transition-all shadow-sm ${
                selectedImageIndex === index 
                ? 'border-jumia-orange scale-105 z-10 shadow-md' 
                : 'border-j-border hover:border-j-text-muted opacity-70 hover:opacity-100'
              }`}
            >
              <Image 
                src={img.url} 
                alt={`Thumbnail ${index + 1}`} 
                width={64}
                height={64}
                className="object-contain w-full h-full" 
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-jumia-orange transition-all active:scale-90"
          >
            <X size={40} />
          </button>
          
          <div className="relative w-full max-w-4xl aspect-square">
            <Image 
              src={selectedImage} 
              alt="Full Product View" 
              fill
              sizes="90vw"
              className="object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4 active:scale-90"
                >
                  <ChevronLeft size={80} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4 active:scale-90"
                >
                  <ChevronRight size={80} />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-10 flex gap-2">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${selectedImageIndex === i ? 'bg-jumia-orange w-6' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
