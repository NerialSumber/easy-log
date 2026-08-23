import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo, nome, qtdeMadeira } = body;

    let usuarioPadrao = await prisma.usuario.findFirst();
    if (!usuarioPadrao) {
      usuarioPadrao = await prisma.usuario.create({
        data: {
          nome: 'Administrador',
          email: 'admin@easylog.com',
          senha: 'senha_falsa',
          role: 'ADMIN',
        },
      });
    }

    const novoProjeto = await prisma.projeto.create({
      data: {
        codigo,
        nome,
        qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira) : 0,
        status: 'ABERTO',
        usuarioId: usuarioPadrao.id,
      },
    });

    return NextResponse.json(novoProjeto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Erro ao salvar o projeto.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projetos = await prisma.projeto.findMany({
      orderBy: { criadoEm: 'desc' },
    });
    return NextResponse.json(projetos);
  } catch (error) {
    console.error('ERRO INTERNO NO GET PROJETOS:', error);
    return NextResponse.json({ error: 'Erro ao buscar projetos' }, { status: 500 });
  }
}
