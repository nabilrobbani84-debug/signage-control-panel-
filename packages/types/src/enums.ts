/**
 * Shared enumerations used across server, admin, and client-device apps.
 * Single source of truth — never duplicate these in app-level code.
 */

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum ContentType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  WEB = 'WEB',
}
