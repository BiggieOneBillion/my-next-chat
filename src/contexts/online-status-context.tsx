"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { socket } from '@/lib/socket-client';

interface OnlineStatusContextType {
  onlineUsers: string[];
  isOnline: (userId: string) => boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      socket.emit('user:connect', session.user.id);

      socket.on('users:online', (users: string[]) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off('users:online');
      };
    }
  }, [session?.user?.id]);

  const isOnline = (userId: string) => onlineUsers.includes(userId);

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers, isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within OnlineStatusProvider');
  }
  return context;
};