'use client';

import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; id: string }[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface-container-low rounded-[48px] flex items-center justify-center text-on-surface-variant font-black uppercase tracking-widest text-[10px] border border-outline-variant/30">
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
    <div className="flex flex-col gap-6 select-none animate-in fade-in slide-in-from-left-8 duration-700">
      {/* Main Image Container */}
      <div className="relative aspect-square bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low overflow-hidden group shadow-soft transition-all duration-500 hover:shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container/5 via-transparent to-transparent opacity-50" />
        
        <Image 
          src={selectedImage} 
          alt="Product Display" 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8 md:p-14 transition-all duration-[2s] ease-out group-hover:scale-110"
        />

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
          <button 
            onClick={() => setIsLightboxOpen(true)}
            className="w-14 h-14 bg-surface-container-lowest shadow-2xl rounded-2xl flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-white transition-all active:scale-90 border border-outline-variant/10"
            aria-label="Maximize image"
          >
            <Maximize2 size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between md:hidden pointer-events-none">
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="w-12 h-12 bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-on-surface pointer-events-auto active:scale-90 border border-outline-variant/10"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="w-12 h-12 bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-on-surface pointer-events-auto active:scale-90 border border-outline-variant/10"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-2">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelectedImageIndex(index)}
            className={`w-24 h-24 md:w-32 md:h-32 flex-shrink-0 border-4 rounded-[32px] overflow-hidden bg-surface-container-lowest p-2 transition-all duration-500 snap-start relative group ${
              selectedImageIndex === index 
                ? 'border-primary-container shadow-xl shadow-primary-container/10 -translate-y-2' 
                : 'border-surface-container-low hover:border-outline-variant'
            }`}
          >
            <Image 
              src={img.url} 
              alt={`Product Thumbnail ${index + 1}`} 
              fill
              sizes="(max-width: 768px) 100px, 150px"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-110" 
            />
            {selectedImageIndex === index && (
              <div className="absolute inset-0 bg-primary-container/5 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-surface-container-lowest flex flex-col animate-in fade-in zoom-in-95 duration-500">
          <div className="p-6 flex justify-between items-center border-b-2 border-surface-container-low bg-surface-container-lowest">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40 leading-none">
                Visual Inspection Mode
              </span>
              <span className="text-sm font-black uppercase text-on-surface mt-2 tracking-tighter">
                Image {selectedImageIndex + 1} of {images.length}
              </span>
            </div>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="w-14 h-14 flex items-center justify-center text-on-surface hover:bg-surface-container-low rounded-2xl transition-all active:scale-90"
              aria-label="Close lightbox"
            >
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center bg-surface-container-low/20">
            <div className="relative w-[90vw] h-[70vh]">
              <Image 
                src={selectedImage} 
                alt="Full Product View" 
                fill
                sizes="90vw"
                className="object-contain p-8 drop-shadow-2xl animate-in zoom-in-90 duration-700"
              />
            </div>
            
            {/* Lightbox Nav */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button 
                onClick={prevImage}
                className="w-16 h-16 bg-surface-container-lowest shadow-2xl rounded-2xl flex items-center justify-center text-on-surface pointer-events-auto hover:bg-primary-container hover:text-white transition-all active:scale-90 border-2 border-surface-container-low"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>
              <button 
                onClick={nextImage}
                className="w-16 h-16 bg-surface-container-lowest shadow-2xl rounded-2xl flex items-center justify-center text-on-surface pointer-events-auto hover:bg-primary-container hover:text-white transition-all active:scale-90 border-2 border-surface-container-low"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="p-8 border-t-2 border-surface-container-low bg-surface-container-lowest">
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center">
                {images.map((img, index) => (
                  <button
                    key={`lb-${img.id}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 flex-shrink-0 border-4 rounded-2xl overflow-hidden bg-surface-container-lowest p-1.5 transition-all duration-500 relative ${
                      selectedImageIndex === index ? 'border-primary-container -translate-y-1 shadow-lg' : 'border-surface-container-low'
                    }`}
                  >
                    <Image 
                      src={img.url} 
                      alt={`Lightbox Thumbnail ${index + 1}`} 
                      fill
                      sizes="80px"
                      className="object-contain p-1.5" 
                    />
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
