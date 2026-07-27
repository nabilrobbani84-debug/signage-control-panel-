import { Server as SocketIOServer } from 'socket.io';
import { SOCKET_EVENTS } from '@signage/types';
import { prisma } from '../lib/prisma';

const HEARTBEAT_INTERVAL_MS = 10_000;  // Check every 10 seconds
const DEVICE_TIMEOUT_MS = 30_000;      // Mark offline if no ping in 30 seconds

interface PingRecord {
  lastPing: number;
  markedOffline: boolean;
}

/**
 * Monitors device liveness via ping timestamps.
 * Runs a periodic check; marks devices OFFLINE in DB and broadcasts
 * a status change to the admin namespace when they go silent.
 */
export class HeartbeatService {
  private pingRegistry = new Map<string, PingRecord>();
  private checkInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly io: SocketIOServer,
    private readonly deviceSocketMap: Map<string, string>
  ) {}

  recordPing(deviceId: string): void {
    const existing = this.pingRegistry.get(deviceId);

    this.pingRegistry.set(deviceId, {
      lastPing: Date.now(),
      markedOffline: existing?.markedOffline ?? false,
    });

    // If this device was previously marked offline and is now pinging again, recover it
    if (existing?.markedOffline) {
      this.recoverDevice(deviceId).catch((err) => {
        console.error(`[Heartbeat] Failed to recover device ${deviceId}:`, err);
      });
    }
  }

  start(): void {
    this.checkInterval = setInterval(() => {
      this.checkAllDevices();
    }, HEARTBEAT_INTERVAL_MS);

    console.log(
      `[Heartbeat] Started — checking every ${HEARTBEAT_INTERVAL_MS / 1000}s, timeout ${DEVICE_TIMEOUT_MS / 1000}s`
    );
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private checkAllDevices(): void {
    const now = Date.now();

    for (const [deviceId, record] of this.pingRegistry.entries()) {
      const elapsed = now - record.lastPing;
      const isStale = elapsed > DEVICE_TIMEOUT_MS;
      const isConnected = this.deviceSocketMap.has(deviceId);

      if (isStale && !record.markedOffline && !isConnected) {
        this.pingRegistry.set(deviceId, { ...record, markedOffline: true });
        this.markOffline(deviceId).catch((err) => {
          console.error(`[Heartbeat] Failed to mark device ${deviceId} offline:`, err);
        });
      }
    }
  }

  private async markOffline(deviceId: string): Promise<void> {
    console.warn(`[Heartbeat] Device ${deviceId} missed heartbeat — marking OFFLINE`);

    await prisma.device.updateMany({
      where: { id: deviceId },
      data: { status: 'OFFLINE', last_seen: new Date() },
    });

    this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_STATUS_CHANGE, {
      deviceId,
      status: 'OFFLINE',
      last_seen: new Date().toISOString(),
    });

    this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_DISCONNECTED, {
      deviceId,
      disconnectedAt: new Date().toISOString(),
    });
  }

  private async recoverDevice(deviceId: string): Promise<void> {
    console.log(`[Heartbeat] Device ${deviceId} recovered — marking ONLINE`);

    const record = this.pingRegistry.get(deviceId);
    if (record) {
      this.pingRegistry.set(deviceId, { ...record, markedOffline: false });
    }

    await prisma.device.updateMany({
      where: { id: deviceId },
      data: { status: 'ONLINE', last_seen: new Date() },
    });

    this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_STATUS_CHANGE, {
      deviceId,
      status: 'ONLINE',
      last_seen: new Date().toISOString(),
    });
  }

  /**
   * Register a device when it first connects so we track it from the start.
   */
  registerDevice(deviceId: string): void {
    this.pingRegistry.set(deviceId, {
      lastPing: Date.now(),
      markedOffline: false,
    });
  }

  /**
   * Clean up when device disconnects from WebSocket.
   */
  unregisterDevice(deviceId: string): void {
    this.pingRegistry.delete(deviceId);
  }
}
