import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  parsePeriodoProjeto,
  prismaErrorMessage,
  projetoInclude,
  resolveClienteId,
} from '@/lib/projetos';
import { statusPorPeriodo, statusVisivel } from '@/lib/status-projeto';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const acesso = await exigirPermissao('projetos');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;
    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: projetoInclude,
    });

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      ...projeto,
      status: statusVisivel(projeto.status, projeto.dataInicio, projeto.dataFim),
    });
  } catch (error) {
    console.error('ERRO AO BUSCAR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao buscar o projeto.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;
    const body = await request.json();
    const { nome, qtdeMadeira, clienteId, clienteNome, dataInicio, dataFim } = body;

    const periodo = parsePeriodoProjeto(dataInicio, dataFim);
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

    const resolvedClienteId = await resolveClienteId(clienteId, clienteNome);

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        nome,
        qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira.toString()) : 0,
        status:
          atual.status === 'CONCLUIDO'
            ? 'CONCLUIDO'
            : statusPorPeriodo(periodo.dataInicio, periodo.dataFim),
        dataInicio: periodo.dataInicio,
        dataFim: periodo.dataFim,
        ...(resolvedClienteId ? { clienteId: resolvedClienteId } : {}),
      },
      include: projetoInclude,
    });

    return NextResponse.json(projetoAtualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR PROJETO:', error);
    return NextResponse.json(
      { error: prismaErrorMessage(error, 'Erro ao atualizar') },
      { status: 500 },
    );
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
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
