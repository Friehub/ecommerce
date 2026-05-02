'use client';

import React from 'react';
import { api } from '@/trpc/react';
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
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/account" className="text-gray-500 hover:text-[#F68B1E] transition-colors text-sm">My Account</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-sm font-bold">Notifications</span>
        </div>

        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell size={20} className="text-[#F68B1E]" />
              Notifications
            </h1>
            {notifications && notifications.some(n => !n.isRead) && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-xs font-bold text-[#F68B1E] hover:underline flex items-center gap-1 uppercase tracking-wider"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-colors flex gap-4 ${notification.isRead ? 'bg-white' : 'bg-orange-50/30 border-l-4 border-l-[#F68B1E]'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-[#F68B1E]'}`}>
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {format(new Date(notification.createdAt), 'dd MMM, HH:mm')}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2 text-[10px] font-bold text-[#F68B1E] uppercase hover:underline flex items-center gap-1"
                      >
                        <MailOpen size={10} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Your inbox is empty</h3>
              <p className="text-gray-500 text-sm mt-1">We'll notify you when something important happens.</p>
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
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-orange-50\/30 { background-color: rgba(255, 247, 237, 0.3); }
        .bg-orange-100 { background-color: #ffedd5; }
        .text-[#F68B1E] { color: #F68B1E; }
        .text-gray-900 { color: #111827; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-300 { color: #d1d5db; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-l-4 { border-left-width: 4px; }
        .border-l-[#F68B1E] { border-left-color: #F68B1E; }
        .divide-y > * + * { border-top: 1px solid #e5e7eb; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-[10px] { font-size: 10px; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
