'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Abas } from '@/components/abas';
import { AppShell } from '@/components/app-shell';
import { classeBotao } from '@/components/campo';
import { PageHeader } from '@/components/page-header';
import { buscarLista } from '@/lib/api';
import type { ClienteResumo, ProjetoLista } from '@/lib/types';
import { Catalogo } from './_components/catalogo';
import { DetalheProjeto } from './_components/detalhe-projeto';
import { EditarProjeto } from './_components/editar-projeto';
import { Pedidos } from './_components/pedidos';

type Aba = 'pedidos' | 'catalogo';

const ABAS: { id: Aba; titulo: string; descricao: string }[] = [
  {
    id: 'pedidos',
    titulo: 'Pedidos',
    descricao: 'Projetos em produção, com cliente, período e status.',
  },
  {
    id: 'catalogo',
    titulo: 'Catálogo',
    descricao: 'Inicie um projeto a partir dos modelos já feitos.',
  },
];

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<ProjetoLista[]>([]);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>('pedidos');
  const [detalhe, setDetalhe] = useState<ProjetoLista | null>(null);
  const [editando, setEditando] = useState<ProjetoLista | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    Promise.all([
      buscarLista<ProjetoLista>('/api/projetos'),
      buscarLista<ClienteResumo>('/api/clientes'),
    ]).then(([listaProjetos, listaClientes]) => {
      setProjetos(listaProjetos);
      setClientes(listaClientes);
      setCarregando(false);
    });
  }, [versao]);

  function substituir(projeto: ProjetoLista) {
    setProjetos((lista) =>
      lista.map((item) => (item.id === projeto.id ? projeto : item)),
    );
    setDetalhe(projeto);
  }

  function remover(id: string) {
    setProjetos((lista) => lista.filter((item) => item.id !== id));
    setDetalhe(null);
  }

  return (
    <AppShell
      active="projetos"
      canvas
      header={
        <PageHeader
          title="Projetos"
          subtitle={
            aba === 'pedidos'
              ? 'Busque, filtre e acompanhe os pedidos em produção.'
              : 'Escolha um modelo do catálogo para iniciar um projeto.'
          }
          action={
            aba === 'catalogo' ? (
              <Link href="/projetos/novo" className={classeBotao}>
                <Plus className="size-4" /> Iniciar projeto
              </Link>
            ) : null
          }
        />
      }
    >
      <div className="flex flex-col gap-5">
        <Abas abas={ABAS} ativa={aba} rotulo="Projetos e catálogo" onTrocar={setAba} />
        {aba === 'catalogo' ? (
          <Catalogo projetos={projetos} carregando={carregando} />
        ) : (
          <Pedidos projetos={projetos} carregando={carregando} onAbrir={setDetalhe} />
        )}
      </div>

      {detalhe && (
        <DetalheProjeto
          projeto={detalhe}
          onFechar={() => setDetalhe(null)}
          onEditar={() => {
            setEditando(detalhe);
            setDetalhe(null);
          }}
          onConcluido={substituir}
          onExcluido={remover}
        />
      )}

      {editando && (
        <EditarProjeto
          projeto={editando}
          clientes={clientes}
          onFechar={() => setEditando(null)}
          onSalvo={() => {
            setEditando(null);
            setVersao((atual) => atual + 1);
          }}
        />
      )}
    </AppShell>
  );
}
