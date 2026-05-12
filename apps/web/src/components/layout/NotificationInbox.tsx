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
    if (type === 'ORDER_STATUS_CHANGED') return <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center border border-green-100"><CheckCircle2 size={16} className="text-green-600" /></div>;
    if (type === 'DISPUTE_OPENED') return <div className="w-8 h-8 bg-error-container/10 rounded-xl flex items-center justify-center border border-error/10"><AlertTriangle size={16} className="text-error" /></div>;
    return <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100"><Info size={16} className="text-blue-600" /></div>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-2 text-on-surface-variant hover:text-primary-container transition-all"
      >
        <div className="w-10 h-10 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant group-hover:border-primary-container transition-colors shadow-sm">
          <Bell size={20} className="group-hover:scale-110 transition-transform" />
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-4 border-surface shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-surface-container-lowest rounded-[32px] shadow-2xl border-2 border-outline-variant z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-6 border-b border-outline-variant bg-surface flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-xs font-black text-on-surface uppercase tracking-[0.2em]">Notifications</h3>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-0.5 italic">Real-time alerts</p>
            </div>
            {unreadCount > 0 && (
              <span className="text-[9px] text-primary-container font-black uppercase tracking-[0.2em] bg-primary-container/10 px-2 py-1 rounded-lg border border-primary-container/20">
                {unreadCount} Unread
              </span>
            )}
          </div>
          
          <div className="max-h-[480px] overflow-y-auto divide-y divide-outline-variant/30 hide-scrollbar">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-3 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : unreadCount === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center border-2 border-outline-variant/30 mx-auto mb-4">
                  <MailOpen size={32} className="text-outline-variant" strokeWidth={1} />
                </div>
                <h4 className="text-xs font-black text-on-surface uppercase tracking-widest">All caught up</h4>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1 italic">Check back later for premium updates.</p>
              </div>
            ) : (
              notifications?.map((notif, idx) => (
                <div key={notif.id} className="p-6 hover:bg-surface-container-low transition-all flex gap-4 relative group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-on-surface font-black leading-snug uppercase tracking-tight line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="w-1 h-1 rounded-full bg-outline-variant opacity-40" />
                      <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
                        {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => markAsReadMutation.mutate({ notificationId: notif.id })}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error-container/10 rounded-xl transition-all"
                    title="Archive"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-surface border-t border-outline-variant text-center">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-colors">
              View All Communications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

