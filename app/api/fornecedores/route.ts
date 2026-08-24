import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
    return NextResponse.json(fornecedores);
  } catch (error) {
    console.error('ERRO AO BUSCAR FORNECEDORES:', error);
    return NextResponse.json({ error: 'Erro ao buscar fornecedores.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { nome?: unknown; contato?: unknown };
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const contato = typeof body.contato === 'string' ? body.contato.trim() : '';
    if (!nome)
      return NextResponse.json(
        { error: 'O nome do fornecedor é obrigatório.' },
        { status: 400 },
      );
    const fornecedor = await prisma.fornecedor.create({
      data: { nome, contato: contato || null },
    });
    return NextResponse.json(fornecedor, { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR FORNECEDOR:', error);
    return NextResponse.json({ error: 'Erro ao salvar o fornecedor.' }, { status: 500 });
  }
}
