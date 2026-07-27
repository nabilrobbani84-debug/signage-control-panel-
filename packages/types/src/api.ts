import { DeviceStatus, ContentType } from './enums';

// ─────────────────────────────────────────────
// Generic API Response Wrapper
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// Auth DTOs
// ─────────────────────────────────────────────

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// ─────────────────────────────────────────────
// Device DTOs
// ─────────────────────────────────────────────

export interface DeviceDto {
  id: string;
  nama: string;
  lokasi: string;
  status: DeviceStatus;
  last_seen: string | null;
  created_at: string;
}

export interface CreateDeviceDto {
  nama: string;
  lokasi: string;
}

export interface UpdateDeviceDto {
  nama?: string;
  lokasi?: string;
}

// ─────────────────────────────────────────────
// Content DTOs
// ─────────────────────────────────────────────

export interface ContentDto {
  id: string;
  judul: string;
  tipe: ContentType;
  payload: string;
  created_at: string;
}

export interface CreateContentDto {
  judul: string;
  tipe: ContentType;
  payload: string;
}

export interface UpdateContentDto {
  judul?: string;
  tipe?: ContentType;
  payload?: string;
}

// ─────────────────────────────────────────────
// Playlist DTOs
// ─────────────────────────────────────────────

export interface PlaylistItemDto {
  id: string;
  device_id: string;
  content_id: string;
  urutan: number;
  durasi: number; // in seconds
  content: ContentDto;
}

export interface AttachContentDto {
  content_id: string;
  urutan: number;
  durasi: number;
}

export interface PushContentDto {
  content_id: string;
}
