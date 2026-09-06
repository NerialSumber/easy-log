import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirPermissao, hashSenha, lerCamposAuth, paraUsuarioPublico } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const acesso = await exigirPermissao('usuarios');
    if (!acesso.ok) return acesso.resposta;
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, email: true, role: true },
    });
    return NextResponse.json(usuarios.map(paraUsuarioPublico));
  } catch (error) {
    console.error('ERRO AO BUSCAR USUARIOS:', error);
    return NextResponse.json({ error: 'Erro ao buscar os usuários.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const acesso = await exigirPermissao('usuarios', 'escrever');
    if (!acesso.ok) return acesso.resposta;

    const campos = lerCamposAuth(await request.json());
    if (!campos || campos.nome.length < 2 || !campos.email.includes('@') || campos.senha.length < 6) {
      return NextResponse.json(
        { error: 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.' },
        { status: 400 },
      );
    }

    const jaExiste = await prisma.usuario.findUnique({ where: { email: campos.email } });
    if (jaExiste) {
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail.' }, { status: 409 });
    }

    const criado = await prisma.usuario.create({
      data: {
        nome: campos.nome,
        email: campos.email,
        senha: hashSenha(campos.senha),
        role: campos.role,
      },
    });
    return NextResponse.json(paraUsuarioPublico(criado), { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR USUARIO:', error);
    return NextResponse.json({ error: 'Erro ao criar o usuário.' }, { status: 500 });
  }
}
