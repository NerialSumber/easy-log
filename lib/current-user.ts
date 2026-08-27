'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type UserData = {
  nome: string;
  email: string;
  role: string;
  iniciais: string;
};

type StoredUser = {
  nome?: string;
  email?: string;
  password?: string;
  role?: string;
};

const USER_CHANGED_EVENT = 'current-user-changed';

const GUEST: UserData = {
  nome: 'Carregando...',
  email: '',
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
  window.addEventListener(USER_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(USER_CHANGED_EVENT, onChange);
  };
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

function readStoredUser(): StoredUser | null {
  const stored = localStorage.getItem('current_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

function notifyUserChange() {
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
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
    const parsed = JSON.parse(stored) as StoredUser;
    const nome = parsed.nome || 'Usuário';
    cachedUser = {
      nome,
      email: parsed.email || '',
      role: parsed.role || 'Administrador',
      iniciais: iniciaisDe(nome),
    };
  } catch {
    cachedUser = GUEST;
  }

  return cachedUser;
}

export function senhaAtualConfere(senha: string) {
  const atual = readStoredUser();
  return Boolean(atual?.password && atual.password === senha);
}

export function persistirDadosUsuario(updates: { nome?: string; email?: string; password?: string }) {
  const atual = readStoredUser();
  if (!atual) return;

  const atualizado = { ...atual, ...updates };
  localStorage.setItem('current_user', JSON.stringify(atualizado));

  const users = JSON.parse(localStorage.getItem('fake_users') || '[]') as StoredUser[];
  const index = users.findIndex((user) => user.email === atual.email);
  if (index >= 0) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('fake_users', JSON.stringify(users));
  }

  notifyUserChange();
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
