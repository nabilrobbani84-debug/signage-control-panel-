import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { SOCKET_EVENTS, CmdUpdateContentPayload } from '@signage/types';
import { HeartbeatService } from './heartbeat.service';
import { markDeviceOnline, markDeviceOffline } from '../modules/devices/devices.service';

/**
 * Singleton gateway that manages all Socket.io connections.
 * Separates /device and /admin namespaces for clean event routing.
 */
export class SocketGateway {
  private static instance: SocketGateway;
  private io!: SocketIOServer;
  private heartbeat!: HeartbeatService;

  // Map: deviceId → socket.id (for targeted emits)
  private deviceSocketMap = new Map<string, string>();

  private constructor() {}

  static getInstance(): SocketGateway {
    if (!SocketGateway.instance) {
      SocketGateway.instance = new SocketGateway();
    }
    return SocketGateway.instance;
  }

  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 20000,
      pingInterval: 10000,
    });

    this.heartbeat = new HeartbeatService(this.io, this.deviceSocketMap);
    this.heartbeat.start();

    this.registerDeviceNamespace();
    this.registerAdminNamespace();

    console.log('[Socket] Gateway initialized — namespaces: /device, /admin');
  }

  private registerDeviceNamespace(): void {
    const deviceNs = this.io.of('/device');

    deviceNs.on('connection', (socket: Socket) => {
      console.log(`[Socket/Device] New connection: ${socket.id}`);

      socket.on(SOCKET_EVENTS.DEVICE_REGISTER, async ({ deviceId }: { deviceId: string }) => {
        if (!deviceId) {
          socket.emit('error', { message: 'deviceId is required for registration' });
          return;
        }

        // Store the mapping and join a dedicated room
        this.deviceSocketMap.set(deviceId, socket.id);
        socket.join(`device:${deviceId}`);
        socket.data.deviceId = deviceId;

        console.log(`[Socket/Device] Registered device: ${deviceId} (socket: ${socket.id})`);

        try {
          await markDeviceOnline(deviceId);
          this.heartbeat.recordPing(deviceId);

          // Notify admin namespace about the connection
          this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_CONNECTED, {
            deviceId,
            socketId: socket.id,
            connectedAt: new Date().toISOString(),
          });

          this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_STATUS_CHANGE, {
            deviceId,
            status: 'ONLINE',
            last_seen: new Date().toISOString(),
          });
        } catch (err) {
          console.warn(`[Socket/Device] Could not update device status for ${deviceId}:`, err);
        }
      });

      socket.on(SOCKET_EVENTS.DEVICE_PING, ({ deviceId, timestamp }: { deviceId: string; timestamp: number }) => {
        if (deviceId) {
          this.heartbeat.recordPing(deviceId);

          socket.emit(SOCKET_EVENTS.DEVICE_PONG, {
            timestamp,
            serverTime: Date.now(),
          });
        }
      });

      socket.on('disconnect', async (reason: string) => {
        const deviceId = socket.data.deviceId as string | undefined;
        console.log(`[Socket/Device] Disconnected: ${socket.id} (${reason})`);

        if (deviceId) {
          this.deviceSocketMap.delete(deviceId);
          console.log(`[Socket/Device] Cleaned up mapping for device: ${deviceId}`);

          try {
            await markDeviceOffline(deviceId);

            this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_DISCONNECTED, {
              deviceId,
              disconnectedAt: new Date().toISOString(),
            });

            this.io.of('/admin').emit(SOCKET_EVENTS.DEVICE_STATUS_CHANGE, {
              deviceId,
              status: 'OFFLINE',
              last_seen: new Date().toISOString(),
            });
          } catch (err) {
            console.warn(`[Socket/Device] Could not mark device offline ${deviceId}:`, err);
          }
        }
      });
    });
  }

  private registerAdminNamespace(): void {
    const adminNs = this.io.of('/admin');

    adminNs.on('connection', (socket: Socket) => {
      console.log(`[Socket/Admin] Dashboard connected: ${socket.id}`);

      // Send the current device socket map snapshot on connection
      const connected = Array.from(this.deviceSocketMap.keys());
      socket.emit('admin:connected_devices', { devices: connected });

      socket.on('disconnect', () => {
        console.log(`[Socket/Admin] Dashboard disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit cmd:update_content to a specific device.
   * Returns true if the device was reachable, false if offline.
   */
  pushContentToDevice(deviceId: string, payload: CmdUpdateContentPayload): boolean {
    const socketId = this.deviceSocketMap.get(deviceId);

    if (!socketId) {
      console.warn(`[Socket] Device ${deviceId} is not connected — cannot push content`);
      return false;
    }

    this.io.of('/device').to(`device:${deviceId}`).emit(SOCKET_EVENTS.CMD_UPDATE_CONTENT, payload);
    console.log(`[Socket] Pushed content to device ${deviceId}`);
    return true;
  }

  getIO(): SocketIOServer {
    return this.io;
  }

  isDeviceConnected(deviceId: string): boolean {
    return this.deviceSocketMap.has(deviceId);
  }
}
