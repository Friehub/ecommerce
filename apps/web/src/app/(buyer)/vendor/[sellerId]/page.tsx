import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SellerStorefrontPage({ params }: { params: { sellerId: string } }) {
  // Use server components if possible, but let's assume standard trpc client usage for demo
  // In a real app, we'd fetch this on the server for SEO.
  
  return (
    <SellerStorefrontContent sellerId={params.sellerId} />
  );
}

function SellerStorefrontContent({ sellerId }: { sellerId: string }) {
  const { data: seller, isLoading: sellerLoading, error: sellerError } = trpc.iam.getPublicProfile.useQuery({ idOrSlug: sellerId });
  const { data: productsData, isLoading: productsLoading } = trpc.catalog.getSellerProducts.useQuery({ sellerId });

  if (sellerLoading) return <div className="p-8 text-center">Loading Storefront...</div>;
  if (sellerError || !seller) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-3xl font-bold">
          {seller.businessName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{seller.businessName}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-orange-500">★</span>
              <span className="font-medium text-gray-900">{seller.rating.toFixed(1)}</span>
              ({seller.reviewCount} reviews)
            </span>
            <span>•</span>
            <span>Member since {format(new Date(seller.memberSince), 'MMMM yyyy')}</span>
            <span>•</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">
              {seller.tier} SELLER
            </span>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{seller.productCount}</div>
          <div className="text-xs text-gray-500 uppercase font-medium">Products</div>
        </div>
      </div>

      {/* Product Grid */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Our Products</h2>
      
      {productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : productsData?.results?.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500 border-2 border-dashed">
          No active products found for this seller.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productsData?.results?.map((product: any) => (
            <Link 
              key={product.id} 
              href={`/product/${product.slug}`}
              className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square relative bg-gray-50">
                {product.media?.[0] ? (
                  <Image 
                    src={product.media[0].url} 
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm text-gray-700 line-clamp-2 min-h-[40px] mb-2">{product.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
                  {product.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">₦{product.comparePrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
