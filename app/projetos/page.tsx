'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Users,
  Truck,
  Plus,
  Pencil,
  Trash2,
  Search,
  LogOut,
  X,
  Save,
} from 'lucide-react';
import { ClienteField } from '@/components/cliente-field';
import { useCurrentUser } from '@/lib/current-user';
import type { ClienteResumo, ProjetoLista, StatusProjeto } from '@/lib/types';

type ProjetoEdicao = {
  id: string;
  codigo: string;
  nome: string;
  qtdeMadeira: string;
  status: StatusProjeto;
  clienteId: string;
  clienteNome: string;
};

function formatarDataHora(iso: string) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

function toEdicao(projeto: ProjetoLista): ProjetoEdicao {
  return {
    id: projeto.id,
    codigo: projeto.codigo,
    nome: projeto.nome,
    qtdeMadeira: String(projeto.qtdeMadeira ?? 0),
    status: projeto.status,
    clienteId: projeto.cliente?.id ?? projeto.clienteId ?? '',
    clienteNome: '',
  };
}

export default function ProjetosCRUD() {
  const userData = useCurrentUser();
  const [projetos, setProjetos] = useState<ProjetoLista[]>([]);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [projetoEditando, setProjetoEditando] = useState<ProjetoEdicao | null>(null);
  const [salvando, setSalvando] = useState(false);

  const fetchProjetos = useCallback(async () => {
    try {
      const res = await fetch('/api/projetos', { cache: 'no-store' });
      const data: unknown = await res.json();
      setProjetos(res.ok && Array.isArray(data) ? (data as ProjetoLista[]) : []);
    } catch {
      setProjetos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const res = await fetch('/api/clientes', { cache: 'no-store' });
      const data: unknown = await res.json();
      if (res.ok && Array.isArray(data)) {
        setClientes(data as ClienteResumo[]);
      }
    } catch {
      setClientes([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/projetos', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (!cancelled) {
          setProjetos(res.ok && Array.isArray(data) ? (data as ProjetoLista[]) : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjetos([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCarregando(false);
        }
      });

    fetch('/api/clientes', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (!cancelled && res.ok && Array.isArray(data)) {
          setClientes(data as ClienteResumo[]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClientes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const projetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return projetos;
    }

    return projetos.filter((projeto) => {
      const cliente = projeto.cliente?.nome ?? '';
      return (
        projeto.nome.toLowerCase().includes(termo) ||
        projeto.codigo.toLowerCase().includes(termo) ||
        cliente.toLowerCase().includes(termo)
      );
    });
  }, [projetos, busca]);

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }

    try {
      const res = await fetch(`/api/projetos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjetos((atual) => atual.filter((projeto) => projeto.id !== id));
      } else {
        alert('Erro do servidor: o banco recusou a exclusão.');
      }
    } catch {
      alert('Erro de conexão ao tentar excluir.');
    }
  };

  const handleSalvarEdicao = async (e: FormEvent) => {
    e.preventDefault();
    if (!projetoEditando) {
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch(`/api/projetos/${projetoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: projetoEditando.codigo,
          nome: projetoEditando.nome,
          qtdeMadeira: projetoEditando.qtdeMadeira,
          status: projetoEditando.status,
          clienteId:
            projetoEditando.clienteId === '__new__' ? undefined : projetoEditando.clienteId,
          clienteNome:
            projetoEditando.clienteId === '__new__' ? projetoEditando.clienteNome : undefined,
        }),
      });

      if (res.ok) {
        setProjetoEditando(null);
        await Promise.all([fetchProjetos(), fetchClientes()]);
      } else {
        const errorData = (await res.json()) as { error?: string };
        alert(errorData.error || 'Erro ao atualizar no servidor.');
      }
    } catch {
      alert('Erro ao salvar as edições.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 font-sans">
      <aside className="hidden w-64 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 p-6">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-white">Easy-Log</span>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link
            href="/projetos"
            className="flex items-center gap-3 rounded-lg border-l-4 border-orange-600 bg-slate-800 px-4 py-3 text-white"
          >
            <FolderKanban className="h-5 w-5 text-orange-500" /> Projetos
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <Package className="h-5 w-5" /> Estoque
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <Users className="h-5 w-5" /> Clientes
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <Truck className="h-5 w-5" /> Fornecedores
          </Link>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                {userData.iniciais}
              </div>
              <div className="flex flex-col">
                <span className="text-sm leading-tight font-medium text-white">
                  {userData.nome}
                </span>
                <span className="text-xs text-slate-400">{userData.role}</span>
              </div>
            </div>
            <Link
              href="/login"
              onClick={() => localStorage.removeItem('current_user')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Projetos</h1>
            <p className="text-sm text-slate-500">
              Liste, busque, crie, edite e exclua os projetos em andamento.
            </p>
          </div>
          <Link
            href="/projetos/novo"
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Plus className="h-5 w-5" /> Novo Projeto
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6 flex">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 py-2 pr-3 pl-10 text-sm outline-none focus:border-orange-600 focus:ring-orange-600"
                placeholder="Buscar por nome, código ou cliente..."
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Data e hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {carregando ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                      Carregando projetos...
                    </td>
                  </tr>
                ) : projetosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                      {busca.trim()
                        ? 'Nenhum projeto encontrado para esta busca.'
                        : 'Nenhum projeto cadastrado.'}
                    </td>
                  </tr>
                ) : (
                  projetosFiltrados.map((projeto) => (
                    <tr key={projeto.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {projeto.nome}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                        {formatarDataHora(projeto.criadoEm)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {projeto.cliente?.nome ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setProjetoEditando(toEdicao(projeto))}
                          className="mr-2 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-orange-600 transition-colors hover:bg-orange-50"
                        >
                          <Pencil className="h-4 w-4" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleExcluir(projeto.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {projetoEditando && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-800">Editar Projeto</h2>
              <button
                type="button"
                onClick={() => setProjetoEditando(null)}
                className="rounded-lg bg-slate-100 p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={projetoEditando.codigo}
                    onChange={(e) =>
                      setProjetoEditando({
                        ...projetoEditando,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Status
                  </label>
                  <select
                    value={projetoEditando.status}
                    onChange={(e) =>
                      setProjetoEditando({
                        ...projetoEditando,
                        status: e.target.value as StatusProjeto,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    required
                    value={projetoEditando.nome}
                    onChange={(e) =>
                      setProjetoEditando({ ...projetoEditando, nome: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <ClienteField
                    clientes={clientes}
                    clienteId={projetoEditando.clienteId}
                    clienteNome={projetoEditando.clienteNome}
                    onClienteIdChange={(clienteId) =>
                      setProjetoEditando({ ...projetoEditando, clienteId, clienteNome: '' })
                    }
                    onClienteNomeChange={(clienteNome) =>
                      setProjetoEditando({ ...projetoEditando, clienteNome })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Qtd. de Madeira (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={projetoEditando.qtdeMadeira}
                    onChange={(e) =>
                      setProjetoEditando({
                        ...projetoEditando,
                        qtdeMadeira: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setProjetoEditando(null)}
                  className="rounded-lg px-5 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
