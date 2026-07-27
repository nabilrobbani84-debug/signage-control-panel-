import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { LoginInput } from './auth.schema';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser(req.body as LoginInput);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
