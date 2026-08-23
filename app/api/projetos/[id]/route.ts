import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { codigo, nome, qtdeMadeira, status } = body;

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        codigo,
        nome,
        qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira.toString()) : 0,
        status,
      },
    });

    return NextResponse.json(projetoAtualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.projeto.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Excluído com sucesso' });
  } catch (error) {
    console.error('ERRO AO EXCLUIR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
