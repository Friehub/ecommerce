import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
 subsets: ["latin"],
 display: 'swap',
});

export const metadata: Metadata = {
 title: "Jumia Clone | Shop Online for Electronics, Fashion & More",
 description: "Shop at Jumia, Nigeria's #1 online store. Fast delivery, best prices, and secure payment.",
};

import { Providers } from "../components/Providers";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/cart/CartDrawer";
import { ReferralTracker } from "../components/affiliate/ReferralTracker";

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className={urbanist.className} suppressHydrationWarning>
 <body className="flex flex-col min-h-screen bg-background antialiased">
 <Providers>
 <ReferralTracker />
 <Navbar />
 <CartDrawer />
 <main className="flex-1">
 {children}
 </main>
 <Footer />
 </Providers>
 </body>
 </html>
 );
}
