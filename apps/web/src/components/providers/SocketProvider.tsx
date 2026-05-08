'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { Bell, X } from 'lucide-react';
import { api } from '@/trpc/react';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const utils = api.useUtils();

  useEffect(() => {
    if (session?.user) {
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
      });

      socketInstance.on('notification', (notification) => {
        setNotifications((prev) => [...prev, notification]);
        // Refresh notification counts
        utils.notification.getUnread.invalidate();
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 5000);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session, utils]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
      
      {/* Real-time Notification Toasts */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[320px] animate-in slide-in-from-right-full duration-500 flex gap-4 overflow-hidden relative group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F68B1E]" />
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Bell size={18} className="text-[#F68B1E]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">{n.title}</h4>
              <p className="text-[10px] font-medium text-gray-500 mt-1 line-clamp-2">{n.message}</p>
            </div>
            <button 
              onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
              className="text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};
