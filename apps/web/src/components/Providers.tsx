'use client';

import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '@/trpc/react';
import { CartProvider } from '@/context/CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}
