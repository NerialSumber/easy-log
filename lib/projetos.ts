import { prisma } from '@/lib/prisma';

export const projetoInclude = {
  cliente: {
    select: {
      id: true,
      nome: true,
    },
  },
} as const;

export async function ensureUsuarioPadrao() {
  const existente = await prisma.usuario.findFirst();
  if (existente) {
    return existente;
  }

  return prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@easylog.com',
      senha: 'senha_falsa',
      role: 'ADMIN',
    },
  });
}

export async function resolveClienteId(
  clienteId?: unknown,
  clienteNome?: unknown,
): Promise<string | null> {
  if (typeof clienteId === 'string' && clienteId.trim() && clienteId !== '__new__') {
    const encontrado = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (encontrado) {
      return encontrado.id;
    }
  }

  const nome = typeof clienteNome === 'string' ? clienteNome.trim() : '';
  if (!nome) {
    return null;
  }

  const existente = await prisma.cliente.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existente) {
    return existente.id;
  }

  const criado = await prisma.cliente.create({
    data: { nome },
  });
  return criado.id;
}

export function prismaErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  ) {
    return 'Já existe um projeto com este código.';
  }

  return fallback;
}
