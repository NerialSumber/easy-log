import { NextResponse } from 'next/server';
import { SESSION_COOKIE, opcoesCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(SESSION_COOKIE, '', { ...opcoesCookie(0), maxAge: 0 });
  return resposta;
}
