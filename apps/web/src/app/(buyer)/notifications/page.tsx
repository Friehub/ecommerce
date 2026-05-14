'use client';

import React from 'react';
import { Bell, Clock, ShoppingBag, Zap, ChevronRight, ArrowRight, MailOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const utils = api.useUtils();

  const { data: notifications, isLoading } = api.notification.listNotifications.useQuery(
    { limit: 50, offset: 0 },
    { enabled: !!session?.user }
  );

  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnread.invalidate();
      utils.notification.listNotifications.invalidate();
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ notificationId: id });
  };

  const getIcon = (type: string) => {
    if (type === 'ORDER_STATUS_CHANGED') return <ShoppingBag size={20} />;
    if (type === 'PROMO') return <Zap size={20} />;
    return <div className="w-2 h-2 bg-current rounded-full" />;
  };

  return (
    <div className="bg-background min-h-screen pb-12 select-none">
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8 font-semibold text-on-surface-variant text-[10px] uppercase">
          <Link href="/" className="hover:text-jumia-orange transition-colors">Home</Link>
          <ChevronRight size={14} className="opacity-30" />
          <Link href="/account" className="hover:text-jumia-orange transition-colors">My Account</Link>
          <ChevronRight size={14} className="opacity-30" />
          <span className="text-on-surface">Notifications</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft overflow-hidden transition-all hover:border-jumia-orange/20">
            <div className="px-10 py-8 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-jumia-orange/10 rounded-2xl flex items-center justify-center text-jumia-orange border-2 border-jumia-orange/20">
                  <Bell size={24} />
                </div>
                <h1 className="text-xl font-semibold text-on-surface uppercase tracking-tighter">Notifications</h1>
              </div>
            </div>

            {isLoading ? (
              <div className="divide-y-4 divide-surface-container-low">
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
              <div className="divide-y-4 divide-surface-container-low">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className="group relative p-10 flex items-start gap-8 hover:bg-surface-container-low/20 transition-all duration-500"
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-jumia-orange rounded-r-full shadow-lg shadow-primary-container/30 animate-pulse" />
                    )}
                    <div className={`w-14 h-14 rounded-sm flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${notification.isRead ? 'bg-surface-container-low text-on-surface-variant/20 border-surface-container-low' : 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20 shadow-sm'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className={`text-base font-semibold uppercase tracking-tight transition-colors ${notification.isRead ? 'text-on-surface-variant/40' : 'text-on-surface group-hover:text-jumia-orange'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[9px] font-semibold text-on-surface-variant/30 uppercase tracking-widest italic bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/10">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <p className={`text-xs font-bold leading-relaxed mb-6 transition-colors ${notification.isRead ? 'text-on-surface-variant/30 italic' : 'text-on-surface-variant'}`}>
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-4">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="inline-flex items-center gap-3 text-[10px] font-semibold text-jumia-orange uppercase hover:translate-x-2 transition-transform bg-jumia-orange/5 px-4 py-2 rounded-xl border border-jumia-orange/10"
                          >
                            View <ArrowRight size={14} />
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsRead.isLoading}
                            className="inline-flex items-center gap-2 text-[9px] font-semibold text-on-surface-variant/40 uppercase hover:text-jumia-orange transition-colors"
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
                <Bell size={64} className="mx-auto text-on-surface-variant/5 mb-8" />
                <h3 className="text-2xl font-semibold text-on-surface uppercase tracking-tighter">No notifications</h3>
                <p className="text-on-surface-variant/40 text-[10px] font-semibold uppercase mt-4 italic">
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
