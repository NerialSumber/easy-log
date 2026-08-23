'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { ClienteField } from '@/components/cliente-field';
import { PageHeader } from '@/components/page-header';
import { PeriodoField } from '@/components/periodo-field';
import type { ClienteResumo } from '@/lib/types';

export default function NovoProjeto() {
  const router = useRouter();

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [qtdeMadeira, setQtdeMadeira] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteId, setClienteId] = useState('');
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
          codigo,
          nome,
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
          subtitle="Informe o cliente, o código e os dados iniciais do projeto."
        />
      }
    >
      <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
        <div className="p-6">
          <h2 className="text-lg leading-7 font-bold text-[#1e293b]">
            Detalhes do Projeto
          </h2>
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
            <label className="text-sm font-bold text-[#1e293b]">Código *</label>
            <input
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
              placeholder="PRJ-001"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1e293b]">Nome do Projeto *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
            />
          </div>

          <PeriodoField
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={setDataInicio}
            onDataFimChange={setDataFim}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1e293b]">
              Qtd. Madeira (m²) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={qtdeMadeira}
              onChange={(e) => setQtdeMadeira(e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/projetos"
              className="rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
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
