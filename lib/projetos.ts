import { prisma } from '@/lib/prisma';

export const projetoInclude = {
  cliente: {
    select: {
      id: true,
      nome: true,
    },
  },
} as const;

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

export function codigoDuplicado(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

export async function gerarCodigoProjeto() {
  const projetos = await prisma.projeto.findMany({ select: { codigo: true } });
  let maior = 0;

  for (const projeto of projetos) {
    const encontrado = /^PRJ-(\d+)$/i.exec(projeto.codigo.trim());
    if (!encontrado) continue;
    const numero = Number(encontrado[1]);
    if (Number.isInteger(numero) && numero > maior) maior = numero;
  }

  return `PRJ-${String(maior + 1).padStart(3, '0')}`;
}

export function prismaErrorMessage(error: unknown, fallback: string) {
  if (codigoDuplicado(error)) {
    return 'Já existe um projeto com este código.';
  }

  return fallback;
}
