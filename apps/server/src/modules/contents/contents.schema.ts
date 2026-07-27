import { z } from 'zod';
import { ContentType } from '@signage/types';

export const createContentSchema = z.object({
  judul: z.string().min(1, 'Title is required').max(200),
  tipe: z.nativeEnum(ContentType, {
    errorMap: () => ({ message: 'tipe must be IMAGE, VIDEO, TEXT, or WEB' }),
  }),
  payload: z.string().min(1, 'Payload is required'),
});

export const updateContentSchema = z.object({
  judul: z.string().min(1).max(200).optional(),
  tipe: z.nativeEnum(ContentType).optional(),
  payload: z.string().min(1).optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
