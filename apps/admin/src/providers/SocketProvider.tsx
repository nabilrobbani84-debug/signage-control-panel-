'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, DeviceStatusChangePayload } from '@signage/types';
import { queryClient } from '@/lib/queryClient';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${WS_URL}/admin`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Admin Socket] Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Admin Socket] Disconnected from server');
    });

    // When a device status changes, invalidate the devices query so the table refreshes instantly
    socket.on(SOCKET_EVENTS.DEVICE_STATUS_CHANGE, (payload: DeviceStatusChangePayload) => {
      console.log(`[Admin Socket] Device status change: ${payload.deviceId} → ${payload.status}`);
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    });

    socket.on(SOCKET_EVENTS.DEVICE_CONNECTED, () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    });

    socket.on(SOCKET_EVENTS.DEVICE_DISCONNECTED, () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
