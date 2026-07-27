import { Router } from 'express';
import { login, register } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schema';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user and receive a JWT token.
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Authenticate an admin user and receive a JWT token.
 */
router.post('/login', validate(loginSchema), login);

export { router as authRouter };
