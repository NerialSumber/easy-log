import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lerMadeira, lerPeriodo, projetoInclude, resolverCliente } from '@/lib/projetos';
import { statusPorPeriodo } from '@/lib/status-projeto';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;
    const { nome, qtdeMadeira, clienteId, clienteNome, dataInicio, dataFim } =
      await request.json();

    if (typeof nome !== 'string' || !nome.trim()) {
      return NextResponse.json(
        { error: 'O nome do projeto é obrigatório.' },
        { status: 400 },
      );
    }

    const periodo = lerPeriodo(dataInicio, dataFim);
    if (!periodo.ok) {
      return NextResponse.json({ error: periodo.error }, { status: 400 });
    }

    const atual = await prisma.projeto.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!atual) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    const cliente = await resolverCliente(clienteId, clienteNome);

    const projeto = await prisma.projeto.update({
      where: { id },
      data: {
        nome: nome.trim(),
        qtdeMadeira: lerMadeira(qtdeMadeira),
        status:
          atual.status === 'CONCLUIDO'
            ? 'CONCLUIDO'
            : statusPorPeriodo(periodo.dataInicio, periodo.dataFim),
        dataInicio: periodo.dataInicio,
        dataFim: periodo.dataFim,
        ...(cliente ? { clienteId: cliente } : {}),
      },
      include: projetoInclude,
    });

    return NextResponse.json(projeto);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o projeto.' }, { status: 500 });
  }
}

export async function PATCH(_request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    const projeto = await prisma.projeto.update({
      where: { id },
      data: { status: 'CONCLUIDO' },
      include: projetoInclude,
    });
    return NextResponse.json(projeto);
  } catch (error) {
    console.error('ERRO AO CONCLUIR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao concluir o projeto.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    await prisma.projeto.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('ERRO AO EXCLUIR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao excluir o projeto.' }, { status: 500 });
  }
}
