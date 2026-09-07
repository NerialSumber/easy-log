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
    setFormulario({ nome: usuario.nome, email: usuario.email, password: '', role: usuario.role });
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (!salvando) setModalAberto(false);
  };

  const salvar = async (event: FormEvent) => {
    event.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch(editando ? `/api/usuarios/${editando.id}` : '/api/usuarios', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });
      const data = (await res.json()) as UsuarioLista | { error?: string };
      if (!res.ok) {
        alert(('error' in data && data.error) || 'Não foi possível salvar o usuário.');
        return;
      }
      const salvo = data as UsuarioLista;
      setUsuarios((lista) =>
        (editando ? lista.map((item) => (item.id === editando.id ? salvo : item)) : [...lista, salvo]).sort((a, b) =>
          a.nome.localeCompare(b.nome, 'pt-BR'),
        ),
      );
      if (editando && editando.id === atual.id) {
        const sessao = JSON.parse(localStorage.getItem('current_user') || '{}') as Record<string, unknown>;
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
              className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c2410c]"
            >
              <Plus className="size-5" /> Novo usuário
            </button>
          }
        />
      }
    >
      <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
        <table className="min-w-full">
          <thead className="bg-[#f8fafc]">
            <tr className="border-b border-[#e2e8f0]">
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.72px] text-[#64748b]">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.72px] text-[#64748b]">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.72px] text-[#64748b]">Função</th>
              <th className="w-28 px-6 py-3" aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#64748b]">
                  Carregando usuários...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#64748b]">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-[#e2e8f0] last:border-0">
                  <td className="px-6 py-4 text-sm font-semibold text-[#0f172a]">{usuario.nome}</td>
                  <td className="px-6 py-4 text-sm text-[#475569]">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm text-[#475569]">{usuario.roleLabel}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(usuario)}
                        className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ea580c]"
                        aria-label={`Editar ${usuario.nome}`}
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void excluir(usuario)}
                        disabled={usuario.id === atual.id}
                        className="rounded-lg p-2 text-[#64748b] hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
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
          <form onSubmit={salvar} className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-[#1e293b]">{editando ? 'Editar usuário' : 'Novo usuário'}</h2>
                <p className="text-sm text-[#64748b]">
                  {editando ? 'Atualize os dados de acesso. A senha é opcional.' : 'Crie o acesso e envie e-mail e senha para a pessoa.'}
                </p>
              </div>
              <button type="button" onClick={fecharModal} className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9]" aria-label="Fechar">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">
                Nome completo
                <input
                  required
                  value={formulario.nome}
                  onChange={(event) => setFormulario({ ...formulario, nome: event.target.value })}
                  className="rounded-lg border border-[#cbd5e1] px-3 py-2 font-normal outline-none focus:border-[#ea580c]"
                  placeholder="Ex.: Ana Souza"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">
                E-mail
                <input
                  required
                  type="email"
                  value={formulario.email}
                  onChange={(event) => setFormulario({ ...formulario, email: event.target.value })}
                  className="rounded-lg border border-[#cbd5e1] px-3 py-2 font-normal outline-none focus:border-[#ea580c]"
                  placeholder="ana@easylog.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">
                {editando ? 'Nova senha' : 'Senha inicial'}
                <input
                  required={!editando}
                  minLength={editando ? undefined : 6}
                  type="password"
                  value={formulario.password}
                  onChange={(event) => setFormulario({ ...formulario, password: event.target.value })}
                  className="rounded-lg border border-[#cbd5e1] px-3 py-2 font-normal outline-none focus:border-[#ea580c]"
                  placeholder={editando ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 6 caracteres'}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">
                Função
                <select
                  value={formulario.role}
                  onChange={(event) => setFormulario({ ...formulario, role: event.target.value as Role })}
                  disabled={editando?.id === atual.id}
                  className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 font-normal outline-none focus:border-[#ea580c] disabled:bg-[#f8fafc]"
                >
                  <option value="PROJETISTA">Projetista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4">
              <button type="button" onClick={fecharModal} className="rounded-lg border border-[#cbd5e1] px-4 py-2 text-sm font-semibold text-[#475569]">
                Cancelar
              </button>
              <button
                disabled={salvando}
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <UserPlus className="size-4" />
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar acesso'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
