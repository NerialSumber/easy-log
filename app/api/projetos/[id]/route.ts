import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  parsePeriodoProjeto,
  parseStatusProjeto,
  prismaErrorMessage,
  projetoInclude,
  resolveClienteId,
} from '@/lib/projetos';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: projetoInclude,
    });

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(projeto);
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
    const { id } = await params;
    const body = await request.json();
    const {
      codigo,
      nome,
      qtdeMadeira,
      status,
      clienteId,
      clienteNome,
      dataInicio,
      dataFim,
    } = body;

    const periodo = parsePeriodoProjeto(dataInicio, dataFim);
    if (!periodo.ok) {
      return NextResponse.json({ error: periodo.error }, { status: 400 });
    }

    const statusValido = parseStatusProjeto(status);
    if (!statusValido) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }

    const resolvedClienteId = await resolveClienteId(clienteId, clienteNome);

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        codigo,
        nome,
        qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira.toString()) : 0,
        status: statusValido,
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
