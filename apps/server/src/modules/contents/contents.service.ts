import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';
import type { CreateContentInput, UpdateContentInput } from './contents.schema';

export async function getAllContents() {
  return prisma.content.findMany({
    orderBy: { created_at: 'desc' },
  });
}

export async function getContentById(id: string) {
  const content = await prisma.content.findUnique({ where: { id } });

  if (!content) {
    throw createError(`Content with ID "${id}" not found`, 404);
  }

  return content;
}

export async function createContent(input: CreateContentInput) {
  return prisma.content.create({
    data: {
      judul: input.judul,
      tipe: input.tipe,
      payload: input.payload,
    },
  });
}

export async function updateContent(id: string, input: UpdateContentInput) {
  await getContentById(id);

  return prisma.content.update({
    where: { id },
    data: input,
  });
}

export async function deleteContent(id: string) {
  await getContentById(id);

  // Remove content from all device playlists first
  await prisma.playlist.deleteMany({ where: { content_id: id } });

  await prisma.content.delete({ where: { id } });
  console.log(`[Contents] Deleted content: ${id}`);
}
