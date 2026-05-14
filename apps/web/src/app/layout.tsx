// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/cart/CartDrawer";
import { ReferralTracker } from "../components/affiliate/ReferralTracker";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Jumia Nigeria | Online Shopping for Electronics, Fashion & More",
  description: "Shop Jumia Nigeria. Best prices on phones, fashion, electronics and more. Fast delivery across Nigeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-j-bg text-j-text min-h-screen flex flex-col">
        <Providers>
          <ReferralTracker />
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
