import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirPermissao } from '@/lib/auth';
import {
  codigoDuplicado,
  gerarCodigoProjeto,
  parsePeriodoProjeto,
  prismaErrorMessage,
  projetoInclude,
  resolveClienteId,
} from '@/lib/projetos';
import { statusPorPeriodo, statusVisivel } from '@/lib/status-projeto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const acesso = await exigirPermissao('projetos');
    if (!acesso.ok) return acesso.resposta;
    const projetos = await prisma.projeto.findMany({
      include: projetoInclude,
      orderBy: { criadoEm: 'desc' },
    });
    return NextResponse.json(
      projetos.map((projeto) => ({
        ...projeto,
        status: statusVisivel(projeto.status, projeto.dataInicio, projeto.dataFim),
      })),
    );
  } catch (error) {
    console.error('ERRO INTERNO NO GET PROJETOS:', error);
    return NextResponse.json({ error: 'Erro ao buscar projetos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, qtdeMadeira, clienteId, clienteNome, dataInicio, dataFim } = body;

    if (!nome?.trim()) {
      return NextResponse.json(
        { error: 'O nome do projeto é obrigatório.' },
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

    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;

    const dados = {
      nome: nome.trim(),
      qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira) : 0,
      status: statusPorPeriodo(periodo.dataInicio, periodo.dataFim),
      usuarioId: acesso.usuario.id,
      clienteId: resolvedClienteId,
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
    };

    let novoProjeto = null;
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      try {
        novoProjeto = await prisma.projeto.create({
          data: { ...dados, codigo: await gerarCodigoProjeto() },
          include: projetoInclude,
        });
        break;
      } catch (error) {
        if (codigoDuplicado(error) && tentativa < 4) continue;
        throw error;
      }
    }

    return NextResponse.json(novoProjeto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: prismaErrorMessage(error, 'Erro ao salvar o projeto.') },
      { status: 500 },
    );
  }
}
