'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { api } from '../trpc/react';

interface CartContextType {
 cart: any;
 isLoading: boolean;
 addToCart: (variantId: string, quantity: number) => Promise<void>;
 updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
 removeFromCart: (cartItemId: string) => Promise<void>;
 totalItems: number;
 isOpen: boolean;
 setIsOpen: (open: boolean) => void;
 sessionId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
 const [sessionId] = useState<string | null>(() => {
 if (typeof window === 'undefined') return null;
 let id = localStorage.getItem('cart_session_id');
 if (!id) {
 id = nanoid();
 localStorage.setItem('cart_session_id', id);
 }
 return id;
 });
 const [isOpen, setIsOpen] = useState(false);

 const utils = api.useUtils();

 const { data: cart, isLoading, refetch } = api.cart.get.useQuery(
 {},
 { enabled: !!sessionId }
 );

 const addMutation = api.cart.add.useMutation({
 onSuccess: () => {
 utils.cart.get.invalidate();
 setIsOpen(true);
 }
 });

 const updateMutation = api.cart.updateQuantity.useMutation({
 onSuccess: () => {
 utils.cart.get.invalidate();
 }
 });

 const removeMutation = api.cart.remove.useMutation({
 onSuccess: () => {
 utils.cart.get.invalidate();
 }
 });

 const addToCart = async (variantId: string, quantity: number) => {
 if (!sessionId) return;
 await addMutation.mutateAsync({ variantId, quantity });
 };

 const updateQuantity = async (cartItemId: string, quantity: number) => {
 await updateMutation.mutateAsync({ cartItemId, quantity });
 };

 const removeFromCart = async (cartItemId: string) => {
 await removeMutation.mutateAsync({ cartItemId });
 };

 const totalItems = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

 return (
 <CartContext.Provider 
 value={{ 
 cart, 
 isLoading, 
 addToCart, 
 updateQuantity, 
 removeFromCart, 
 totalItems,
 isOpen,
 setIsOpen,
 sessionId
 }}
 >
 {children}
 </CartContext.Provider>
 );
};

export const useCart = () => {
 const context = useContext(CartContext);
 if (context === undefined) {
 throw new Error('useCart must be used within a CartProvider');
 }
 return context;
};
