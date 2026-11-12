import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const acesso = await exigirPermissao('projetos');
    if (!acesso.ok) return acesso.resposta;

    const madeiras = await prisma.itemEstoque.findMany({
      where: { categoria: 'MADEIRA' },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, quantidade: true },
    });
    return NextResponse.json(madeiras);
  } catch (error) {
    console.error('ERRO AO BUSCAR MADEIRAS:', error);
    return NextResponse.json({ error: 'Erro ao buscar as madeiras.' }, { status: 500 });
  }
}
