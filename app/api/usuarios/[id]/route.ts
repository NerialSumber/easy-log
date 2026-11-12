import { NextResponse } from 'next/server';
import {
  dadosUsuarioValidos,
  exigirPermissao,
  hashSenha,
  lerCamposAuth,
  paraUsuarioPublico,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

async function ehUltimoAdmin(id: string) {
  const admins = await prisma.usuario.count({ where: { role: 'ADMIN' } });
  const alvo = await prisma.usuario.findUnique({ where: { id }, select: { role: true } });
  return admins <= 1 && alvo?.role === 'ADMIN';
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('usuarios', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    const campos = lerCamposAuth(await request.json());
    if (
      !dadosUsuarioValidos(campos.nome, campos.email) ||
      (campos.senha && campos.senha.length < 6)
    ) {
      return NextResponse.json(
        {
          error:
            'Informe nome, e-mail válido e função. A nova senha, se houver, precisa ter 6 caracteres.',
        },
        { status: 400 },
      );
    }

    const alvo = await prisma.usuario.findUnique({ where: { id } });
    if (!alvo) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    if (id === acesso.usuario.id && campos.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Você não pode alterar a própria função.' },
        { status: 400 },
      );
    }

    if (alvo.role === 'ADMIN' && campos.role !== 'ADMIN' && (await ehUltimoAdmin(id))) {
      return NextResponse.json(
        { error: 'Não é possível remover o último administrador.' },
        { status: 400 },
      );
    }

    const emailEmUso = await prisma.usuario.findFirst({
      where: { email: campos.email, NOT: { id } },
    });
    if (emailEmUso) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 },
      );
    }

    const atualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nome: campos.nome,
        email: campos.email,
        role: campos.role,
        ...(campos.senha ? { senha: hashSenha(campos.senha) } : {}),
      },
    });
    return NextResponse.json(paraUsuarioPublico(atualizado));
  } catch (error) {
    console.error('ERRO AO ATUALIZAR USUARIO:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o usuário.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const acesso = await exigirPermissao('usuarios', 'escrever');
    if (!acesso.ok) return acesso.resposta;
    const { id } = await params;

    if (id === acesso.usuario.id) {
      return NextResponse.json(
        { error: 'Você não pode excluir a própria conta.' },
        { status: 400 },
      );
    }

    if (await ehUltimoAdmin(id)) {
      return NextResponse.json(
        { error: 'Não é possível excluir o último administrador.' },
        { status: 400 },
      );
    }

    await prisma.usuario.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string } | null)?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Este usuário possui projetos e não pode ser excluído.' },
        { status: 400 },
      );
    }
    console.error('ERRO AO EXCLUIR USUARIO:', error);
    return NextResponse.json({ error: 'Erro ao excluir o usuário.' }, { status: 500 });
  }
}
