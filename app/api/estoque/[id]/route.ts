import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

function lerEdicao(body: unknown) {
  const dados = (body ?? {}) as Record<string, unknown>;
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const unidade = typeof dados.unidade === 'string' ? dados.unidade.trim() : '';
  return nome && unidade ? { nome, unidade } : null;
}

function lerMovimento(body: unknown) {
  const dados = (body ?? {}) as Record<string, unknown>;
  const quantidade = Number(dados.quantidade);
  if (!Number.isFinite(quantidade) || quantidade <= 0) return null;
  if (dados.operacao === 'entrada') return quantidade;
  if (dados.operacao === 'saida') return -quantidade;
  return null;
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('estoque', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    const diferenca = lerMovimento(await request.json());
    if (diferenca === null) {
      return NextResponse.json(
        { error: 'Informe a quantidade a movimentar.' },
        { status: 400 },
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const atual = await tx.itemEstoque.findUnique({ where: { id } });
      if (!atual) return 'nao-encontrado' as const;
      const quantidade = Math.round((atual.quantidade + diferenca) * 100) / 100;
      if (quantidade < 0) return 'insuficiente' as const;
      return tx.itemEstoque.update({ where: { id }, data: { quantidade } });
    });

    if (resultado === 'nao-encontrado') {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    }
    if (resultado === 'insuficiente') {
      return NextResponse.json(
        { error: 'Quantidade insuficiente no estoque.' },
        { status: 400 },
      );
    }
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('ERRO AO MOVIMENTAR ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o estoque.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('estoque', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    const dados = lerEdicao(await request.json());
    if (!dados) {
      return NextResponse.json(
        { error: 'Preencha o nome e a unidade corretamente.' },
        { status: 400 },
      );
    }

    const atualizado = await prisma.itemEstoque.update({ where: { id }, data: dados });
    return NextResponse.json(atualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR ITEM DE ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o item.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('estoque', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    await prisma.itemEstoque.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('ERRO AO EXCLUIR ITEM DE ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao excluir o item.' }, { status: 500 });
  }
}
