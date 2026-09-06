import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE,
  criarTokenSessao,
  lerCamposAuth,
  opcoesCookie,
  paraUsuarioPublico,
  senhaConfere,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const campos = lerCamposAuth(await request.json());
    if (!campos || !campos.email.includes('@') || !campos.senha) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email: campos.email } });
    if (!usuario || !senhaConfere(campos.senha, usuario.senha)) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const resposta = NextResponse.json(paraUsuarioPublico(usuario));
    resposta.cookies.set(SESSION_COOKIE, criarTokenSessao(usuario.id), opcoesCookie());
    return resposta;
  } catch (error) {
    console.error('ERRO AO ENTRAR:', error);
    return NextResponse.json({ error: 'Erro ao entrar no sistema.' }, { status: 500 });
  }
}
