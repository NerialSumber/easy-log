import { formatarNumero } from '@/lib/formatos';
import { prisma } from '@/lib/prisma';

export const projetoInclude = {
  cliente: { select: { id: true, nome: true } },
  madeira: { select: { id: true, nome: true } },
} as const;

export class ErroProjeto extends Error {
  status: number;

  constructor(mensagem: string, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

export async function validarMadeira(madeiraId: unknown, qtdeMadeira: number) {
  if (typeof madeiraId !== 'string' || !madeiraId) {
    if (qtdeMadeira > 0)
      throw new ErroProjeto('Selecione o tipo de madeira usado no projeto.');
    return null;
  }

  const madeira = await prisma.itemEstoque.findFirst({
    where: { id: madeiraId, categoria: 'MADEIRA' },
  });
  if (!madeira) throw new ErroProjeto('Tipo de madeira não encontrado no estoque.');
  return madeira.id;
}

export async function concluirProjeto(id: string) {
  return prisma.$transaction(async (tx) => {
    const projeto = await tx.projeto.findUnique({
      where: { id },
      include: { madeira: true },
    });
    if (!projeto) throw new ErroProjeto('Projeto não encontrado.', 404);
    if (projeto.status === 'CONCLUIDO')
      throw new ErroProjeto('Este projeto já foi concluído.');

    if (projeto.qtdeMadeira > 0) {
      const { madeira } = projeto;
      if (!madeira) {
        throw new ErroProjeto('Informe o tipo de madeira do projeto antes de concluir.');
      }

      const restante = Math.round((madeira.quantidade - projeto.qtdeMadeira) * 100) / 100;
      if (restante < 0) {
        throw new ErroProjeto(
          `Não há ${madeira.nome} suficiente no estoque: há ${formatarNumero(madeira.quantidade)} m² e o projeto usa ${formatarNumero(projeto.qtdeMadeira)} m².`,
        );
      }

      const baixa = await tx.itemEstoque.updateMany({
        where: { id: madeira.id, quantidade: madeira.quantidade },
        data: { quantidade: restante },
      });
      if (baixa.count === 0) {
        throw new ErroProjeto(
          'O estoque de madeira mudou agora. Tente concluir de novo.',
          409,
        );
      }
    }

    const marcado = await tx.projeto.updateMany({
      where: { id, NOT: { status: 'CONCLUIDO' } },
      data: { status: 'CONCLUIDO' },
    });
    if (marcado.count === 0) throw new ErroProjeto('Este projeto já foi concluído.');

    return tx.projeto.findUniqueOrThrow({ where: { id }, include: projetoInclude });
  });
}

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

export function lerQuantidadeMadeira(valor: unknown) {
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
