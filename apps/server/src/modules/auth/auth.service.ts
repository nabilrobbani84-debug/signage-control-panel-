import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { createError } from '../../middleware/errorHandler';
import { LoginInput, RegisterInput } from './auth.schema';
import { LoginResponseDto } from '@signage/types';

export async function registerUser(input: RegisterInput): Promise<LoginResponseDto> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw createError('Email is already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
  });

  const jwtOptions = { expiresIn: env.JWT_EXPIRES_IN };
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    env.JWT_SECRET,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwtOptions as any
  );

  console.log(`[Auth] Registered new user: ${user.email}`);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

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
