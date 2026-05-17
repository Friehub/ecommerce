// apps/web/src/app/(buyer)/category/[slug]/page.tsx
import React from 'react';
import { api } from '@/trpc/server';
import CategoryClient from './CategoryClient';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await api.catalog.getCategoryBySlug.query({ slug });
    if (!category) {
      return {
        title: 'Category Not Found | Jumia Nigeria',
        description: 'The requested category could not be found.',
      };
    }

    const title = `${category.name} - Shop Online | Jumia Nigeria`;
    const description = `Shop standard quality ${category.name} products on Jumia Nigeria. Enjoy discount prices, fast delivery, and premium buyer protection!`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://jumia-clone.staging.friehub.com/category/${slug}`,
        siteName: 'Jumia Nigeria',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (err) {
    return {
      title: 'Shop Categories | Jumia Nigeria',
      description: 'Find products in categories on Jumia Nigeria.',
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}
