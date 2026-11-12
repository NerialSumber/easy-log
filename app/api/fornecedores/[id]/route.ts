import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { lerFornecedor } from '@/lib/fornecedores';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('fornecedores', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    const fornecedor = lerFornecedor(await request.json());
    if (!fornecedor.dados) {
      return NextResponse.json({ error: fornecedor.erro }, { status: 400 });
    }

    const atualizado = await prisma.fornecedor.update({
      where: { id },
      data: fornecedor.dados,
    });
    return NextResponse.json(atualizado);
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
    const acesso = await exigirPermissao('fornecedores', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    await prisma.fornecedor.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('ERRO AO EXCLUIR FORNECEDOR:', error);
    return NextResponse.json({ error: 'Erro ao excluir o fornecedor.' }, { status: 500 });
  }
}
