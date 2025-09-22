'use server';

import { PrismaClient } from '@prisma/client';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_session';
const SESSION_EXPIRY_DAYS = 7;

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: {
      userId,
      expires: expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return session.id;
}

export async function getSession(): Promise<{ user: { id: string; username: string; role: string | null; }; } | null> {
  const sessionId = await getSessionIdFromCookie(); // Tambahkan await di sini

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }, // Ini akan meng-include user data
  });

  if (!session || session.expires < new Date()) {
    // Session expired or not found, clear cookie
    await clearSessionCookie(); // Tambahkan await di sini
    return null;
  }

  return { user: session.user };
}

export async function deleteSession(userId: string) {
  // Find the session associated with the user
  const session = await prisma.session.findFirst({
    where: { userId: userId },
  });

  if (session) {
    await prisma.session.delete({
      where: { id: session.id },
    });
  }
  await clearSessionCookie(); // Tambahkan await di sini
}

async function getSessionIdFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session.user;
}
