import { Request, Response, NextFunction } from 'express';
import * as devicesService from './devices.service';
import { SocketGateway } from '../../socket/socket.gateway';
import { ContentType } from '@signage/types';
import type {
  CreateDeviceInput,
  UpdateDeviceInput,
  AttachContentInput,
  PushContentInput,
} from './devices.schema';

type IdParam = { id: string };
type PlaylistParam = { id: string; contentId: string };

export async function listDevices(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const devices = await devicesService.getAllDevices();
    res.json({ success: true, data: devices });
  } catch (err) {
    next(err);
  }
}

export async function getDevice(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
  try {
    const device = await devicesService.getDeviceById(req.params.id);
    res.json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
}

export async function createDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const device = await devicesService.createDevice(req.body as CreateDeviceInput);
    res.status(201).json({ success: true, data: device, message: 'Device created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateDevice(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
  try {
    const device = await devicesService.updateDevice(req.params.id, req.body as UpdateDeviceInput);
    res.json({ success: true, data: device, message: 'Device updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteDevice(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
  try {
    await devicesService.deleteDevice(req.params.id);
    res.json({ success: true, data: null, message: 'Device deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function attachContent(
  req: Request<IdParam>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const playlist = await devicesService.attachContent(
      req.params.id,
      req.body as AttachContentInput
    );
    res.status(201).json({ success: true, data: playlist, message: 'Content attached to device' });
  } catch (err) {
    next(err);
  }
}

export async function pushContent(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = req.params.id;
    const { content_id } = req.body as PushContentInput;

    // Fetch the full playlist for this device to send along
    const device = await devicesService.getDeviceById(deviceId);
    const targetContent = device.playlists.find((p) => p.content_id === content_id);

    if (!targetContent) {
      res.status(404).json({ success: false, error: 'Content not found in device playlist' });
      return;
    }

    const playlist = device.playlists.map((item) => ({
      id: item.content.id,
      tipe: item.content.tipe as ContentType,
      payload: item.content.payload,
      judul: item.content.judul,
      durasi: item.durasi,
    }));

    const gateway = SocketGateway.getInstance();
    const emitted = gateway.pushContentToDevice(deviceId, {
      contentId: content_id,
      judul: targetContent.content.judul,
      tipe: targetContent.content.tipe as ContentType,
      payload: targetContent.content.payload,
      playlist,
    });

    if (!emitted) {
      res.status(503).json({
        success: false,
        error: 'Device is currently offline or not connected to WebSocket',
      });
      return;
    }

    console.log(`[Devices] Pushed content ${content_id} to device ${deviceId}`);
    res.json({ success: true, data: null, message: 'Content pushed to device successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylist(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
  try {
    const playlist = await devicesService.getDevicePlaylist(req.params.id);
    res.json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
}

export async function removeFromPlaylist(
  req: Request<PlaylistParam>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await devicesService.removeContentFromPlaylist(req.params.id, req.params.contentId);
    res.json({ success: true, data: null, message: 'Content removed from playlist' });
  } catch (err) {
    next(err);
  }
}
