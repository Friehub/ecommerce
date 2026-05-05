'use client';

import React from 'react';
import { api } from '../../../trpc/react';
import { Bell, Check, Trash2, MailOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
  const utils = api.useUtils();
  const { data: notifications, isLoading } = api.notification.list.useQuery();
  
  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate()
  });

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnread.invalidate();
    }
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ notificationId: id });
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/account" className="hover:text-[#F68B1E] transition-colors">My Account</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Notifications</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
            <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Bell size={22} className="text-[#F68B1E]" />
              Notifications
            </h1>
            {notifications && notifications.some(n => !n.isRead) && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-xs font-extrabold text-[#F68B1E] hover:underline flex items-center gap-1 uppercase tracking-wider bg-orange-50/80 hover:bg-[#F68B1E] hover:text-white px-3 py-1.5 border border-orange-100 hover:border-transparent rounded-lg transition-all"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50/50 rounded-xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-5 transition-all duration-200 flex gap-4 ${notification.isRead ? 'bg-white' : 'bg-orange-50/30 border-l-4 border-l-[#F68B1E]'}`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border ${notification.isRead ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-orange-50 text-[#F68B1E] border-orange-100'}`}>
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm md:text-base font-extrabold truncate tracking-tight ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 whitespace-nowrap bg-gray-50/80 px-2 py-0.5 rounded border border-gray-100/50">
                        {format(new Date(notification.createdAt), 'dd MMM, HH:mm')}
                      </span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed mb-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2 text-[10px] font-extrabold text-[#F68B1E] uppercase hover:underline flex items-center gap-1 bg-orange-50/50 hover:bg-orange-50 border border-orange-100/60 hover:border-orange-200 px-2.5 py-1 rounded w-fit transition-all duration-200"
                      >
                        <MailOpen size={11} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-4 select-none">
              <div className="w-16 h-16 bg-orange-50 text-[#F68B1E] rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                <Bell size={28} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 leading-tight">Your inbox is empty</h3>
              <p className="text-gray-500 font-medium text-sm mt-2 max-w-xs mx-auto">We'll notify you when something important happens.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .rounded-xl { border-radius: 12px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .p-5 { padding: 1.25rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-6 { margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
