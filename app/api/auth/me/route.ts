import { NextResponse } from 'next/server';
import { paraUsuarioPublico, usuarioDaSessao } from '@/lib/auth';

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
