// apps/web/src/app/(buyer)/search/page.tsx
import React from 'react';
import SearchClient from './SearchClient';
import { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search results for "${q}" | Jumia Nigeria` : 'Search Products | Jumia Nigeria';
  const description = q
    ? `Find the best deals and lowest prices on "${q}" online at Jumia Nigeria. Shop now for fast delivery and excellent customer support.`
    : 'Search and find quality items at the best prices on Jumia Nigeria.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: q ? `https://jumia-clone.staging.friehub.com/search?q=${encodeURIComponent(q)}` : 'https://jumia-clone.staging.friehub.com/search',
      siteName: 'Jumia Nigeria',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function SearchPage() {
  return (
    <div className="bg-j-background min-h-screen pb-24">
      <SearchClient />
    </div>
  );
}
