'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { requisitar } from '@/lib/api';
import { pode, rotuloRole, type Acao, type Area, type Role } from '@/lib/permissoes';
import type { Usuario } from '@/lib/types';

export type UserData = {
  id: string;
  nome: string;
  email: string;
  role: Role | '';
  roleLabel: string;
  iniciais: string;
};

const CHAVE = 'current_user';
const EVENTO = 'easylog-user';

const VISITANTE: UserData = {
  id: '',
  nome: 'Carregando...',
  email: '',
  role: '',
  roleLabel: 'Aguarde',
  iniciais: '--',
};

let ultimoTexto: string | null = null;
let ultimoUsuario = VISITANTE;

function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return partes[0].slice(0, 2).toUpperCase();
}

function lerUsuario() {
  const texto = localStorage.getItem(CHAVE);
  if (texto === ultimoTexto) return ultimoUsuario;

  ultimoTexto = texto;
  ultimoUsuario = VISITANTE;
  if (!texto) return ultimoUsuario;

  try {
    const sessao = JSON.parse(texto) as Partial<Usuario>;
    const role =
      sessao.role === 'ADMIN' || sessao.role === 'PROJETISTA' ? sessao.role : '';
    const nome = sessao.nome || 'Usuário';
    ultimoUsuario = {
      id: sessao.id || '',
      nome,
      email: sessao.email || '',
      role,
      roleLabel: role ? rotuloRole(role) : 'Usuário',
      iniciais: iniciaisDe(nome),
    };
  } catch {
    ultimoUsuario = VISITANTE;
  }
  return ultimoUsuario;
}

function observar(aoMudar: () => void) {
  window.addEventListener('storage', aoMudar);
  window.addEventListener(EVENTO, aoMudar);
  return () => {
    window.removeEventListener('storage', aoMudar);
    window.removeEventListener(EVENTO, aoMudar);
  };
}

export function salvarSessao(usuario: Usuario) {
  localStorage.setItem(CHAVE, JSON.stringify(usuario));
  window.dispatchEvent(new Event(EVENTO));
}

export async function sair() {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
  localStorage.removeItem(CHAVE);
  window.location.href = '/login';
}

export function useCurrentUser() {
  const usuario = useSyncExternalStore(observar, lerUsuario, () => VISITANTE);

  useEffect(() => {
    requisitar<Usuario>('/api/auth/me')
      .then(salvarSessao)
      .catch(() => {
        localStorage.removeItem(CHAVE);
        window.location.href = '/login';
      });
  }, []);

  return usuario;
}

export function useExigirPermissao(area: Area, acao: Acao = 'ver') {
  const user = useCurrentUser();
  const pronto = user.role !== '';
  const permitido = pode(user.role, area, acao);

  useEffect(() => {
    if (pronto && !permitido) {
      window.location.replace('/');
    }
  }, [pronto, permitido]);

  return { user, permitido, pronto };
}
