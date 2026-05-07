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
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container mx-auto px-4 max-w-3xl py-8">
        <div className="flex items-center gap-2 mb-8 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">
          <Link href="/account" className="hover:text-[#F68B1E] transition-colors">My Account</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-900">Notifications</span>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-gray-50/30">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <Bell size={20} className="text-[#F68B1E]" />
                </div>
                Notifications
              </h1>
              <p className="text-sm text-gray-400 font-medium mt-1">Stay updated with your latest activities</p>
            </div>
            
            {notifications && notifications.some(n => !n.isRead) && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-[10px] font-black text-[#F68B1E] hover:text-white hover:bg-[#F68B1E] px-4 py-2 border border-orange-100 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 active:scale-95"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-gray-50 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-50 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-8 transition-all duration-300 flex flex-col sm:flex-row gap-6 relative group ${notification.isRead ? 'bg-white hover:bg-gray-50/30' : 'bg-orange-50/20'}`}
                >
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F68B1E] rounded-r-full shadow-[2px_0_10px_rgba(246,139,30,0.3)]" />
                  )}
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-transform duration-300 group-hover:scale-110 ${notification.isRead ? 'bg-white text-gray-300 border-gray-100' : 'bg-white text-[#F68B1E] border-orange-100 shadow-sm'}`}>
                    <Bell size={22} fill={notification.isRead ? 'none' : 'currentColor'} fillOpacity={0.1} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className={`text-base font-black tracking-tight ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap px-2 py-1 bg-gray-50 rounded-lg">
                        {format(new Date(notification.createdAt), 'dd MMM, HH:mm')}
                      </span>
                    </div>
                    
                    <p className={`text-sm font-medium leading-relaxed ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-4 text-[10px] font-black text-[#F68B1E] uppercase hover:underline flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                      >
                        <MailOpen size={12} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center px-8">
              <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[32px] flex items-center justify-center mx-auto mb-6 rotate-12 transition-transform hover:rotate-0 duration-500">
                <Bell size={40} />
              </div>
              <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Your inbox is empty</h3>
              <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs mx-auto">We'll keep you posted with the latest updates and personalized offers.</p>
              <Link 
                href="/"
                className="mt-8 inline-block px-8 py-3 bg-[#333] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all hover:shadow-xl active:scale-95"
              >
                Back to Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  );
}
