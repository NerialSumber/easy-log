import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const acesso = await exigirPermissao('projetos');
    if (!acesso.ok) return acesso.resposta;
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error('ERRO AO BUSCAR CLIENTES:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}
