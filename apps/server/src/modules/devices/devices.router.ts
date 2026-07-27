import { Router } from 'express';
import * as devicesController from './devices.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createDeviceSchema,
  updateDeviceSchema,
  attachContentSchema,
  pushContentSchema,
} from './devices.schema';

const router = Router();

// All device routes require authentication
router.use(authenticate);

/**
 * GET /api/devices
 * List all registered devices with their playlist and status.
 */
router.get('/', devicesController.listDevices);

/**
 * GET /api/devices/:id
 * Get a single device by ID.
 */
router.get('/:id', devicesController.getDevice);

/**
 * POST /api/devices
 * Register a new device.
 */
router.post('/', validate(createDeviceSchema), devicesController.createDevice);

/**
 * PUT /api/devices/:id
 * Update device name or location.
 */
router.put('/:id', validate(updateDeviceSchema), devicesController.updateDevice);

/**
 * DELETE /api/devices/:id
 * Remove a device and its playlist entries.
 */
router.delete('/:id', devicesController.deleteDevice);

/**
 * GET /api/devices/:id/playlist
 * Get the ordered content playlist for a device.
 */
router.get('/:id/playlist', devicesController.getPlaylist);

/**
 * POST /api/devices/:id/attach-content
 * Add a content item to a device's playlist.
 */
router.post('/:id/attach-content', validate(attachContentSchema), devicesController.attachContent);

/**
 * DELETE /api/devices/:id/playlist/:contentId
 * Remove a specific content from a device's playlist.
 */
router.delete('/:id/playlist/:contentId', devicesController.removeFromPlaylist);

/**
 * POST /api/devices/:id/push
 * Immediately push content to an online device via WebSocket.
 */
router.post('/:id/push', validate(pushContentSchema), devicesController.pushContent);

export { router as devicesRouter };
