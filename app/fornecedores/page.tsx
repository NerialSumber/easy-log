'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Filter, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { formatarTelefone, validarContato } from '@/lib/contato';
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
          subtitle="Cadastre os fornecedores e os produtos que eles fornecem."
          action={
            <Link
              href="/fornecedores/novo"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#ea580c] px-4 py-2 text-base leading-6 font-medium text-white"
            >
              <Plus className="size-5" /> Novo Fornecedor
            </Link>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <div className="flex w-full max-w-[520px] items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 py-2">
            <Search className="size-5 shrink-0 text-[#94a3b8]" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="w-full bg-transparent text-sm leading-5 text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              placeholder="Buscar por nome, telefone ou e-mail..."
              aria-label="Buscar por nome ou contato"
            />
            <Filter className="size-5 shrink-0 text-[#94a3b8]" />
          </div>
        </form>
        <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          <table className="min-w-full">
            <thead className="bg-[#f8fafc]">
              <tr className="border-b border-[#e2e8f0]">
                <th className="px-6 py-3 text-left text-xs font-bold tracking-[0.72px] text-[#64748b] uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-[0.72px] text-[#64748b] uppercase">
                  Contato
                </th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-[#64748b]">
                    Carregando fornecedores...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-[#64748b]">
                    {busca.trim()
                      ? 'Nenhum fornecedor encontrado.'
                      : 'Nenhum fornecedor cadastrado.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((fornecedor) => (
                  <tr
                    key={fornecedor.id}
                    className="cursor-pointer border-b border-[#e2e8f0] last:border-b-0 hover:bg-slate-50"
                    onClick={() => setDetalhe(fornecedor)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#0f172a]">
                      {fornecedor.nome}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#64748b]">
                      <div className="flex flex-col items-end gap-1">
                        <span>
                          <strong className="font-semibold text-[#334155]">
                            E-mail:
                          </strong>{' '}
                          {formatarContato(fornecedor).email}
                        </span>
                        <span>
                          <strong className="font-semibold text-[#334155]">
                            Telefone:
                          </strong>{' '}
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
          <div className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl leading-7 font-bold text-[#1e293b]">
                Detalhes do Fornecedor
              </h2>
              <button
                type="button"
                onClick={() => setDetalhe(null)}
                className="rounded-lg bg-[#f1f5f9] p-2 text-slate-400"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <div>
                <p className="text-sm font-bold text-[#1e293b]">Nome</p>
                <p className="text-sm text-[#0f172a]">{detalhe.nome}</p>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold text-[#1e293b]">Telefone</p>
                    <p className="text-sm text-[#0f172a]">{detalhe.telefone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e293b]">E-mail</p>
                    <p className="text-sm text-[#0f172a]">{detalhe.email || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">Endereço</p>
                  <p className="text-sm text-[#0f172a]">{detalhe.endereco || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">Produtos fornecidos</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detalhe.produto.length ? (
                      detalhe.produto.map((produto) => (
                        <span
                          key={produto}
                          className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                        >
                          {produto}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#0f172a]">—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => void handleExcluir(detalhe.id)}
                  className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-5 py-2.5 text-base font-bold text-white"
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
                  className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-5 py-2.5 text-base font-bold text-white"
                >
                  <Pencil className="size-4" /> Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <div className="flex w-full max-w-2xl flex-col rounded-xl bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl leading-7 font-bold text-[#1e293b]">
                {editando.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-lg bg-[#f1f5f9] p-2 text-slate-400"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSalvar} className="flex flex-col gap-5 p-6">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1e293b]">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={editando.nome}
                  onChange={(event) =>
                    setEditando({ ...editando, nome: event.target.value })
                  }
                  className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1e293b]">
                  Telefone
                </label>
                <input
                  type="text"
                  value={editando.telefone}
                  onChange={(event) =>
                    setEditando({
                      ...editando,
                      telefone: formatarTelefone(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                  placeholder="(00) 00000-0000"
                  required={!editando.email}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1e293b]">
                  E-mail
                </label>
                <input
                  type="email"
                  required={!editando.telefone}
                  value={editando.email}
                  onChange={(event) =>
                    setEditando({ ...editando, email: event.target.value })
                  }
                  className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1e293b]">
                  Endereço
                </label>
                <input
                  type="text"
                  value={editando.endereco}
                  onChange={(event) =>
                    setEditando({ ...editando, endereco: event.target.value })
                  }
                  className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1e293b]">
                  Produtos fornecidos
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {editando.produto.map((produto) => (
                    <span
                      key={produto}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
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
                        className="text-orange-700"
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
                  className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                  placeholder="Digite um produto e pressione Enter"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="rounded-lg px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-5 py-2.5 font-bold text-white disabled:opacity-60"
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
