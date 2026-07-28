import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';
import { DeviceStatus } from '@signage/types';
import type {
  CreateDeviceInput,
  UpdateDeviceInput,
  AttachContentInput,
} from './devices.schema';

export async function getAllDevices() {
  return prisma.device.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      playlists: {
        include: { content: true },
        orderBy: { urutan: 'asc' },
      },
    },
  });
}

export async function getDeviceById(id: string) {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      playlists: {
        include: { content: true },
        orderBy: { urutan: 'asc' },
      },
    },
  });

  if (!device) {
    throw createError(`Device with ID "${id}" not found`, 404);
  }

  return device;
}

export async function createDevice(input: CreateDeviceInput) {
  return prisma.device.create({
    data: {
      nama: input.nama,
      lokasi: input.lokasi,
      status: DeviceStatus.OFFLINE,
    },
  });
}

export async function updateDevice(id: string, input: UpdateDeviceInput) {
  await getDeviceById(id); // throws 404 if not found

  const updateData: any = { ...input };
  if (input.status === DeviceStatus.ONLINE) {
    updateData.last_seen = new Date();
  }

  return prisma.device.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteDevice(id: string) {
  await getDeviceById(id); // throws 404 if not found

  await prisma.device.delete({ where: { id } });
  console.log(`[Devices] Deleted device: ${id}`);
}

export async function attachContent(deviceId: string, input: AttachContentInput) {
  // Verify device exists
  await getDeviceById(deviceId);

  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: input.content_id } });
  if (!content) {
    throw createError(`Content with ID "${input.content_id}" not found`, 404);
  }

  return prisma.playlist.upsert({
    where: {
      device_id_content_id: {
        device_id: deviceId,
        content_id: input.content_id,
      },
    },
    update: {
      urutan: input.urutan,
      durasi: input.durasi,
    },
    create: {
      device_id: deviceId,
      content_id: input.content_id,
      urutan: input.urutan,
      durasi: input.durasi,
    },
    include: { content: true },
  });
}

export async function getDevicePlaylist(deviceId: string) {
  return prisma.playlist.findMany({
    where: { device_id: deviceId },
    include: { content: true },
    orderBy: { urutan: 'asc' },
  });
}

export async function removeContentFromPlaylist(deviceId: string, contentId: string) {
  const item = await prisma.playlist.findUnique({
    where: { device_id_content_id: { device_id: deviceId, content_id: contentId } },
  });

  if (!item) {
    throw createError('Playlist item not found', 404);
  }

  await prisma.playlist.delete({
    where: { device_id_content_id: { device_id: deviceId, content_id: contentId } },
  });
}

export async function markDeviceOffline(deviceId: string) {
  return prisma.device.updateMany({
    where: { id: deviceId },
    data: { status: 'OFFLINE', last_seen: new Date() },
  });
}

export async function markDeviceOnline(deviceId: string) {
  return prisma.device.updateMany({
    where: { id: deviceId },
    data: { status: 'ONLINE', last_seen: new Date() },
  });
}
