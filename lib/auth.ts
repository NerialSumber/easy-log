import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pode, rotuloRole, type Acao, type Area, type Role } from '@/lib/permissoes';

export const SESSION_COOKIE = 'easylog_session';
const SESSION_DAYS = 30;

export type UsuarioPublico = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  roleLabel: string;
};

type UsuarioBanco = {
  id: string;
  nome: string;
  email: string;
  role: Role;
};

export function paraUsuarioPublico(usuario: UsuarioBanco): UsuarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    roleLabel: rotuloRole(usuario.role),
  };
}

function segredoSessao() {
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || 'easylog-dev-secret';
}

export function hashSenha(senha: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function senhaConfere(senha: string, armazenada: string) {
  const [salt, hash] = armazenada.split(':');
  if (!salt || !hash) return false;
  try {
    const esperado = Buffer.from(hash, 'hex');
    const atual = scryptSync(senha, salt, 64);
    return esperado.length === atual.length && timingSafeEqual(esperado, atual);
  } catch {
    return false;
  }
}

function assinar(valor: string) {
  return createHmac('sha256', segredoSessao()).update(valor).digest('hex');
}

export function criarTokenSessao(userId: string) {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ id: userId, exp })).toString('base64url');
  return `${payload}.${assinar(payload)}`;
}

export function lerTokenSessao(token: string | undefined) {
  if (!token) return null;
  const [payload, assinatura] = token.split('.');
  if (!payload || !assinatura) return null;
  const esperada = assinar(payload);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { id?: string; exp?: number };
    if (!dados.id || !dados.exp || dados.exp < Date.now()) return null;
    return dados.id;
  } catch {
    return null;
  }
}

export function opcoesCookie(maxAge = SESSION_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

export async function usuarioDaSessao() {
  const store = await cookies();
  const userId = lerTokenSessao(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return prisma.usuario.findUnique({ where: { id: userId } });
}

export async function exigirPermissao(area: Area, acao: Acao = 'ver') {
  const usuario = await usuarioDaSessao();
  if (!usuario) {
    return {
      ok: false as const,
      resposta: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }),
    };
  }
  if (!pode(usuario.role, area, acao)) {
    return {
      ok: false as const,
      resposta: NextResponse.json({ error: 'Você não tem permissão para esta ação.' }, { status: 403 }),
    };
  }
  return { ok: true as const, usuario };
}

export function lerCamposAuth(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const dados = body as Record<string, unknown>;
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const email = typeof dados.email === 'string' ? dados.email.trim().toLowerCase() : '';
  const senha = typeof dados.password === 'string' ? dados.password : typeof dados.senha === 'string' ? dados.senha : '';
  const role = dados.role === 'ADMIN' ? 'ADMIN' as const : 'PROJETISTA' as const;
  return { nome, email, senha, role };
}
