import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { createError } from '../../middleware/errorHandler';
import { LoginInput } from './auth.schema';
import { LoginResponseDto } from '@signage/types';

export async function loginUser(input: LoginInput): Promise<LoginResponseDto> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    // Constant-time response to prevent email enumeration
    await bcrypt.compare(input.password, '$2b$12$placeholder.hash.for.timing.attack.prevention');
    throw createError('Invalid email or password', 401);
  }

  const passwordValid = await bcrypt.compare(input.password, user.password);
  if (!passwordValid) {
    throw createError('Invalid email or password', 401);
  }

  const jwtOptions = { expiresIn: env.JWT_EXPIRES_IN };
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    env.JWT_SECRET,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwtOptions as any
  );

  console.log(`[Auth] Successful login for: ${user.email}`);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
