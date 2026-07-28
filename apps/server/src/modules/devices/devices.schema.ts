import { z } from 'zod';

import { DeviceStatus } from '@signage/types';

export const createDeviceSchema = z.object({
  nama: z.string().min(1, 'Device name is required').max(100),
  lokasi: z.string().min(1, 'Location is required').max(200),
});

export const updateDeviceSchema = z.object({
  nama: z.string().min(1).max(100).optional(),
  lokasi: z.string().min(1).max(200).optional(),
  status: z.nativeEnum(DeviceStatus).optional(),
});

export const attachContentSchema = z.object({
  content_id: z.string().min(1, 'Content ID is required'),
  urutan: z.coerce.number().int().min(1).default(1),
  durasi: z.coerce.number().int().min(1).max(86400).default(30),
});

export const pushContentSchema = z.object({
  content_id: z.string().min(1, 'Content ID is required'),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type AttachContentInput = z.infer<typeof attachContentSchema>;
export type PushContentInput = z.infer<typeof pushContentSchema>;
