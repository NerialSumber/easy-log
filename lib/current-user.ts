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

let cachedRaw: string | null | undefined;
let cachedUser: UserData = GUEST;

function subscribe(onStoreChange: () => void) {
  const onChange = () => {
    cachedRaw = undefined;
    onStoreChange();
  };

  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
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
  if (stored === cachedRaw) {
    return cachedUser;
  }

  cachedRaw = stored;
  if (!stored) {
    cachedUser = GUEST;
    return cachedUser;
  }

  try {
    const parsed = JSON.parse(stored) as { nome?: string; role?: string };
    const nome = parsed.nome || 'Usuário';
    cachedUser = {
      nome,
      role: parsed.role || 'Administrador',
      iniciais: iniciaisDe(nome),
    };
  } catch {
    cachedUser = GUEST;
  }

  return cachedUser;
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
