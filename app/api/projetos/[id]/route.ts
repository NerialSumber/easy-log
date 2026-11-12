import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ErroProjeto,
  concluirProjeto,
  lerPeriodo,
  lerQuantidadeMadeira,
  projetoInclude,
  resolverCliente,
  validarMadeira,
} from '@/lib/projetos';
import { statusPorPeriodo } from '@/lib/status-projeto';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

function respostaDeErro(error: unknown, mensagem: string) {
  if (error instanceof ErroProjeto) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(mensagem, error);
  return NextResponse.json(
    { error: 'Não foi possível concluir a ação.' },
    { status: 500 },
  );
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;
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

    const atual = await prisma.projeto.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!atual) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    const concluido = atual.status === 'CONCLUIDO';
    const qtdeMadeira = lerQuantidadeMadeira(corpo.qtdeMadeira);
    const madeira = concluido
      ? {}
      : { qtdeMadeira, madeiraId: await validarMadeira(corpo.madeiraId, qtdeMadeira) };
    const cliente = await resolverCliente(clienteId, clienteNome);

    const projeto = await prisma.projeto.update({
      where: { id },
      data: {
        nome: nome.trim(),
        ...madeira,
        status: concluido
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
    return respostaDeErro(error, 'ERRO AO ATUALIZAR PROJETO:');
  }
}

export async function PATCH(_request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('projetos', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    return NextResponse.json(await concluirProjeto(id));
  } catch (error) {
    return respostaDeErro(error, 'ERRO AO CONCLUIR PROJETO:');
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
    return respostaDeErro(error, 'ERRO AO EXCLUIR PROJETO:');
  }
}
