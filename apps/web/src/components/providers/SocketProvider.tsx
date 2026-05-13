'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { Bell, X, Activity, Zap, ShieldCheck } from 'lucide-react';
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
        console.log('[Telemetry] Socket stream initialized');
      });

      socketInstance.on('notification', (notification) => {
        const id = Math.random().toString(36).substring(7);
        const newNotif = { ...notification, id };
        setNotifications((prev) => [...prev, newNotif]);
        
        // Refresh notification counts
        utils.notification.getUnread.invalidate();
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
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
      
      {/* Real-time Notification Toasts - Executive Terminal Style */}
      <div className="fixed bottom-10 right-10 z-[9999] flex flex-col gap-6 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className="pointer-events-auto bg-on-surface text-white rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-white/5 p-8 w-[400px] animate-in slide-in-from-right-full duration-700 flex gap-6 overflow-hidden relative group"
          >
            {/* Background Activity Pulse */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-[40px] animate-pulse" />
            
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary-container shadow-[0_0_20px_rgba(246,139,30,0.5)]" />
            
            <div className="w-16 h-16 bg-white/5 rounded-[20px] flex items-center justify-center shrink-0 border-2 border-white/5 group-hover:bg-primary-container group-hover:text-white transition-all duration-500">
              <Bell size={28} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[9px] font-black text-primary-container uppercase tracking-[0.4em] italic">System Alert</span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate leading-none mb-2">{n.title}</h4>
              <p className="text-[11px] font-medium text-white/50 leading-relaxed line-clamp-2 italic">{n.message}</p>
              
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Activity size={10} className="text-primary-container animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Live Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={10} className="text-success" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Verified</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/20 hover:text-white transition-colors hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};
