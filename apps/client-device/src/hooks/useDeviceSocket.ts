import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@signage/types';
import type { CmdUpdateContentPayload, DevicePongPayload } from '@signage/types';
import { useDeviceStore } from '../store/deviceStore';
import type { PlaylistItem } from '../store/deviceStore';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';
const PING_INTERVAL_MS = 5_000;

/**
 * Manages the Socket.io connection lifecycle for the device client.
 * Handles: registration, heartbeat ping/pong, content command reception,
 * and exponential backoff reconnection.
 */
export function useDeviceSocket() {
  const socketRef = useRef<Socket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { deviceId, setConnectionStatus, setPlaylist, setLastSyncAt } = useDeviceStore();

  useEffect(() => {
    const socket = io(`${SERVER_URL}/device`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30_000,
      randomizationFactor: 0.5,
    });

    socketRef.current = socket;

    // ── Connection events ────────────────────────────────
    socket.on('connect', () => {
      console.log(`[Device Socket] Connected: ${socket.id}`);
      setConnectionStatus('connected');

      // Register this device with the server
      socket.emit(SOCKET_EVENTS.DEVICE_REGISTER, { deviceId });

      // Start heartbeat pings
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        socket.emit(SOCKET_EVENTS.DEVICE_PING, {
          deviceId,
          timestamp: Date.now(),
        });
      }, PING_INTERVAL_MS);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Device Socket] Connection error:', err.message);
      setConnectionStatus('reconnecting');
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Device Socket] Disconnected:', reason);
      setConnectionStatus('disconnected');

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    });

    socket.on('reconnecting', () => {
      setConnectionStatus('reconnecting');
    });

    // ── Pong acknowledgement ─────────────────────────────
    socket.on(SOCKET_EVENTS.DEVICE_PONG, (_payload: DevicePongPayload) => {
      setLastSyncAt(new Date());
    });

    // ── Content command from server ──────────────────────
    socket.on(SOCKET_EVENTS.CMD_UPDATE_CONTENT, (payload: CmdUpdateContentPayload) => {
      console.log(`[Device Socket] Received content update:`, payload.judul);

      const items: PlaylistItem[] = payload.playlist.map((p) => ({
        id: p.id,
        tipe: p.tipe,
        payload: p.payload,
        judul: p.judul,
        durasi: p.durasi,
      }));

      // Find the index of the pushed content to start from it
      const startIndex = items.findIndex((item) => item.id === payload.contentId);
      setPlaylist(items, startIndex >= 0 ? startIndex : 0);
    });

    socket.on(SOCKET_EVENTS.CMD_CLEAR_DISPLAY, () => {
      console.log('[Device Socket] Received clear display command');
      setPlaylist([]);
    });

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      socket.disconnect();
    };
  }, [deviceId, setConnectionStatus, setPlaylist, setLastSyncAt]);

  return socketRef;
}
