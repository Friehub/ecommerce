'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '../../trpc/react';
import { Bell, CheckCircle2, Info, AlertTriangle, X, MailOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Skeleton } from '../ui/Skeleton';

export function NotificationInbox() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const { data: notifications, isLoading } = api.notification.getUnread.useQuery(undefined, {
    enabled: !!session?.user,
    staleTime: 60000,
  });

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnread.invalidate();
    }
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const unreadCount = notifications?.length || 0;

  const getIcon = (type: string) => {
    if (type === 'ORDER_STATUS_CHANGED') return <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center border border-green-100"><CheckCircle2 size={16} className="text-green-600" /></div>;
    if (type === 'DISPUTE_OPENED') return <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center border border-red-100"><AlertTriangle size={16} className="text-j-error" /></div>;
    return <div className="w-8 h-8 bg-jumia-orange/5 rounded flex items-center justify-center border border-jumia-orange/10"><Info size={16} className="text-jumia-orange" /></div>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-j-text hover:text-jumia-orange transition-colors"
      >
        <Bell size={24} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-jumia-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-sm shadow-xl border border-j-border z-50 overflow-hidden">
          <div className="p-4 border-b border-j-border bg-j-surface-container-low flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-j-text uppercase tracking-tight">Notifications</h3>
              <p className="text-[10px] font-bold text-j-text-muted uppercase mt-0.5">Stay updated</p>
            </div>
            {unreadCount > 0 && (
              <span className="text-[9px] text-jumia-orange font-black uppercase bg-orange-50 px-2 py-1 rounded-sm border border-jumia-orange/20">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto divide-y divide-j-border">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : unreadCount === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-j-surface-container-low text-j-text-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <MailOpen size={24} />
                </div>
                <h4 className="text-xs font-black text-j-text uppercase tracking-tight">No new notifications</h4>
                <p className="text-[10px] font-bold text-j-text-muted mt-1 uppercase">Check back later for updates</p>
              </div>
            ) : (
              notifications?.map((notif, idx) => (
                <div key={notif.id} className="p-4 hover:bg-j-surface-container-lowest transition-colors flex gap-3 relative group">
                  <div className="shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-j-text leading-snug line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[9px] font-bold text-j-text-muted uppercase">
                        {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => markAsReadMutation.mutate({ notificationId: notif.id })}
                    className="absolute top-4 right-4 text-j-text-muted hover:text-j-error opacity-0 group-hover:opacity-100 transition-all"
                    title="Mark as read"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 bg-j-surface-container-low border-t border-j-border text-center">
            <button className="text-[10px] font-black uppercase text-j-text hover:text-jumia-orange transition-colors">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

