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
      <div className="aspect-square bg-j-surface-container-low rounded flex items-center justify-center text-j-text-muted text-body-sm border border-j-outline-variant">
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
      <div className="relative aspect-square bg-j-surface-container-lowest rounded border border-j-outline-variant overflow-hidden group">
        <Image 
          src={selectedImage} 
          alt="Product Display" 
          fill
          priority
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        
        <button 
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm transition-all"
        >
          <Maximize2 size={18} className="text-j-text" />
        </button>

        {/* Nav Arrows for multi-image */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} className="text-j-text" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} className="text-j-text" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-16 h-16 flex-shrink-0 border rounded overflow-hidden bg-j-surface-container-lowest p-1 transition-all ${
                selectedImageIndex === index 
                ? 'border-jumia-orange' 
                : 'border-j-outline-variant hover:border-j-text'
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
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-jumia-orange transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="relative w-full max-w-4xl aspect-square">
            <Image 
              src={selectedImage} 
              alt="Full Product View" 
              fill
              className="object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronLeft size={64} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronRight size={64} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
