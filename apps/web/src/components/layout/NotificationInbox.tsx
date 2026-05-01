'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/trpc/react';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function NotificationInbox() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications, isLoading } = api.notification.getUnread.useQuery(undefined, {
    enabled: !!session?.user,
    refetchInterval: 30000 // Poll every 30 seconds
  });

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      api.useUtils().notification.getUnread.invalidate();
    }
  });

  // Close dropdown when clicking outside
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
    if (type === 'ORDER_STATUS_CHANGED') return <CheckCircle size={16} className="text-green-500" />;
    if (type === 'DISPUTE_OPENED') return <AlertTriangle size={16} className="text-red-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-[#f68b1e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{unreadCount} unread</span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : unreadCount === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                All caught up
              </div>
            ) : (
              notifications?.map(notif => (
                <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 relative group">
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium leading-tight">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => markAsReadMutation.mutate({ notificationId: notif.id })}
                    className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-900 hover:bg-gray-200 rounded transition-all"
                    title="Mark as read"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
