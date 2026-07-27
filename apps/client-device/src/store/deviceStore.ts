import { create } from 'zustand';
import { ContentType } from '@signage/types';

export interface PlaylistItem {
  id: string;
  tipe: ContentType;
  payload: string;
  judul: string;
  durasi: number; // seconds
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface DeviceState {
  deviceId: string;
  connectionStatus: ConnectionStatus;
  playlist: PlaylistItem[];
  currentIndex: number;
  lastSyncAt: Date | null;

  // Actions
  setDeviceId: (id: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setPlaylist: (items: PlaylistItem[], startIndex?: number) => void;
  nextItem: () => void;
  setCurrentIndex: (index: number) => void;
  setLastSyncAt: (date: Date) => void;
}

/**
 * Generates or retrieves a persistent device ID from localStorage.
 * On first launch, a UUID-like ID is created and stored.
 */
function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem('signage_device_id');
  if (stored) return stored;

  // Generate a simple UUID v4-compatible ID
  const newId = 'dev-' + crypto.randomUUID();
  localStorage.setItem('signage_device_id', newId);
  return newId;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  deviceId: getOrCreateDeviceId(),
  connectionStatus: 'connecting',
  playlist: [],
  currentIndex: 0,
  lastSyncAt: null,

  setDeviceId: (id) => {
    localStorage.setItem('signage_device_id', id);
    set({ deviceId: id });
  },

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setPlaylist: (items, startIndex = 0) =>
    set({ playlist: items, currentIndex: startIndex, lastSyncAt: new Date() }),

  nextItem: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length === 0) return;
    set({ currentIndex: (currentIndex + 1) % playlist.length });
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setLastSyncAt: (date) => set({ lastSyncAt: date }),
}));
