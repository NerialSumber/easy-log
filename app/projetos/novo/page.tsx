'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { ClienteField } from '@/components/cliente-field';
import { PageHeader } from '@/components/page-header';
import { PeriodoField } from '@/components/periodo-field';
import type { ClienteResumo } from '@/lib/types';

function lerMadeira(valor: string | null) {
  if (!valor || !valor.trim()) return '';
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? String(numero) : '';
}

function FormularioNovoProjeto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nomeInicial = searchParams.get('nome')?.trim() ?? '';
  const madeiraInicial = lerMadeira(searchParams.get('madeira'));
  const clienteInicial = searchParams.get('cliente')?.trim() ?? '';
  const aPartirDe = nomeInicial.length > 0;

  const [nome, setNome] = useState(nomeInicial);
  const [qtdeMadeira, setQtdeMadeira] = useState(madeiraInicial);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteId, setClienteId] = useState(clienteInicial);
  const [clienteNome, setClienteNome] = useState('');
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let cancelled = false;

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

  const handleSalvarProjeto = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const response = await fetch('/api/projetos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: aPartirDe ? nomeInicial : nome,
          qtdeMadeira,
          dataInicio,
          dataFim,
          clienteId: clienteId === '__new__' ? undefined : clienteId,
          clienteNome: clienteId === '__new__' ? clienteNome : undefined,
        }),
      });

      if (response.ok) {
        router.push('/projetos');
      } else {
        const errorData = (await response.json()) as { error?: string };
        alert(`Erro do servidor: ${errorData.error || 'Não foi possível salvar.'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AppShell
      active="projetos"
      header={
        <PageHeader
          title="Novo Projeto"
          subtitle={
            aPartirDe
              ? `Repetindo “${nomeInicial}”. Ajuste cliente, madeira e o período.`
              : 'Informe o cliente e os dados iniciais do projeto.'
          }
        />
      }
    >
      <div className="border-line bg-surface overflow-hidden rounded-xl border">
        <div className="p-6">
          <h2 className="text-ink text-lg leading-7 font-bold">Detalhes do Projeto</h2>
        </div>

        <form onSubmit={handleSalvarProjeto} className="flex flex-col gap-4 p-6 pt-0">
          <ClienteField
            clientes={clientes}
            clienteId={clienteId}
            clienteNome={clienteNome}
            onClienteIdChange={(value) => {
              setClienteId(value);
              setClienteNome('');
            }}
            onClienteNomeChange={setClienteNome}
          />

          <div className="flex flex-col gap-2">
            <label className="text-ink text-sm font-bold">Nome do Projeto *</label>
            {aPartirDe ? (
              <p className="border-line bg-soft text-ink rounded-lg border px-4 py-3 text-sm">
                {nomeInicial}
              </p>
            ) : (
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              />
            )}
          </div>

          <PeriodoField
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={setDataInicio}
            onDataFimChange={setDataFim}
          />

          <div className="flex flex-col gap-2">
            <label className="text-ink text-sm font-bold">Qtd. Madeira (m²) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={qtdeMadeira}
              onChange={(e) => setQtdeMadeira(e.target.value)}
              className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/projetos"
              className="bg-soft text-muted hover:bg-soft rounded-lg px-6 py-3 text-sm font-bold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold disabled:opacity-60"
            >
              <Save className="size-4" />
              {salvando ? 'Salvando...' : 'Salvar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default function NovoProjeto() {
  return (
    <Suspense
      fallback={
        <AppShell
          active="projetos"
          header={<PageHeader title="Novo Projeto" subtitle="Carregando formulário..." />}
        >
          <p className="text-muted text-sm">Carregando formulário...</p>
        </AppShell>
      }
    >
      <FormularioNovoProjeto />
    </Suspense>
  );
}
