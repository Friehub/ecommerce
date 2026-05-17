'use client';

import React, { useEffect } from 'react';
import { Bell, Clock, ShoppingBag, Zap, ChevronRight, ArrowRight, MailOpen, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/notifications')}`);
    }
  }, [status, router]);

  const { data: notifications, isLoading } = api.notification.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: !!session?.user }
  );

  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnread.invalidate();
      utils.notification.list.invalidate();
    },
  });

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnread.invalidate();
      utils.notification.list.invalidate();
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ notificationId: id });
  };

  const getIcon = (type: string) => {
    if (type === 'ORDER_UPDATE') return <ShoppingBag size={20} className="text-jumia-orange" />;
    if (type === 'BILLING_UPDATE') return <Zap size={20} className="text-yellow-600" />;
    if (type === 'SELLER_UPDATE') return <Bell size={20} className="text-blue-600" />;
    if (type === 'DISPUTE_UPDATE') return <AlertTriangle size={20} className="text-red-600" />;
    return <Bell size={20} className="text-jumia-orange" />;
  };

  if (status === 'loading') {
    return (
      <div className="bg-j-background min-h-screen pb-12 select-none">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-96 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-12 select-none">
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8 font-black text-j-text-muted text-[10px] uppercase tracking-widest px-2">
          <Link href="/" className="hover:text-jumia-orange transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/account" className="hover:text-jumia-orange transition-colors">My Account</Link>
          <ChevronRight size={12} />
          <span className="text-j-text">Notifications</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-sm border border-j-border shadow-2xl overflow-hidden transition-all hover:border-jumia-orange/20">
            {/* Page Header */}
            <div className="px-10 py-8 border-b-4 border-j-background flex items-center justify-between bg-j-background/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-jumia-orange/10 rounded-2xl flex items-center justify-center text-jumia-orange border-2 border-jumia-orange/20 shadow-sm">
                  <Bell size={24} />
                </div>
                <h1 className="text-xl font-black text-j-text uppercase tracking-tight leading-none">Notifications</h1>
              </div>
              
              {notifications && notifications.some((n: any) => !n.isRead) && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isLoading}
                  className="text-[10px] font-black text-jumia-orange uppercase tracking-widest hover:text-orange-600 transition-colors flex items-center gap-2 border-2 border-jumia-orange/20 px-4 py-2 rounded-sm bg-white shadow-sm disabled:opacity-50"
                >
                  <MailOpen size={14} /> Mark all as read
                </button>
              )}
            </div>

            {/* List Body */}
            {isLoading ? (
              <div className="divide-y-4 divide-j-background">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-10 flex items-start gap-8">
                    <Skeleton className="w-14 h-14 rounded-sm shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y-4 divide-j-background">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className="group relative p-10 flex items-start gap-8 hover:bg-j-background/20 transition-all duration-500 text-left"
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-jumia-orange rounded-r-full shadow-lg shadow-primary-container/30" />
                    )}
                    <div className={`w-14 h-14 rounded-sm flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 group-hover:scale-110 ${notification.isRead ? 'bg-j-background text-j-text-muted/40 border-j-border' : 'bg-jumia-orange/10 border-jumia-orange/20 shadow-sm'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className={`text-base font-black uppercase tracking-tight transition-colors ${notification.isRead ? 'text-j-text-muted/40' : 'text-j-text group-hover:text-jumia-orange'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[9px] font-black text-j-text-muted/50 uppercase tracking-widest italic bg-j-background px-3 py-1 rounded-sm border border-j-border">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <p className={`text-xs font-bold leading-relaxed mb-6 transition-colors ${notification.isRead ? 'text-j-text-muted/40 italic' : 'text-j-text-muted'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsRead.isLoading}
                            className="inline-flex items-center gap-2 text-[9px] font-black text-j-text-muted/40 uppercase hover:text-jumia-orange transition-colors"
                          >
                            <MailOpen size={14} /> Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center px-4 animate-in fade-in zoom-in-95 duration-1000">
                <Bell size={64} className="mx-auto text-j-text-muted/10 mb-8 animate-pulse" />
                <h3 className="text-2xl font-black text-j-text uppercase tracking-tighter">No notifications</h3>
                <p className="text-j-text-muted/40 text-[10px] font-black uppercase mt-4 italic tracking-widest">
                  You are all caught up. Nothing new to see here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
