'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../db'; // ← perbaiki path & nama export

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'app_session';
const SESSION_EXPIRY_DAYS = 7;

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const session = await db.session.create({
    data: { userId, expires: expiresAt },
  });

  const cookieStore = await cookies(); // ← Next 15: async
  cookieStore.set(AUTH_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return session.id;
}

export async function getSession(): Promise<{ user: { id: string; username: string; role: string | null } } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  // bersihkan sesi kadaluarsa (opsional)
  await db.session.deleteMany({ where: { id: sessionId, expires: { lt: new Date() } } });

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    await clearSessionCookie();
    return null;
  }

  return { user: { id: session.user.id, username: session.user.username, role: session.user.role ?? null } };
}

export async function deleteSession(userId: string) {
  await db.session.deleteMany({ where: { userId } });
  await clearSessionCookie();
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session.user;
}
