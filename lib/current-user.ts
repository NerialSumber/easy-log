'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { normalizarRole, pode, rotuloRole, type Acao, type Area, type Role } from '@/lib/permissoes';

export type UserData = {
  id: string;
  nome: string;
  email: string;
  role: Role | '';
  roleLabel: string;
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
  id: '',
  nome: 'Carregando...',
  email: '',
  role: '',
  roleLabel: 'Aguarde',
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
  window.addEventListener('easylog-user', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('easylog-user', onChange);
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
    const parsed = JSON.parse(stored) as {
      id?: string;
      nome?: string;
      email?: string;
      role?: string;
      roleLabel?: string;
    };
    const nome = parsed.nome || 'Usuário';
    const role = normalizarRole(parsed.role);
    cachedUser = {
      id: parsed.id || '',
      nome,
      email: parsed.email || '',
      role,
      roleLabel: parsed.roleLabel || (role ? rotuloRole(role) : 'Usuário'),
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
    let cancelado = false;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (!res.ok) throw new Error('unauth');
        return data as { nome?: string; email?: string; role?: string; roleLabel?: string };
      })
      .then((data) => {
        if (cancelado) return;
        localStorage.setItem('current_user', JSON.stringify(data));
        window.dispatchEvent(new Event('easylog-user'));
      })
      .catch(() => {
        if (cancelado) return;
        localStorage.removeItem('current_user');
        window.location.href = '/login';
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return user;
}

export function useExigirPermissao(area: Area, acao: Acao = 'ver') {
  const user = useCurrentUser();
  const pronto = user.role === 'ADMIN' || user.role === 'PROJETISTA';
  const permitido = pode(user.role, area, acao);

  useEffect(() => {
    if (pronto && !permitido) {
      window.location.replace('/');
    }
  }, [pronto, permitido]);

  return { user, permitido, pronto };
}
