'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import {
  Campo,
  classeBotao,
  classeBotaoSecundario,
  classeCampo,
} from '@/components/campo';
import { ClienteField, dadosDoCliente } from '@/components/cliente-field';
import { MadeiraField } from '@/components/madeira-field';
import { PageHeader } from '@/components/page-header';
import { PeriodoField } from '@/components/periodo-field';
import { buscarLista, mensagemDeErro, requisitar } from '@/lib/api';
import type { ClienteResumo, MadeiraOpcao } from '@/lib/types';

function madeiraDoLink(valor: string | null) {
  const numero = Number(valor);
  return valor?.trim() && Number.isFinite(numero) && numero >= 0 ? String(numero) : '';
}

function FormularioNovoProjeto() {
  const router = useRouter();
  const params = useSearchParams();
  const modelo = params.get('nome')?.trim() ?? '';

  const [nome, setNome] = useState(modelo);
  const [qtdeMadeira, setQtdeMadeira] = useState(madeiraDoLink(params.get('madeira')));
  const [madeiraId, setMadeiraId] = useState(params.get('tipo')?.trim() ?? '');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteId, setClienteId] = useState(params.get('cliente')?.trim() ?? '');
  const [clienteNome, setClienteNome] = useState('');
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [madeiras, setMadeiras] = useState<MadeiraOpcao[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarLista<ClienteResumo>('/api/clientes').then(setClientes);
    buscarLista<MadeiraOpcao>('/api/madeiras').then(setMadeiras);
  }, []);

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      await requisitar('/api/projetos', 'POST', {
        nome,
        qtdeMadeira,
        madeiraId,
        dataInicio,
        dataFim,
        ...dadosDoCliente(clienteId, clienteNome),
      });
      router.push('/projetos');
    } catch (erro) {
      alert(mensagemDeErro(erro));
      setSalvando(false);
    }
  }

  return (
    <AppShell
      active="projetos"
      header={
        <PageHeader
          title="Novo Projeto"
          subtitle={
            modelo
              ? `Repetindo “${modelo}”. Ajuste cliente, madeira e o período.`
              : 'Informe o cliente e os dados iniciais do projeto.'
          }
        />
      }
    >
      <div className="border-line bg-surface overflow-hidden rounded-xl border">
        <h2 className="text-ink p-4 text-lg leading-7 font-bold sm:p-6">
          Detalhes do Projeto
        </h2>

        <form onSubmit={salvar} className="flex flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <ClienteField
            clientes={clientes}
            clienteId={clienteId}
            clienteNome={clienteNome}
            onClienteIdChange={(valor) => {
              setClienteId(valor);
              setClienteNome('');
            }}
            onClienteNomeChange={setClienteNome}
          />

          <Campo rotulo="Nome do Projeto *">
            <input
              type="text"
              required
              readOnly={Boolean(modelo)}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classeCampo}
            />
          </Campo>

          <PeriodoField
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={setDataInicio}
            onDataFimChange={setDataFim}
          />

          <MadeiraField
            madeiras={madeiras}
            madeiraId={madeiraId}
            qtdeMadeira={qtdeMadeira}
            onMadeiraIdChange={setMadeiraId}
            onQtdeMadeiraChange={setQtdeMadeira}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/projetos" className={classeBotaoSecundario}>
              Cancelar
            </Link>
            <button type="submit" disabled={salvando} className={classeBotao}>
              <Save className="size-4" />
              {salvando ? 'Salvando...' : 'Salvar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default function NovoProjetoPage() {
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
