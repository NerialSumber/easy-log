'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { ClienteField } from '@/components/cliente-field';
import { PageHeader } from '@/components/page-header';
import { PeriodoField } from '@/components/periodo-field';
import { formatarData, formatarPeriodo, toInputDate } from '@/lib/datas';
import {
  classesStatusModal,
  classesStatusTabela,
  rotuloStatus,
} from '@/lib/status-projeto';
import type { ClienteResumo, ProjetoLista, StatusProjeto } from '@/lib/types';

type ProjetoEdicao = {
  id: string;
  codigo: string;
  nome: string;
  qtdeMadeira: string;
  status: StatusProjeto;
  dataInicio: string;
  dataFim: string;
  clienteId: string;
  clienteNome: string;
};

function formatarMadeira(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function toEdicao(projeto: ProjetoLista): ProjetoEdicao {
  return {
    id: projeto.id,
    codigo: projeto.codigo,
    nome: projeto.nome,
    qtdeMadeira: String(projeto.qtdeMadeira ?? 0),
    status: projeto.status,
    dataInicio: toInputDate(projeto.dataInicio),
    dataFim: toInputDate(projeto.dataFim),
    clienteId: projeto.cliente?.id ?? projeto.clienteId ?? '',
    clienteNome: '',
  };
}

export default function ProjetosCRUD() {
  const [projetos, setProjetos] = useState<ProjetoLista[]>([]);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [projetoDetalhe, setProjetoDetalhe] = useState<ProjetoLista | null>(null);
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
        setProjetoDetalhe(null);
        setProjetoEditando(null);
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
          dataInicio: projetoEditando.dataInicio,
          dataFim: projetoEditando.dataFim,
          clienteId:
            projetoEditando.clienteId === '__new__'
              ? undefined
              : projetoEditando.clienteId,
          clienteNome:
            projetoEditando.clienteId === '__new__'
              ? projetoEditando.clienteNome
              : undefined,
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
    <AppShell
      active="projetos"
      header={
        <PageHeader
          title="Gerenciamento de Projetos"
          subtitle="Liste, busque, crie, edite e exclua os projetos em andamento."
          action={
            <Link
              href="/projetos/novo"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#ea580c] px-4 py-2 text-base leading-6 font-medium text-white"
            >
              <Plus className="size-5" /> Novo Projeto
            </Link>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex w-full max-w-[448px] items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 py-2">
          <Search className="size-5 shrink-0 text-[#94a3b8]" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm leading-5 text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
            placeholder="Buscar por nome, código ou cliente..."
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          <table className="min-w-full">
            <thead className="bg-[#f8fafc]">
              <tr className="border-b border-[#e2e8f0]">
                <th className="px-6 py-3 text-left text-xs font-bold tracking-[0.72px] text-[#64748b] uppercase">
                  Nome
                </th>
                <th className="w-[240px] px-6 py-3 text-left text-xs font-bold tracking-[0.72px] text-[#64748b] uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-[0.72px] text-[#64748b] uppercase">
                  Cliente
                </th>
                <th className="w-[200px] px-6 py-3 text-right text-xs font-bold tracking-[0.72px] text-[#64748b] uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-[#64748b]">
                    Carregando projetos...
                  </td>
                </tr>
              ) : projetosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-[#64748b]">
                    {busca.trim()
                      ? 'Nenhum projeto encontrado para esta busca.'
                      : 'Nenhum projeto cadastrado.'}
                  </td>
                </tr>
              ) : (
                projetosFiltrados.map((projeto) => (
                  <tr
                    key={projeto.id}
                    className="cursor-pointer border-b border-[#e2e8f0] last:border-b-0 hover:bg-slate-50"
                    onClick={() => setProjetoDetalhe(projeto)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#0f172a]">
                      {projeto.nome}
                    </td>
                    <td className="w-[240px] px-6 py-4 text-sm whitespace-nowrap text-[#64748b]">
                      {formatarPeriodo(projeto.dataInicio, projeto.dataFim)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#334155]">
                      {projeto.cliente?.nome ?? '—'}
                    </td>
                    <td className="w-[200px] px-6 py-4">
                      <span
                        className={`flex w-full items-center justify-center rounded-xl px-3 py-1 text-xs font-medium ${classesStatusTabela(projeto.status)}`}
                      >
                        {rotuloStatus(projeto.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {projetoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <div className="flex w-full max-w-[672px] flex-col overflow-hidden rounded-xl bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl leading-7 font-bold text-[#1e293b]">
                Detalhes do Projeto
              </h2>
              <button
                type="button"
                onClick={() => setProjetoDetalhe(null)}
                className="rounded-lg bg-[#f1f5f9] p-2 text-slate-400"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1e293b]">Código</p>
                  <p className="text-sm text-[#0f172a]">{projetoDetalhe.codigo}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1e293b]">Status</p>
                  <span
                    className={`inline-flex w-fit rounded-lg px-2.5 py-1 text-sm font-medium ${classesStatusModal(projetoDetalhe.status)}`}
                  >
                    {rotuloStatus(projetoDetalhe.status)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-[#1e293b]">Nome do Projeto</p>
                <p className="text-sm text-[#0f172a]">{projetoDetalhe.nome}</p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1e293b]">Cliente</p>
                  <p className="text-sm text-[#0f172a]">
                    {projetoDetalhe.cliente?.nome ?? '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1e293b]">Qtd. de Madeira (m²)</p>
                  <p className="text-sm text-[#0f172a]">
                    {formatarMadeira(projetoDetalhe.qtdeMadeira)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1e293b]">Data início</p>
                  <p className="text-sm text-[#0f172a]">
                    {formatarData(projetoDetalhe.dataInicio)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1e293b]">Data fim</p>
                  <p className="text-sm text-[#0f172a]">
                    {formatarData(projetoDetalhe.dataFim)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => void handleExcluir(projetoDetalhe.id)}
                  className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-5 py-2.5 text-base leading-6 font-bold text-white"
                >
                  <Trash2 className="size-4" /> Excluir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjetoEditando(toEdicao(projetoDetalhe));
                    setProjetoDetalhe(null);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-5 py-2.5 text-base leading-6 font-bold text-white"
                >
                  <Pencil className="size-4" /> Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projetoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <div className="flex w-full max-w-2xl flex-col rounded-xl bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl leading-7 font-bold text-[#1e293b]">
                Editar Projeto
              </h2>
              <button
                type="button"
                onClick={() => setProjetoEditando(null)}
                className="rounded-lg bg-[#f1f5f9] p-2 text-slate-400"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#1e293b]">
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
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#1e293b]">
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
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="ATRASADO">Atrasado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <PeriodoField
                    dataInicio={projetoEditando.dataInicio}
                    dataFim={projetoEditando.dataFim}
                    onDataInicioChange={(dataInicio) =>
                      setProjetoEditando({ ...projetoEditando, dataInicio })
                    }
                    onDataFimChange={(dataFim) =>
                      setProjetoEditando({ ...projetoEditando, dataFim })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-bold text-[#1e293b]">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    required
                    value={projetoEditando.nome}
                    onChange={(e) =>
                      setProjetoEditando({ ...projetoEditando, nome: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
                <div className="md:col-span-2">
                  <ClienteField
                    clientes={clientes}
                    clienteId={projetoEditando.clienteId}
                    clienteNome={projetoEditando.clienteNome}
                    onClienteIdChange={(clienteId) =>
                      setProjetoEditando({
                        ...projetoEditando,
                        clienteId,
                        clienteNome: '',
                      })
                    }
                    onClienteNomeChange={(clienteNome) =>
                      setProjetoEditando({ ...projetoEditando, clienteNome })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#1e293b]">
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
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#f1f5f9] pt-4">
                <button
                  type="button"
                  onClick={() => setProjetoEditando(null)}
                  className="rounded-lg px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-5 py-2.5 font-bold text-white disabled:opacity-60"
                >
                  <Save className="size-4" />{' '}
                  {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
