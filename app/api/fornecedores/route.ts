import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatarTelefone, validarContato } from '@/lib/contato';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
    return NextResponse.json(fornecedores);
  } catch (error) {
    console.error('ERRO AO BUSCAR FORNECEDORES:', error);
    return NextResponse.json({ error: 'Erro ao buscar fornecedores.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nome?: unknown;
      telefone?: unknown;
      email?: unknown;
      endereco?: unknown;
      produto?: unknown;
    };
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const telefone =
      typeof body.telefone === 'string' ? formatarTelefone(body.telefone) : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const endereco = typeof body.endereco === 'string' ? body.endereco.trim() : '';
    const produto = Array.isArray(body.produto)
      ? body.produto
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    if (!nome)
      return NextResponse.json(
        { error: 'O nome do fornecedor é obrigatório.' },
        { status: 400 },
      );
    const erroContato = validarContato(telefone, email);
    if (erroContato) return NextResponse.json({ error: erroContato }, { status: 400 });
    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome,
        telefone: telefone || null,
        email: email || null,
        endereco: endereco || null,
        produto,
      },
    });
    return NextResponse.json(fornecedor, { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR FORNECEDOR:', error);
    return NextResponse.json({ error: 'Erro ao salvar o fornecedor.' }, { status: 500 });
  }
}
