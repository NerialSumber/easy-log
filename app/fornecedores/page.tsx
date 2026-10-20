'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Filter, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { useCurrentUser } from '@/lib/current-user';
import { formatarTelefone, validarContato } from '@/lib/contato';
import { pode } from '@/lib/permissoes';
import type { FornecedorLista } from '@/lib/types';

type FornecedorEdicao = {
  id?: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  produto: string[];
};

function formatarContato(fornecedor: FornecedorLista) {
  return {
    telefone: fornecedor.telefone ? formatarTelefone(fornecedor.telefone) : '—',
    email: fornecedor.email || '—',
  };
}

function filtrarFornecedores(fornecedores: FornecedorLista[], busca: string) {
  const termo = busca.trim().toLowerCase();
  if (!termo) return fornecedores;
  return fornecedores.filter((fornecedor) =>
    `${fornecedor.nome} ${fornecedor.telefone ?? ''} ${fornecedor.email ?? ''} ${fornecedor.produto.join(' ')}`
      .toLowerCase()
      .includes(termo),
  );
}

export default function FornecedoresCRUD() {
  const user = useCurrentUser();
  const podeEditar = pode(user.role, 'fornecedores', 'escrever');
  const [fornecedores, setFornecedores] = useState<FornecedorLista[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [detalhe, setDetalhe] = useState<FornecedorLista | null>(null);
  const [editando, setEditando] = useState<FornecedorEdicao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [novoProduto, setNovoProduto] = useState('');

  const fetchFornecedores = async () => {
    try {
      const res = await fetch('/api/fornecedores', { cache: 'no-store' });
      const data: unknown = await res.json();
      setFornecedores(res.ok && Array.isArray(data) ? (data as FornecedorLista[]) : []);
    } catch {
      setFornecedores([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetch('/api/fornecedores', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (!cancelled) {
          setFornecedores(
            res.ok && Array.isArray(data) ? (data as FornecedorLista[]) : [],
          );
        }
      })
      .catch(() => {
        if (!cancelled) setFornecedores([]);
      })
      .finally(() => {
        if (!cancelled) setCarregando(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtrados = useMemo(
    () => filtrarFornecedores(fornecedores, busca),
    [fornecedores, busca],
  );

  const handleSalvar = async (event: FormEvent) => {
    event.preventDefault();
    if (!editando) return;
    const erroContato = validarContato(editando.telefone, editando.email);
    if (erroContato) {
      alert(erroContato);
      return;
    }
    setSalvando(true);
    const url = editando.id ? `/api/fornecedores/${editando.id}` : '/api/fornecedores';
    try {
      const res = await fetch(url, {
        method: editando.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando),
      });
      if (res.ok) {
        setEditando(null);
        await fetchFornecedores();
      } else {
        const data = (await res.json()) as { error?: string };
        alert(data.error || 'Não foi possível salvar o fornecedor.');
      }
    } catch {
      alert('Erro de conexão ao salvar o fornecedor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      const res = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFornecedores((atual) => atual.filter((item) => item.id !== id));
        setDetalhe(null);
      } else alert('Não foi possível excluir o fornecedor.');
    } catch {
      alert('Erro de conexão ao excluir o fornecedor.');
    }
  };

  return (
    <AppShell
      active="fornecedores"
      header={
        <PageHeader
          title="Gerenciamento de Fornecedores"
          subtitle={
            podeEditar
              ? 'Cadastre os fornecedores e os produtos que eles fornecem.'
              : 'Consulte os fornecedores e os produtos que eles fornecem.'
          }
          action={
            podeEditar ? (
              <Link
                href="/fornecedores/novo"
                className="bg-accent-fill text-on-accent flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-base leading-6 font-medium"
              >
                <Plus className="size-5" /> Novo Fornecedor
              </Link>
            ) : undefined
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <div className="border-line flex w-full max-w-[520px] items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="text-faint size-5 shrink-0" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="text-ink placeholder:text-faint w-full bg-transparent text-sm leading-5 outline-none"
              placeholder="Buscar por nome, telefone ou e-mail..."
              aria-label="Buscar por nome ou contato"
            />
            <Filter className="text-faint size-5 shrink-0" />
          </div>
        </form>
        <div className="border-line bg-surface overflow-hidden rounded-xl border">
          <table className="min-w-full">
            <thead className="bg-soft">
              <tr className="border-line border-b">
                <th className="text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase">
                  Nome
                </th>
                <th className="text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase">
                  Contato
                </th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={2} className="text-muted px-6 py-4 text-center">
                    Carregando fornecedores...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-muted px-6 py-4 text-center">
                    {busca.trim()
                      ? 'Nenhum fornecedor encontrado.'
                      : 'Nenhum fornecedor cadastrado.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((fornecedor) => (
                  <tr
                    key={fornecedor.id}
                    className="border-line hover:bg-soft cursor-pointer border-b last:border-b-0"
                    onClick={() => setDetalhe(fornecedor)}
                  >
                    <td className="text-ink px-6 py-4 text-sm font-medium">
                      {fornecedor.nome}
                    </td>
                    <td className="text-muted px-6 py-4 text-right text-sm">
                      <div className="flex flex-col items-end gap-1">
                        <span>
                          <strong className="text-ink font-semibold">E-mail:</strong>{' '}
                          {formatarContato(fornecedor).email}
                        </span>
                        <span>
                          <strong className="text-ink font-semibold">Telefone:</strong>{' '}
                          {formatarContato(fornecedor).telefone}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <div className="bg-surface flex w-full max-w-[560px] flex-col overflow-hidden rounded-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-ink text-xl leading-7 font-bold">
                Detalhes do Fornecedor
              </h2>
              <button
                type="button"
                onClick={() => setDetalhe(null)}
                className="bg-soft text-faint rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <div>
                <p className="text-ink text-sm font-bold">Nome</p>
                <p className="text-ink text-sm">{detalhe.nome}</p>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-ink text-sm font-bold">Telefone</p>
                    <p className="text-ink text-sm">{detalhe.telefone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-ink text-sm font-bold">E-mail</p>
                    <p className="text-ink text-sm">{detalhe.email || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-ink text-sm font-bold">Endereço</p>
                  <p className="text-ink text-sm">{detalhe.endereco || '—'}</p>
                </div>
                <div>
                  <p className="text-ink text-sm font-bold">Produtos fornecidos</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detalhe.produto.length ? (
                      detalhe.produto.map((produto) => (
                        <span
                          key={produto}
                          className="bg-danger-soft text-danger rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {produto}
                        </span>
                      ))
                    ) : (
                      <span className="text-ink text-sm">—</span>
                    )}
                  </div>
                </div>
              </div>
              {podeEditar ? (
                <div className="border-line flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => void handleExcluir(detalhe.id)}
                    className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-bold"
                  >
                    <Trash2 className="size-4" /> Excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditando({
                        id: detalhe.id,
                        nome: detalhe.nome,
                        telefone: detalhe.telefone ?? '',
                        email: detalhe.email ?? '',
                        endereco: detalhe.endereco ?? '',
                        produto: detalhe.produto,
                      });
                      setNovoProduto('');
                      setDetalhe(null);
                    }}
                    className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-bold"
                  >
                    <Pencil className="size-4" /> Editar
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <div className="bg-surface flex w-full max-w-2xl flex-col rounded-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-ink text-xl leading-7 font-bold">
                {editando.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="bg-soft text-faint rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSalvar} className="flex flex-col gap-5 p-6">
              <div>
                <label className="text-ink mb-1 block text-sm font-bold">Nome *</label>
                <input
                  type="text"
                  required
                  value={editando.nome}
                  onChange={(event) =>
                    setEditando({ ...editando, nome: event.target.value })
                  }
                  className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="text-ink mb-1 block text-sm font-bold">Telefone</label>
                <input
                  type="text"
                  value={editando.telefone}
                  onChange={(event) =>
                    setEditando({
                      ...editando,
                      telefone: formatarTelefone(event.target.value),
                    })
                  }
                  className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                  placeholder="(00) 00000-0000"
                  required={!editando.email}
                />
              </div>
              <div>
                <label className="text-ink mb-1 block text-sm font-bold">E-mail</label>
                <input
                  type="email"
                  required={!editando.telefone}
                  value={editando.email}
                  onChange={(event) =>
                    setEditando({ ...editando, email: event.target.value })
                  }
                  className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="text-ink mb-1 block text-sm font-bold">Endereço</label>
                <input
                  type="text"
                  value={editando.endereco}
                  onChange={(event) =>
                    setEditando({ ...editando, endereco: event.target.value })
                  }
                  className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="text-ink mb-1 block text-sm font-bold">
                  Produtos fornecidos
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {editando.produto.map((produto) => (
                    <span
                      key={produto}
                      className="bg-danger-soft text-danger inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {produto}
                      <button
                        type="button"
                        onClick={() =>
                          setEditando({
                            ...editando,
                            produto: editando.produto.filter((item) => item !== produto),
                          })
                        }
                        className="text-accent"
                        aria-label={`Remover ${produto}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={novoProduto}
                  onChange={(event) => setNovoProduto(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && novoProduto.trim()) {
                      event.preventDefault();
                      const produto = novoProduto.trim();
                      if (!editando.produto.includes(produto))
                        setEditando({
                          ...editando,
                          produto: [...editando.produto, produto],
                        });
                      setNovoProduto('');
                    }
                  }}
                  className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                  placeholder="Digite um produto e pressione Enter"
                />
              </div>
              <div className="border-line flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="text-muted hover:bg-soft rounded-lg px-5 py-2.5 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold disabled:opacity-60"
                >
                  <Save className="size-4" />
                  {salvando ? 'Salvando...' : 'Salvar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
