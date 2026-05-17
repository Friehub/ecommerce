// apps/web/src/components/home/AdBanners.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

const banners = [
  {
    id: '1',
    title: 'Free Delivery',
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=800',
    link: '/search?q=free+delivery',
  },
  {
    id: '2',
    title: 'Official Stores',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
    link: '/official-stores',
  }
];

export const AdBanners = () => {
  const { data: bannersData, isLoading } = api.content.getAdBanners.useQuery();

  const defaultBanners = [
    {
      id: 'ad-1',
      title: 'Free Delivery',
      imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=800',
      link: '/search?q=free+delivery',
    },
    {
      id: 'ad-2',
      title: 'Official Stores',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
      link: '/official-stores',
    }
  ];

  const banners = (bannersData && bannersData.length >= 2) 
    ? bannersData 
    : defaultBanners;

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="aspect-[21/9] rounded" />
        <Skeleton className="aspect-[21/9] rounded" />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {banners.map((banner: any) => (
        <Link 
          key={banner.id}
          href={banner.link || '#'}
          className="relative aspect-[21/9] rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow group bg-j-surface-container-highest"
        >
          <Image 
            src={banner.imageUrl} 
            alt={banner.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        </Link>
      ))}
    </section>
  );
};
