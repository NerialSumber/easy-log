import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function dadosValidos(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const dados = body as Record<string, unknown>;
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const quantidade = Number(dados.quantidade);
  const unidade = typeof dados.unidade === 'string' ? dados.unidade.trim() : '';
  const categoria = typeof dados.categoria === 'string' ? dados.categoria : '';
  if (!nome || !Number.isFinite(quantidade) || quantidade < 0 || !unidade) return null;
  if (!['MADEIRA', 'QUIMICO', 'EPI'].includes(categoria)) return null;
  return { nome, quantidade, unidade, categoria: categoria as 'MADEIRA' | 'QUIMICO' | 'EPI' };
}

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const data = dadosValidos(await request.json());
    if (!data) return NextResponse.json({ error: 'Preencha os dados do item corretamente.' }, { status: 400 });
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
