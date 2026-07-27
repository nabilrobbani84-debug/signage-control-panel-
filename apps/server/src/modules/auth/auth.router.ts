import { Router } from 'express';
import { login, register, logout } from './auth.controller';
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
/**
 * POST /api/auth/logout
 * Inform backend of logout (optional for stateless JWT, but good for client clearing).
 */
router.post('/logout', logout);

export { router as authRouter };
