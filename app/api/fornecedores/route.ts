import { NextResponse } from 'next/server';
import { exigirPermissao } from '@/lib/auth';
import { lerFornecedor } from '@/lib/fornecedores';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const acesso = await exigirPermissao('fornecedores');
    if (!acesso.ok) return acesso.resposta;

    const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
    return NextResponse.json(fornecedores);
  } catch (error) {
    console.error('ERRO AO BUSCAR FORNECEDORES:', error);
    return NextResponse.json({ error: 'Erro ao buscar fornecedores.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const acesso = await exigirPermissao('fornecedores', 'escrever');
    if (!acesso.ok) return acesso.resposta;

    const fornecedor = lerFornecedor(await request.json());
    if (!fornecedor.dados) {
      return NextResponse.json({ error: fornecedor.erro }, { status: 400 });
    }

    const criado = await prisma.fornecedor.create({ data: fornecedor.dados });
    return NextResponse.json(criado, { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR FORNECEDOR:', error);
    return NextResponse.json({ error: 'Erro ao salvar o fornecedor.' }, { status: 500 });
  }
}
