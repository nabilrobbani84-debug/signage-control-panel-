import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { LoginInput, RegisterInput } from './auth.schema';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser(req.body as RegisterInput);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser(req.body as LoginInput);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
