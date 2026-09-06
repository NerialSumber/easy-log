import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function dadosEdicao(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const dados = body as Record<string, unknown>;
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const unidade = typeof dados.unidade === 'string' ? dados.unidade.trim() : '';
  if (!nome || !unidade) return null;
  return { nome, unidade };
}

type Context = { params: Promise<{ id: string }> };

function lerMovimento(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const dados = body as Record<string, unknown>;
  const quantidade = Number(dados.quantidade);
  const operacao = dados.operacao;
  if (!Number.isFinite(quantidade) || quantidade <= 0) return null;
  if (operacao !== 'entrada' && operacao !== 'saida') return null;
  return { quantidade, operacao: operacao as 'entrada' | 'saida' };
}

function arredondarQuantidade(valor: number) {
  return Math.round(valor * 100) / 100;
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const movimento = lerMovimento(await request.json());
    if (!movimento) {
      return NextResponse.json({ error: 'Informe a quantidade a movimentar.' }, { status: 400 });
    }

    const delta = movimento.operacao === 'entrada' ? movimento.quantidade : -movimento.quantidade;
    const resultado = await prisma.$transaction(async (tx) => {
      const atual = await tx.itemEstoque.findUnique({ where: { id } });
      if (!atual) return { tipo: 'nao-encontrado' as const };
      const quantidade = arredondarQuantidade(atual.quantidade + delta);
      if (quantidade < 0) return { tipo: 'insuficiente' as const };
      const item = await tx.itemEstoque.update({ where: { id }, data: { quantidade } });
      return { tipo: 'ok' as const, item };
    });

    if (resultado.tipo === 'nao-encontrado') {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    }
    if (resultado.tipo === 'insuficiente') {
      return NextResponse.json({ error: 'Quantidade insuficiente no estoque.' }, { status: 400 });
    }
    return NextResponse.json(resultado.item);
  } catch (error) {
    console.error('ERRO AO MOVIMENTAR ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o estoque.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const data = dadosEdicao(await request.json());
    if (!data) return NextResponse.json({ error: 'Preencha o nome e a unidade corretamente.' }, { status: 400 });
    const atualizado = await prisma.itemEstoque.update({ where: { id }, data });
    return NextResponse.json(atualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR ITEM DE ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o item.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await prisma.itemEstoque.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('ERRO AO EXCLUIR ITEM DE ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao excluir o item.' }, { status: 500 });
  }
}
