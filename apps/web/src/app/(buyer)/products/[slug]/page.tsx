// apps/web/src/app/(buyer)/products/[slug]/page.tsx
import { api } from '@/trpc/server';
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductActions } from "@/components/products/ProductActions";
import { ProductReviews } from "@/components/products/ProductReviews";
import { ChevronRight, Star, Share2, MapPin, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Link from 'next/link';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await api.catalog.getProductBySlug.query({ slug });

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants?.[0];
  const price = Number(primaryVariant?.price ?? 0);
  const originalPrice = Number(primaryVariant?.comparePrice ?? 0);
  const discount = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-j-background min-h-screen pb-12">
      <div className="max-w-container-max mx-auto px-margin-desktop py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4 text-body-sm text-j-text-muted">
          <Link href="/" className="hover:text-jumia-orange">Home</Link>
          <ChevronRight size={14} />
          <Link href={`/category/${product.category.slug}`} className="hover:text-jumia-orange">{product.category.name}</Link>
          <ChevronRight size={14} />
          <span className="text-j-text truncate">{product.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Main Info Card */}
          <div className="flex-1 bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6 md:gap-10">
              {/* Left: Gallery */}
              <div className="w-full md:w-[400px]">
                <ProductGallery images={product.media} />
                <div className="mt-6 pt-6 border-t border-j-outline-variant">
                  <h4 className="text-body-md font-bold mb-4 uppercase">Share this product</h4>
                  <div className="flex gap-4">
                    <button className="p-2 border border-j-outline-variant rounded-full hover:bg-j-surface-container-low transition-colors">
                      <Share2 size={18} className="text-j-text" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Info */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-blue-600 font-medium hover:underline cursor-pointer">
                      Brand: {product.brand.name}
                    </span>
                    {product.isOfficial && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Official Store
                      </span>
                    )}
                  </div>
                  <h1 className="text-headline-md font-bold text-j-text">
                    {product.title}
                  </h1>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 border-b border-j-outline-variant pb-4">
                  <div className="flex gap-0.5 text-jumia-orange">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < Math.round(Number(product.averageRating) || 0) ? "currentColor" : "none"} 
                        className={i < Math.round(Number(product.averageRating) || 0) ? "text-jumia-orange" : "text-j-outline-variant"} 
                      />
                    ))}
                  </div>
                  <span className="text-body-sm text-blue-600 hover:underline cursor-pointer">
                    ({product.reviewCount || 0} verified ratings)
                  </span>
                </div>

                {/* Price Area */}
                <div className="py-2 border-b border-j-outline-variant">
                  <div className="flex items-baseline gap-3">
                    <span className="text-price-lg font-extrabold text-j-text">
                      ₦ {price.toLocaleString()}
                    </span>
                    {discount > 0 && (
                      <span className="bg-jumia-orange/10 text-jumia-orange text-body-sm font-bold px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  {originalPrice > price && (
                    <p className="text-body-md text-j-text-muted line-through">
                      ₦ {originalPrice.toLocaleString()}
                    </p>
                  )}
                  <p className="text-body-sm text-j-text mt-1">
                    {product.inventory > 0 ? `+ shipping from ₦ 500 to Lagos` : 'Out of Stock'}
                  </p>
                </div>

                <ProductActions product={product} />
              </div>
            </div>
          </div>

          {/* Sidebar: Delivery & Seller */}
          <div className="w-full lg:w-[300px] flex flex-col gap-gutter">
            {/* Delivery Info */}
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
                <h3 className="text-label-bold font-bold uppercase">Delivery & Returns</h3>
              </div>
              <div className="p-4 flex flex-col gap-6">
                <div className="flex gap-3">
                  <Truck size={24} className="text-j-text shrink-0" />
                  <div>
                    <h4 className="text-body-sm font-bold">Door Delivery</h4>
                    <p className="text-body-sm text-j-text-muted mt-0.5">Ready for delivery between 22 May & 24 May</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <RotateCcw size={24} className="text-j-text shrink-0" />
                  <div>
                    <h4 className="text-body-sm font-bold">Return Policy</h4>
                    <p className="text-body-sm text-j-text-muted mt-0.5">Free return within 15 days for Official Store items and 7 days for other items.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
                <h3 className="text-label-bold font-bold uppercase">Seller Information</h3>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col">
                  <h4 className="text-body-md font-bold">{product.seller.businessName || "Verified Merchant"}</h4>
                  <p className="text-body-sm text-j-success font-medium mt-1">98% Seller Score</p>
                </div>
                <button className="w-full border border-jumia-orange text-jumia-orange py-2 rounded font-bold text-label-bold uppercase hover:bg-jumia-orange/5 transition-all">
                  Follow Store
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Reviews */}
        <div className="mt-gutter flex flex-col lg:flex-row gap-gutter">
          <div className="flex-1 flex flex-col gap-gutter">
            {/* Description */}
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
                <h3 className="text-label-bold font-bold uppercase">Product Details</h3>
              </div>
              <div className="p-4 prose prose-sm max-w-none text-j-text">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
                <h3 className="text-label-bold font-bold uppercase">Specifications</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {Object.entries(product.variants[0]?.attributes || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-j-outline-variant/30 text-body-sm">
                      <span className="font-bold text-j-text-muted">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-j-text">{value as string}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-b border-j-outline-variant/30 text-body-sm">
                    <span className="font-bold text-j-text-muted">SKU:</span>
                    <span className="text-j-text uppercase">{product.variants[0]?.sku}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Side (on large screen) */}
          <div className="w-full lg:w-[300px]">
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-j-outline-variant bg-j-surface-container-low">
                <h3 className="text-label-bold font-bold uppercase">Verified Reviews</h3>
              </div>
              <div className="p-4">
                <ProductReviews productId={product.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
