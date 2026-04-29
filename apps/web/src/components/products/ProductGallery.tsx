'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
  images: { url: string; id: string }[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || '');

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square bg-white rounded-lg border overflow-hidden relative group">
        <img 
          src={selectedImage} 
          alt="Product" 
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img.url)}
            className={`w-20 h-20 flex-shrink-0 border-2 rounded-md overflow-hidden bg-white p-1 transition-all ${
              selectedImage === img.url ? 'border-[#F68B1E]' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img src={img.url} alt="Thumbnail" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
};
