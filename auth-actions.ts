'use server';

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function createUser(username: string, passwordPlain: string) {
  const passwordHash = await hashPassword(passwordPlain);
  return prisma.user.create({
    data: {
      username,
      passwordHash,
      role: 'USER', // Default role
    },
  });
}