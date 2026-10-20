'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Check, Filter, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { ClienteField } from '@/components/cliente-field';
import { PageHeader } from '@/components/page-header';
import { PeriodoField } from '@/components/periodo-field';
import { formatarData, formatarPeriodo, toInputDate } from '@/lib/datas';
import {
  classesStatusModal,
  classesStatusTabela,
  rotuloStatus,
  statusVisivel,
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

type CampoFiltro = 'todos' | 'nome' | 'data' | 'cliente' | 'status';

const STATUS_FILTRO: StatusProjeto[] = [
  'ABERTO',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'ATRASADO',
];

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

function coincideTexto(valor: string, termo: string) {
  return valor.toLowerCase().includes(termo);
}

function projetoNoDia(projeto: ProjetoLista, dia: string) {
  const inicio = toInputDate(projeto.dataInicio);
  const fim = toInputDate(projeto.dataFim);

  if (!inicio && !fim) {
    return false;
  }

  if (inicio && fim) {
    return dia >= inicio && dia <= fim;
  }

  return dia === inicio || dia === fim;
}

type ProjetoFrequente = {
  nome: string;
  quantidade: number;
  qtdeMadeira: number;
  clienteId: string;
};

function projetosMaisFeitos(projetos: ProjetoLista[], limite = 8): ProjetoFrequente[] {
  const contagem = new Map<string, ProjetoFrequente & { atualizadoEm: number }>();

  for (const projeto of projetos) {
    const nome = projeto.nome.trim();
    const chave = nome.toLowerCase();
    if (!chave) {
      continue;
    }

    const quando = new Date(projeto.criadoEm).getTime() || 0;
    const caracteristicas = {
      nome,
      qtdeMadeira: projeto.qtdeMadeira ?? 0,
      clienteId: projeto.cliente?.id ?? projeto.clienteId ?? '',
    };
    const atual = contagem.get(chave);
    if (!atual) {
      contagem.set(chave, { ...caracteristicas, quantidade: 1, atualizadoEm: quando });
      continue;
    }

    atual.quantidade += 1;
    if (quando >= atual.atualizadoEm) {
      Object.assign(atual, caracteristicas, { atualizadoEm: quando });
    }
  }

  return [...contagem.values()]
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'))
    .slice(0, limite)
    .map((item) => ({
      nome: item.nome,
      quantidade: item.quantidade,
      qtdeMadeira: item.qtdeMadeira,
      clienteId: item.clienteId,
    }));
}

function hrefNovoApartir(item: ProjetoFrequente) {
  const params = new URLSearchParams({
    nome: item.nome,
    madeira: String(item.qtdeMadeira),
  });
  if (item.clienteId) {
    params.set('cliente', item.clienteId);
  }
  return `/projetos/novo?${params.toString()}`;
}

function filtrarProjetos(projetos: ProjetoLista[], busca: string, filtro: CampoFiltro) {
  const termoBruto = busca.trim();
  const termo = termoBruto.toLowerCase();
  if (!termo) {
    return projetos;
  }

  const buscaPorDataIso = /^\d{4}-\d{2}-\d{2}$/.test(termoBruto);

  return projetos.filter((projeto) => {
    const cliente = projeto.cliente?.nome ?? '';
    const periodo = formatarPeriodo(projeto.dataInicio, projeto.dataFim);

    if (filtro === 'nome') {
      return coincideTexto(projeto.nome, termo);
    }

    if (filtro === 'cliente') {
      return coincideTexto(cliente, termo);
    }

    if (filtro === 'data') {
      if (buscaPorDataIso) {
        return projetoNoDia(projeto, termoBruto);
      }

      return coincideTexto(periodo, termo);
    }

    if (filtro === 'status') {
      return projeto.status === termoBruto;
    }

    return (
      coincideTexto(projeto.nome, termo) ||
      coincideTexto(projeto.codigo, termo) ||
      coincideTexto(cliente, termo) ||
      coincideTexto(periodo, termo) ||
      coincideTexto(rotuloStatus(projeto.status), termo) ||
      coincideTexto(projeto.status, termo) ||
      (buscaPorDataIso && projetoNoDia(projeto, termoBruto))
    );
  });
}

function placeholderBusca(filtro: CampoFiltro) {
  if (filtro === 'nome') {
    return 'Buscar por nome...';
  }

  if (filtro === 'cliente') {
    return 'Buscar por cliente...';
  }

  if (filtro === 'data') {
    return 'Selecionar data';
  }

  if (filtro === 'status') {
    return 'Selecionar status';
  }

  return 'Buscar por nome, data, cliente ou status...';
}

export default function ProjetosCRUD() {
  const [projetos, setProjetos] = useState<ProjetoLista[]>([]);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<CampoFiltro>('todos');
  const [carregando, setCarregando] = useState(true);
  const [projetoDetalhe, setProjetoDetalhe] = useState<ProjetoLista | null>(null);
  const [projetoEditando, setProjetoEditando] = useState<ProjetoEdicao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

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

  const maisFeitos = useMemo(() => projetosMaisFeitos(projetos), [projetos]);

  const projetosFiltrados = useMemo(
    () => filtrarProjetos(projetos, busca, filtro),
    [projetos, busca, filtro],
  );

  const temFiltroAtivo = busca.trim().length > 0;

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

  const handleConcluir = async (id: string) => {
    setConcluindo(true);
    try {
      const res = await fetch(`/api/projetos/${id}`, { method: 'PATCH' });
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        alert(errorData.error || 'Não foi possível concluir o projeto.');
        return;
      }

      setProjetos((atual) =>
        atual.map((projeto) =>
          projeto.id === id ? { ...projeto, status: 'CONCLUIDO' } : projeto,
        ),
      );
      setProjetoDetalhe((atual) =>
        atual && atual.id === id ? { ...atual, status: 'CONCLUIDO' } : atual,
      );
    } catch {
      alert('Erro de conexão ao concluir o projeto.');
    } finally {
      setConcluindo(false);
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
          nome: projetoEditando.nome,
          qtdeMadeira: projetoEditando.qtdeMadeira,
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
      canvas
      header={
        <PageHeader
          title="Projetos"
          subtitle="Busque, filtre e acompanhe o que está em produção."
          action={
            <Link
              href="/projetos/novo"
              className="bg-accent-fill text-on-accent flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Plus className="size-4" /> Novo projeto
            </Link>
          }
        />
      }
    >
      <div className="flex flex-col gap-5">
        <section className="border-line bg-surface rounded-md border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-ink text-base font-semibold">Projetos mais feitos</h2>
              <p className="text-muted mt-1 text-sm leading-5">
                Toque em um nome para criar outro projeto igual, com datas novas.
              </p>
            </div>
          </div>

          {carregando ? (
            <div className="mt-5 flex flex-col gap-2">
              {Array.from({ length: 3 }, (_, indice) => (
                <div key={indice} className="bg-soft h-14 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : maisFeitos.length === 0 ? (
            <p className="bg-soft text-muted mt-5 rounded-xl px-4 py-8 text-center text-sm">
              Nenhum projeto cadastrado para montar a lista.
            </p>
          ) : (
            <div className="mt-5 flex flex-col gap-2" role="list">
              {maisFeitos.map((item, indice) => {
                const lider = indice === 0;
                const maior = maisFeitos[0]?.quantidade ?? 1;
                const largura = Math.max((item.quantidade / maior) * 100, 8);

                return (
                  <Link
                    key={item.nome.toLowerCase()}
                    href={hrefNovoApartir(item)}
                    role="listitem"
                    className={`relative overflow-hidden rounded-xl border text-left ${
                      lider
                        ? 'border-line hover:border-accent'
                        : 'border-line hover:border-line'
                    }`}
                  >
                    <span
                      className={`absolute inset-y-0 left-0 ${lider ? 'bg-soft' : 'bg-soft'}`}
                      style={{ width: `${largura}%` }}
                    />
                    <span className="relative flex items-center gap-4 px-4 py-3.5">
                      <span
                        className={`w-4 text-sm tabular-nums ${
                          lider ? 'text-accent font-semibold' : 'text-faint'
                        }`}
                      >
                        {indice + 1}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          lider
                            ? 'text-ink text-base font-semibold'
                            : 'text-ink text-sm font-medium'
                        }`}
                      >
                        {item.nome}
                      </span>
                      <span className="text-muted shrink-0 text-sm tabular-nums">
                        <span className="text-ink font-semibold">{item.quantidade}</span>
                        <span className="ml-1 text-xs">
                          {item.quantidade === 1 ? 'vez' : 'vezes'}
                        </span>
                      </span>
                      <Plus className="text-accent size-4 shrink-0" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-line bg-surface overflow-hidden rounded-md border">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="border-line flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center"
          >
            <div className="bg-soft flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
              <Search className="text-faint size-4 shrink-0" />
              {filtro === 'status' ? (
                <select
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="text-ink w-full bg-transparent text-sm outline-none"
                  aria-label="Filtrar por status"
                >
                  <option value="">Todos os status</option>
                  {STATUS_FILTRO.map((status) => (
                    <option key={status} value={status}>
                      {rotuloStatus(status)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filtro === 'data' ? 'date' : 'search'}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="text-ink placeholder:text-faint w-full bg-transparent text-sm outline-none"
                  placeholder={placeholderBusca(filtro)}
                  aria-label={placeholderBusca(filtro)}
                />
              )}
            </div>

            <div className="bg-soft flex w-full items-center gap-2 rounded-xl px-3 py-2.5 sm:w-52">
              <Filter className="text-faint size-4 shrink-0" />
              <select
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value as CampoFiltro);
                  setBusca('');
                }}
                className="text-ink w-full bg-transparent text-sm outline-none"
                aria-label="Filtrar por"
              >
                <option value="todos">Todos os campos</option>
                <option value="nome">Nome</option>
                <option value="data">Data</option>
                <option value="cliente">Cliente</option>
                <option value="status">Status</option>
              </select>
            </div>

            <p className="text-faint text-sm sm:ml-auto">
              {carregando
                ? 'Carregando'
                : `${projetosFiltrados.length} ${projetosFiltrados.length === 1 ? 'projeto' : 'projetos'}`}
            </p>
          </form>

          <table className="min-w-full">
            <thead>
              <tr className="border-line border-b">
                <th className="text-faint px-6 py-3 text-left text-xs font-medium">
                  Projeto
                </th>
                <th className="text-faint w-[240px] px-6 py-3 text-left text-xs font-medium">
                  Período
                </th>
                <th className="text-faint px-6 py-3 text-left text-xs font-medium">
                  Cliente
                </th>
                <th className="text-faint w-[160px] px-6 py-3 text-right text-xs font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={4} className="text-muted px-6 py-12 text-center text-sm">
                    Carregando projetos...
                  </td>
                </tr>
              ) : projetosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted px-6 py-12 text-center text-sm">
                    {temFiltroAtivo
                      ? 'Nenhum projeto encontrado para esta busca.'
                      : 'Nenhum projeto cadastrado.'}
                  </td>
                </tr>
              ) : (
                projetosFiltrados.map((projeto) => (
                  <tr
                    key={projeto.id}
                    className="border-line hover:bg-soft cursor-pointer border-b last:border-b-0"
                    onClick={() => setProjetoDetalhe(projeto)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-ink text-sm font-medium">{projeto.nome}</p>
                      <p className="text-faint mt-0.5 text-xs">{projeto.codigo}</p>
                    </td>
                    <td className="text-muted w-[240px] px-6 py-4 text-sm whitespace-nowrap">
                      {formatarPeriodo(projeto.dataInicio, projeto.dataFim)}
                    </td>
                    <td className="text-ink px-6 py-4 text-sm">
                      {projeto.cliente?.nome ?? '—'}
                    </td>
                    <td className="w-[160px] px-6 py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classesStatusTabela(projeto.status)}`}
                      >
                        {rotuloStatus(projeto.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      {projetoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-surface border-line flex w-full max-w-[672px] flex-col overflow-hidden rounded-md border">
            <div className="border-line flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-ink text-lg font-semibold">Detalhes do projeto</h2>
              <button
                type="button"
                onClick={() => setProjetoDetalhe(null)}
                className="bg-soft text-faint rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-faint text-xs font-medium">Código</p>
                  <p className="text-ink text-sm">{projetoDetalhe.codigo}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-faint text-xs font-medium">Status</p>
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${classesStatusModal(projetoDetalhe.status)}`}
                  >
                    {rotuloStatus(projetoDetalhe.status)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-faint text-xs font-medium">Nome do projeto</p>
                <p className="text-ink text-sm">{projetoDetalhe.nome}</p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-faint text-xs font-medium">Cliente</p>
                  <p className="text-ink text-sm">
                    {projetoDetalhe.cliente?.nome ?? '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-faint text-xs font-medium">Madeira</p>
                  <p className="text-ink text-sm">
                    {formatarMadeira(projetoDetalhe.qtdeMadeira)} m²
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-faint text-xs font-medium">Início</p>
                  <p className="text-ink text-sm">
                    {formatarData(projetoDetalhe.dataInicio)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-faint text-xs font-medium">Fim</p>
                  <p className="text-ink text-sm">
                    {formatarData(projetoDetalhe.dataFim)}
                  </p>
                </div>
              </div>

              <div className="border-line flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => void handleExcluir(projetoDetalhe.id)}
                  className="border-danger text-danger hover:bg-danger-soft flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                >
                  <Trash2 className="size-4" /> Excluir
                </button>
                {projetoDetalhe.status !== 'CONCLUIDO' ? (
                  <button
                    type="button"
                    disabled={concluindo}
                    onClick={() => void handleConcluir(projetoDetalhe.id)}
                    className="bg-ink text-canvas flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    <Check className="size-4" />
                    {concluindo ? 'Concluindo...' : 'Concluir'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setProjetoEditando(toEdicao(projetoDetalhe));
                    setProjetoDetalhe(null);
                  }}
                  className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  <Pencil className="size-4" /> Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projetoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-surface border-line flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border">
            <div className="border-line flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-ink text-lg font-semibold">Editar projeto</h2>
              <button
                type="button"
                onClick={() => setProjetoEditando(null)}
                className="bg-soft text-faint rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-5 overflow-auto p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <p className="text-ink mb-1.5 text-sm font-medium">Código</p>
                  <p className="bg-soft text-ink rounded-xl px-4 py-3 text-sm">
                    {projetoEditando.codigo}
                  </p>
                </div>
                <div>
                  <p className="text-ink mb-1.5 text-sm font-medium">Status</p>
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classesStatusModal(statusVisivel(projetoEditando.status, projetoEditando.dataInicio, projetoEditando.dataFim))}`}
                  >
                    {rotuloStatus(
                      statusVisivel(
                        projetoEditando.status,
                        projetoEditando.dataInicio,
                        projetoEditando.dataFim,
                      ),
                    )}
                  </p>
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
                  <label className="text-ink mb-1.5 block text-sm font-medium">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    required
                    value={projetoEditando.nome}
                    onChange={(e) =>
                      setProjetoEditando({ ...projetoEditando, nome: e.target.value })
                    }
                    className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
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
                  <label className="text-ink mb-1.5 block text-sm font-medium">
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
                    className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="border-line flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setProjetoEditando(null)}
                  className="text-muted hover:bg-soft rounded-xl px-4 py-2.5 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
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
