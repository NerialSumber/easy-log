'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type UserData = {
  nome: string;
  role: string;
  iniciais: string;
};

const GUEST: UserData = {
  nome: 'Carregando...',
  role: 'Aguarde',
  iniciais: '--',
};

function subscribe() {
  return () => undefined;
}

function iniciaisDe(nome: string) {
  const partes = nome.trim().split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  if (partes[0].length >= 2) {
    return partes[0].substring(0, 2).toUpperCase();
  }
  return partes[0].toUpperCase();
}

function readUser(): UserData {
  const stored = localStorage.getItem('current_user');
  if (!stored) {
    return GUEST;
  }

  try {
    const parsed = JSON.parse(stored) as { nome?: string; role?: string };
    const nome = parsed.nome || 'Usuário';
    return {
      nome,
      role: parsed.role || 'Administrador',
      iniciais: iniciaisDe(nome),
    };
  } catch {
    return GUEST;
  }
}

export function useCurrentUser() {
  const user = useSyncExternalStore(subscribe, readUser, () => GUEST);

  useEffect(() => {
    if (!localStorage.getItem('current_user')) {
      window.location.href = '/login';
    }
  }, []);

  return user;
}
