import { Router } from 'express';
import * as contentsController from './contents.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createContentSchema, updateContentSchema } from './contents.schema';

const router = Router();

router.use(authenticate);

/**
 * GET /api/contents
 * List all content items in the library.
 */
router.get('/', contentsController.listContents);

/**
 * GET /api/contents/:id
 * Get a single content item by ID.
 */
router.get('/:id', contentsController.getContent);

/**
 * POST /api/contents
 * Create a new content item.
 */
router.post('/', validate(createContentSchema), contentsController.createContent);

/**
 * PUT /api/contents/:id
 * Update an existing content item.
 */
router.put('/:id', validate(updateContentSchema), contentsController.updateContent);

/**
 * DELETE /api/contents/:id
 * Remove a content item (guarded against in-use items).
 */
router.delete('/:id', contentsController.deleteContent);

export { router as contentsRouter };
