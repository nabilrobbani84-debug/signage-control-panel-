import { Router } from 'express';
import { login } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema } from './auth.schema';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate an admin user and receive a JWT token.
 */
router.post('/login', validate(loginSchema), login);

export { router as authRouter };
