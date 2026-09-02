import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CATEGORIAS = ['MADEIRA', 'QUIMICO', 'EPI'] as const;
type Categoria = (typeof CATEGORIAS)[number];

function lerItem(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const dados = body as Record<string, unknown>;
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const quantidade = Number(dados.quantidade);
  const unidade = typeof dados.unidade === 'string' ? dados.unidade.trim() : '';
  const categoria = typeof dados.categoria === 'string' ? dados.categoria : '';

  if (!nome || !Number.isFinite(quantidade) || quantidade < 0 || !unidade) return null;
  if (!CATEGORIAS.includes(categoria as Categoria)) return null;
  return { nome, quantidade, unidade, categoria: categoria as Categoria };
}

export async function GET() {
  try {
    const itens = await prisma.itemEstoque.findMany({ orderBy: [{ categoria: 'asc' }, { nome: 'asc' }] });
    return NextResponse.json(itens);
  } catch (error) {
    console.error('ERRO AO BUSCAR ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao buscar o estoque.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const item = lerItem(await request.json());
    if (!item) return NextResponse.json({ error: 'Preencha os dados do item corretamente.' }, { status: 400 });
    const criado = await prisma.itemEstoque.create({ data: item });
    return NextResponse.json(criado, { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR ITEM DE ESTOQUE:', error);
    return NextResponse.json({ error: 'Erro ao salvar o item.' }, { status: 500 });
  }
}
