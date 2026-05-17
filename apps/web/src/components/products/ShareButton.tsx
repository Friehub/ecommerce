'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on Jumia!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`w-10 h-10 border rounded-full flex items-center justify-center transition-all ${
        copied
          ? 'bg-green-50 border-green-200 text-green-600'
          : 'border-j-border hover:bg-orange-50 hover:text-jumia-orange text-j-text-muted animate-in fade-in duration-300'
      }`}
      title={copied ? 'URL Copied!' : 'Share this product'}
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}
