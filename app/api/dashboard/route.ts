import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { montarDashboard } from '@/lib/dashboard';
import { pode } from '@/lib/permissoes';
import { prisma } from '@/lib/prisma';
import { projetoInclude } from '@/lib/projetos';
import { statusVisivel } from '@/lib/status-projeto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const acesso = await exigirPermissao('dashboard');
    if (!acesso.ok) return acesso.resposta;

    const projetos = await prisma.projeto.findMany({
      include: projetoInclude,
      orderBy: { criadoEm: 'desc' },
    });

    const estoque = pode(acesso.usuario.role, 'estoque')
      ? await prisma.itemEstoque.findMany({ orderBy: { nome: 'asc' } })
      : null;

    return NextResponse.json(
      montarDashboard(
        projetos.map((projeto) => ({
          id: projeto.id,
          codigo: projeto.codigo,
          nome: projeto.nome,
          qtdeMadeira: projeto.qtdeMadeira,
          status: statusVisivel(projeto.status, projeto.dataInicio, projeto.dataFim),
          criadoEm: projeto.criadoEm,
          dataInicio: projeto.dataInicio,
          dataFim: projeto.dataFim,
          clienteNome: projeto.cliente?.nome ?? null,
        })),
        estoque,
      ),
    );
  } catch (error) {
    console.error('ERRO AO MONTAR DASHBOARD:', error);
    return NextResponse.json({ error: 'Erro ao carregar o dashboard.' }, { status: 500 });
  }
}
