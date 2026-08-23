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

const STATUS_PROJETO = ['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO'] as const;

function parseDataCampo(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  const data =
    trimmed.length === 10 ? new Date(`${trimmed}T00:00:00`) : new Date(trimmed);
  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

export function parsePeriodoProjeto(dataInicio: unknown, dataFim: unknown) {
  const inicio = parseDataCampo(dataInicio);
  const fim = parseDataCampo(dataFim);

  if (!inicio || !fim) {
    return { ok: false as const, error: 'Informe a data de início e a data de fim.' };
  }

  if (fim < inicio) {
    return {
      ok: false as const,
      error: 'A data de fim deve ser igual ou posterior à data de início.',
    };
  }

  return { ok: true as const, dataInicio: inicio, dataFim: fim };
}

export function parseStatusProjeto(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  return STATUS_PROJETO.includes(value as (typeof STATUS_PROJETO)[number])
    ? (value as (typeof STATUS_PROJETO)[number])
    : null;
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
