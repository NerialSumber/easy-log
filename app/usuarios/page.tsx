'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Edit3, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { useCurrentUser, useExigirPermissao } from '@/lib/current-user';
import type { Role } from '@/lib/permissoes';

type UsuarioLista = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  roleLabel: string;
};

type Formulario = { nome: string; email: string; password: string; role: Role };

const VAZIO: Formulario = { nome: '', email: '', password: '', role: 'PROJETISTA' };

export default function UsuariosPage() {
  const { permitido } = useExigirPermissao('usuarios', 'escrever');
  const atual = useCurrentUser();
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<UsuarioLista | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState<Formulario>(VAZIO);
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    fetch('/api/usuarios', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (res.ok && Array.isArray(data)) setUsuarios(data as UsuarioLista[]);
      })
      .catch(() => setUsuarios([]))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    if (permitido) carregar();
  }, [permitido]);

  const abrirNovo = () => {
    setEditando(null);
    setFormulario(VAZIO);
    setModalAberto(true);
  };

  const abrirEdicao = (usuario: UsuarioLista) => {
    setEditando(usuario);
    setFormulario({
      nome: usuario.nome,
      email: usuario.email,
      password: '',
      role: usuario.role,
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (!salvando) setModalAberto(false);
  };

  const salvar = async (event: FormEvent) => {
    event.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch(
        editando ? `/api/usuarios/${editando.id}` : '/api/usuarios',
        {
          method: editando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formulario),
        },
      );
      const data = (await res.json()) as UsuarioLista | { error?: string };
      if (!res.ok) {
        alert(('error' in data && data.error) || 'Não foi possível salvar o usuário.');
        return;
      }
      const salvo = data as UsuarioLista;
      setUsuarios((lista) =>
        (editando
          ? lista.map((item) => (item.id === editando.id ? salvo : item))
          : [...lista, salvo]
        ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
      );
      if (editando && editando.id === atual.id) {
        const sessao = JSON.parse(localStorage.getItem('current_user') || '{}') as Record<
          string,
          unknown
        >;
        localStorage.setItem('current_user', JSON.stringify({ ...sessao, ...salvo }));
        window.dispatchEvent(new Event('easylog-user'));
      }
      setModalAberto(false);
    } catch {
      alert('Erro de conexão ao salvar o usuário.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (usuario: UsuarioLista) => {
    if (usuario.id === atual.id) {
      alert('Você não pode excluir a própria conta.');
      return;
    }
    if (!confirm(`Excluir o acesso de ${usuario.nome}?`)) return;
    const res = await fetch(`/api/usuarios/${usuario.id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsuarios((lista) => lista.filter((item) => item.id !== usuario.id));
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    alert(data.error || 'Não foi possível excluir o usuário.');
  };

  return (
    <AppShell
      active="usuarios"
      header={
        <PageHeader
          title="Usuários"
          subtitle="Crie, edite e remova acessos ao sistema."
          action={
            <button
              type="button"
              onClick={abrirNovo}
              className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              <Plus className="size-5" /> Novo usuário
            </button>
          }
        />
      }
    >
      <div className="border-line bg-surface overflow-hidden rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-soft">
            <tr className="border-line border-b">
              <th className="text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase">
                Nome
              </th>
              <th className="text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase">
                E-mail
              </th>
              <th className="text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase">
                Função
              </th>
              <th className="w-28 px-6 py-3" aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={4} className="text-muted px-6 py-10 text-center text-sm">
                  Carregando usuários...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted px-6 py-10 text-center text-sm">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-line border-b last:border-0">
                  <td className="text-ink px-6 py-4 text-sm font-semibold">
                    {usuario.nome}
                  </td>
                  <td className="text-muted px-6 py-4 text-sm">{usuario.email}</td>
                  <td className="text-muted px-6 py-4 text-sm">{usuario.roleLabel}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(usuario)}
                        className="text-muted hover:bg-soft hover:text-accent rounded-lg p-2"
                        aria-label={`Editar ${usuario.nome}`}
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void excluir(usuario)}
                        disabled={usuario.id === atual.id}
                        className="text-muted hover:bg-danger-soft hover:text-danger rounded-lg p-2 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Excluir ${usuario.nome}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <form
            onSubmit={salvar}
            className="bg-surface border-line w-full max-w-lg overflow-hidden rounded-xl border"
          >
            <div className="border-line flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-ink text-xl font-bold">
                  {editando ? 'Editar usuário' : 'Novo usuário'}
                </h2>
                <p className="text-muted text-sm">
                  {editando
                    ? 'Atualize os dados de acesso. A senha é opcional.'
                    : 'Crie o acesso e envie e-mail e senha para a pessoa.'}
                </p>
              </div>
              <button
                type="button"
                onClick={fecharModal}
                className="text-muted hover:bg-soft rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                Nome completo
                <input
                  required
                  value={formulario.nome}
                  onChange={(event) =>
                    setFormulario({ ...formulario, nome: event.target.value })
                  }
                  className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                  placeholder="Ex.: Ana Souza"
                />
              </label>
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                E-mail
                <input
                  required
                  type="email"
                  value={formulario.email}
                  onChange={(event) =>
                    setFormulario({ ...formulario, email: event.target.value })
                  }
                  className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                  placeholder="ana@easylog.com"
                />
              </label>
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                {editando ? 'Nova senha' : 'Senha inicial'}
                <input
                  required={!editando}
                  minLength={editando ? undefined : 6}
                  type="password"
                  value={formulario.password}
                  onChange={(event) =>
                    setFormulario({ ...formulario, password: event.target.value })
                  }
                  className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                  placeholder={
                    editando
                      ? 'Deixe em branco para manter a senha atual'
                      : 'Mínimo de 6 caracteres'
                  }
                />
              </label>
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                Função
                <select
                  value={formulario.role}
                  onChange={(event) =>
                    setFormulario({ ...formulario, role: event.target.value as Role })
                  }
                  disabled={editando?.id === atual.id}
                  className="border-line bg-surface focus:border-accent disabled:bg-soft rounded-lg border px-3 py-2 font-normal outline-none"
                >
                  <option value="PROJETISTA">Projetista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            </div>
            <div className="border-line bg-soft flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={fecharModal}
                className="border-line text-muted rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={salvando}
                type="submit"
                className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <UserPlus className="size-4" />
                {salvando
                  ? 'Salvando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Criar acesso'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
