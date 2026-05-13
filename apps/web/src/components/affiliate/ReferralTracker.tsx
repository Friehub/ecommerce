'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { api } from '@/trpc/react';

function ReferralTrackerContent() {
 const searchParams = useSearchParams();
 const ref = searchParams.get('ref');
 const recordClick = api.affiliate.recordClick.useMutation();

 useEffect(() => {
 if (ref) {
 // Get session ID from local storage (synced with cart)
 const sessionId = localStorage.getItem('cart_session_id') || 'anonymous';
 
 recordClick.mutate({ 
 slug: ref, 
 sessionId 
 }, {
 onSuccess: (data) => {
 // Set cookie with 30 day expiry
 const expires = new Date();
 expires.setDate(expires.getDate() + 30);
 document.cookie = `referralLinkId=${data.linkId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
 
 console.log(`[Affiliate] Referral click recorded: ${ref}`);
 },
 onError: (err) => {
 console.warn(`[Affiliate] Failed to record referral click:`, err.message);
 }
 });
 }
 }, [ref, recordClick]);

 return null;
}

export function ReferralTracker() {
 return (
 <Suspense fallback={null}>
 <ReferralTrackerContent />
 </Suspense>
 );
}
