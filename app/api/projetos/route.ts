import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  ensureUsuarioPadrao,
  parsePeriodoProjeto,
  prismaErrorMessage,
  projetoInclude,
  resolveClienteId,
} from '@/lib/projetos';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projetos = await prisma.projeto.findMany({
      include: projetoInclude,
      orderBy: { criadoEm: 'desc' },
    });
    return NextResponse.json(projetos);
  } catch (error) {
    console.error('ERRO INTERNO NO GET PROJETOS:', error);
    return NextResponse.json({ error: 'Erro ao buscar projetos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo, nome, qtdeMadeira, clienteId, clienteNome, dataInicio, dataFim } =
      body;

    if (!codigo?.trim() || !nome?.trim()) {
      return NextResponse.json(
        { error: 'Código e nome do projeto são obrigatórios.' },
        { status: 400 },
      );
    }

    const periodo = parsePeriodoProjeto(dataInicio, dataFim);
    if (!periodo.ok) {
      return NextResponse.json({ error: periodo.error }, { status: 400 });
    }

    const resolvedClienteId = await resolveClienteId(clienteId, clienteNome);
    if (!resolvedClienteId) {
      return NextResponse.json(
        { error: 'Selecione um cliente ou informe o nome de um novo cliente.' },
        { status: 400 },
      );
    }

    const usuarioPadrao = await ensureUsuarioPadrao();

    const novoProjeto = await prisma.projeto.create({
      data: {
        codigo: codigo.trim(),
        nome: nome.trim(),
        qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira) : 0,
        status: 'ABERTO',
        usuarioId: usuarioPadrao.id,
        clienteId: resolvedClienteId,
        dataInicio: periodo.dataInicio,
        dataFim: periodo.dataFim,
      },
      include: projetoInclude,
    });

    return NextResponse.json(novoProjeto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: prismaErrorMessage(error, 'Erro ao salvar o projeto.') },
      { status: 500 },
    );
  }
}
