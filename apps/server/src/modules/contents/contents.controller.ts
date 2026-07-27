import { Request, Response, NextFunction } from 'express';
import * as contentsService from './contents.service';
import type { CreateContentInput, UpdateContentInput } from './contents.schema';

type IdParam = { id: string };

export async function listContents(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contents = await contentsService.getAllContents();
    res.json({ success: true, data: contents });
  } catch (err) {
    next(err);
  }
}

export async function getContent(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
  try {
    const content = await contentsService.getContentById(req.params.id);
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

export async function createContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const content = await contentsService.createContent(req.body as CreateContentInput);
    res.status(201).json({ success: true, data: content, message: 'Content created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateContent(
  req: Request<IdParam>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const content = await contentsService.updateContent(
      req.params.id,
      req.body as UpdateContentInput
    );
    res.json({ success: true, data: content, message: 'Content updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteContent(
  req: Request<IdParam>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await contentsService.deleteContent(req.params.id);
    res.json({ success: true, data: null, message: 'Content deleted successfully' });
  } catch (err) {
    next(err);
  }
}
