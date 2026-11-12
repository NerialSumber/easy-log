import { NextResponse } from 'next/server';
import {
  dadosUsuarioValidos,
  hashSenha,
  paraUsuarioPublico,
  senhaConfere,
  usuarioDaSessao,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const usuario = await usuarioDaSessao();
    if (!usuario) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    return NextResponse.json(paraUsuarioPublico(usuario));
  } catch (error) {
    console.error('ERRO AO BUSCAR SESSAO:', error);
    return NextResponse.json({ error: 'Erro ao verificar a sessão.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const usuario = await usuarioDaSessao();
    if (!usuario) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const corpo = ((await request.json()) ?? {}) as Record<string, unknown>;
    const nome = typeof corpo.nome === 'string' ? corpo.nome.trim() : usuario.nome;
    const email =
      typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : usuario.email;
    const senhaAtual = typeof corpo.senhaAtual === 'string' ? corpo.senhaAtual : '';
    const novaSenha = typeof corpo.novaSenha === 'string' ? corpo.novaSenha : '';

    if (!dadosUsuarioValidos(nome, email)) {
      return NextResponse.json(
        { error: 'Informe um nome e um e-mail válido.' },
        { status: 400 },
      );
    }

    if (novaSenha) {
      if (!senhaConfere(senhaAtual, usuario.senha)) {
        return NextResponse.json(
          { error: 'A senha atual está incorreta.' },
          { status: 400 },
        );
      }
      if (novaSenha.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
          { status: 400 },
        );
      }
    }

    if (email !== usuario.email) {
      const emailEmUso = await prisma.usuario.findUnique({ where: { email } });
      if (emailEmUso) {
        return NextResponse.json(
          { error: 'Já existe uma conta com este e-mail.' },
          { status: 409 },
        );
      }
    }

    const atualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        nome,
        email,
        ...(novaSenha ? { senha: hashSenha(novaSenha) } : {}),
      },
    });
    return NextResponse.json(paraUsuarioPublico(atualizado));
  } catch (error) {
    console.error('ERRO AO ATUALIZAR CONTA:', error);
    return NextResponse.json({ error: 'Erro ao atualizar seus dados.' }, { status: 500 });
  }
}
