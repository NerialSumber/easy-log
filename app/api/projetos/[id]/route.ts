import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ajustado para aceitar params da forma mais segura
export async function PUT(request: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await request.json();
    const { codigo, nome, qtdeMadeira, status } = body;

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        codigo,
        nome,
        qtdeMadeira: qtdeMadeira ? parseFloat(qtdeMadeira.toString()) : 0,
        status,
      },
    });

    return NextResponse.json(projetoAtualizado);
  } catch (error) {
    // AGORA SIM ELE VAI GRITAR NO TERMINAL
    console.error('ERRO AO ATUALIZAR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await prisma.projeto.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Excluído com sucesso' });
  } catch (error) {
    // AGORA SIM ELE VAI GRITAR NO TERMINAL
    console.error('ERRO AO EXCLUIR PROJETO:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
