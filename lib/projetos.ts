import { prisma } from '@/lib/prisma';

export const projetoInclude = {
  cliente: { select: { id: true, nome: true } },
} as const;

export async function resolverCliente(clienteId: unknown, clienteNome: unknown) {
  if (typeof clienteId === 'string' && clienteId.trim() && clienteId !== '__new__') {
    const encontrado = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (encontrado) return encontrado.id;
  }

  const nome = typeof clienteNome === 'string' ? clienteNome.trim() : '';
  if (!nome) return null;

  const existente = await prisma.cliente.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existente) return existente.id;

  const criado = await prisma.cliente.create({ data: { nome } });
  return criado.id;
}

function lerData(valor: unknown) {
  if (typeof valor !== 'string' || !valor.trim()) return null;
  const texto = valor.trim();
  const data = texto.length === 10 ? new Date(`${texto}T00:00:00`) : new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function lerPeriodo(dataInicio: unknown, dataFim: unknown) {
  const inicio = lerData(dataInicio);
  const fim = lerData(dataFim);

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

export function lerMadeira(valor: unknown) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

export function codigoDuplicado(error: unknown) {
  return (error as { code?: string } | null)?.code === 'P2002';
}

export async function gerarCodigoProjeto() {
  const projetos = await prisma.projeto.findMany({ select: { codigo: true } });
  let maior = 0;

  for (const projeto of projetos) {
    const encontrado = /^PRJ-(\d+)$/i.exec(projeto.codigo.trim());
    if (encontrado) maior = Math.max(maior, Number(encontrado[1]));
  }

  return `PRJ-${String(maior + 1).padStart(3, '0')}`;
}
