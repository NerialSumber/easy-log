import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { nome?: unknown; contato?: unknown };
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const contato = typeof body.contato === 'string' ? body.contato.trim() : '';
    if (!nome)
      return NextResponse.json(
        { error: 'O nome do fornecedor é obrigatório.' },
        { status: 400 },
      );
    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data: { nome, contato: contato || null },
    });
    return NextResponse.json(fornecedor);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR FORNECEDOR:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar o fornecedor.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await prisma.fornecedor.delete({ where: { id } });
    return NextResponse.json({ message: 'Excluído com sucesso.' });
  } catch (error) {
    console.error('ERRO AO EXCLUIR FORNECEDOR:', error);
    return NextResponse.json({ error: 'Erro ao excluir o fornecedor.' }, { status: 500 });
  }
}
