'use client';

import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '../trpc/react';
import { CartProvider } from '../context/CartContext';
import { SocketProvider } from './providers/SocketProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <SocketProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SocketProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}
