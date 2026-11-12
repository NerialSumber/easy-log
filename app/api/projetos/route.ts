import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ErroProjeto,
  codigoDuplicado,
  gerarCodigoProjeto,
  lerPeriodo,
  lerQuantidadeMadeira,
  projetoInclude,
  resolverCliente,
  validarMadeira,
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
    console.error('ERRO AO BUSCAR PROJETOS:', error);
    return NextResponse.json({ error: 'Erro ao buscar projetos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;

    const corpo = await request.json();
    const { nome, clienteId, clienteNome, dataInicio, dataFim } = corpo;

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

    const cliente = await resolverCliente(clienteId, clienteNome);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Selecione um cliente ou informe o nome de um novo cliente.' },
        { status: 400 },
      );
    }

    const qtdeMadeira = lerQuantidadeMadeira(corpo.qtdeMadeira);
    const dados = {
      nome: nome.trim(),
      qtdeMadeira,
      madeiraId: await validarMadeira(corpo.madeiraId, qtdeMadeira),
      status: statusPorPeriodo(periodo.dataInicio, periodo.dataFim),
      usuarioId: acesso.usuario.id,
      clienteId: cliente,
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
    };

    for (let tentativa = 1; ; tentativa += 1) {
      try {
        const projeto = await prisma.projeto.create({
          data: { ...dados, codigo: await gerarCodigoProjeto() },
          include: projetoInclude,
        });
        return NextResponse.json(projeto, { status: 201 });
      } catch (error) {
        if (!codigoDuplicado(error) || tentativa >= 5) throw error;
      }
    }
  } catch (error) {
    if (error instanceof ErroProjeto) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('ERRO AO CRIAR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao salvar o projeto.' }, { status: 500 });
  }
}
