import { DeviceStatus, ContentType } from './enums';

// ─────────────────────────────────────────────
// Socket Event Names (constants to avoid typos)
// ─────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Device → Server
  DEVICE_REGISTER: 'device:register',
  DEVICE_PING: 'device:ping',

  // Server → Device
  DEVICE_PONG: 'device:pong',
  CMD_UPDATE_CONTENT: 'cmd:update_content',
  CMD_CLEAR_DISPLAY: 'cmd:clear_display',
  CMD_REBOOT: 'cmd:reboot',

  // Server → Admin (broadcast)
  DEVICE_STATUS_CHANGE: 'device:status_change',
  DEVICE_CONNECTED: 'device:connected',
  DEVICE_DISCONNECTED: 'device:disconnected',

  // Admin → Server
  ADMIN_AUTHENTICATE: 'admin:authenticate',
  ADMIN_WATCH_DEVICES: 'admin:watch_devices',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

// ─────────────────────────────────────────────
// Event Payload Types
// ─────────────────────────────────────────────

/** Sent by client device on connection to identify itself */
export interface DeviceRegisterPayload {
  deviceId: string;
}

/** Sent by client device every 5 seconds */
export interface DevicePingPayload {
  deviceId: string;
  timestamp: number;
}

/** Server acknowledges the ping */
export interface DevicePongPayload {
  timestamp: number;
  serverTime: number;
}

/** Pushed to a device when admin triggers content update */
export interface CmdUpdateContentPayload {
  contentId: string;
  judul: string;
  tipe: ContentType;
  payload: string;
  playlist: Array<{
    id: string;
    tipe: ContentType;
    payload: string;
    judul: string;
    durasi: number;
  }>;
}

/** Broadcast to all admin listeners when a device status changes */
export interface DeviceStatusChangePayload {
  deviceId: string;
  status: DeviceStatus;
  last_seen: string;
}

/** Emitted to admin namespace to confirm device connected to WS */
export interface DeviceConnectedPayload {
  deviceId: string;
  socketId: string;
  connectedAt: string;
}
