'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation'
import { createSession, deleteSession, getSession } from '@/src/lib/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(24, 'Username must be at most 24 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});

export interface ActionState {
  errors?: {
    username?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  }
}


export async function registerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const { hash } = await import('argon2');
    const passwordHash = await hash(parsed.data.password);
    await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        role: 'USER', // Default role
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { username: ['Username already taken'] } };
    }
    console.error('Registration error:', error);
    return { errors: { _form: ['An unexpected error occurred'] } };
  }

  redirect('/login?registered=1');
}

export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { username, password } = parsed.data;

  const { verify } = await import('argon2');
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !user.passwordHash || !(await verify(user.passwordHash, password))) {
    return { errors: { _form: ['Invalid username or password'] } };
  }

  await createSession(user.id);

  redirect('/app/dashboard');
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await deleteSession(session.user.id);
  }
  redirect('/');
}
