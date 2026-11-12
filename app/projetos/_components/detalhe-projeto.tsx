'use client';

import { useState, type ReactNode } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { classeBotao, classeBotaoPerigo } from '@/components/campo';
import { Modal, RodapeModal } from '@/components/modal';
import { mensagemDeErro, requisitar } from '@/lib/api';
import { formatarData, formatarNumero } from '@/lib/formatos';
import { classesStatus, rotuloStatus } from '@/lib/status-projeto';
import type { ProjetoLista } from '@/lib/types';

type DetalheProjetoProps = {
  projeto: ProjetoLista;
  onFechar: () => void;
  onEditar: () => void;
  onConcluido: (projeto: ProjetoLista) => void;
  onExcluido: (id: string) => void;
};

function Info({
  rotulo,
  largo = false,
  children,
}: {
  rotulo: string;
  largo?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${largo ? 'md:col-span-2' : ''}`}>
      <p className="text-faint text-xs font-medium">{rotulo}</p>
      <div className="text-ink text-sm">{children}</div>
    </div>
  );
}

export function DetalheProjeto({
  projeto,
  onFechar,
  onEditar,
  onConcluido,
  onExcluido,
}: DetalheProjetoProps) {
  const [concluindo, setConcluindo] = useState(false);

  async function excluir() {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await requisitar(`/api/projetos/${projeto.id}`, 'DELETE');
      onExcluido(projeto.id);
    } catch (erro) {
      alert(mensagemDeErro(erro));
    }
  }

  async function concluir() {
    setConcluindo(true);
    try {
      onConcluido(await requisitar<ProjetoLista>(`/api/projetos/${projeto.id}`, 'PATCH'));
    } catch (erro) {
      alert(mensagemDeErro(erro));
    } finally {
      setConcluindo(false);
    }
  }

  return (
    <Modal titulo="Detalhes do projeto" largura="max-w-2xl" onFechar={onFechar}>
      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Info rotulo="Código">{projeto.codigo}</Info>
        <Info rotulo="Status">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classesStatus(projeto.status)}`}
          >
            {rotuloStatus(projeto.status)}
          </span>
        </Info>
        <Info rotulo="Nome do projeto" largo>
          {projeto.nome}
        </Info>
        <Info rotulo="Cliente">{projeto.cliente?.nome ?? '—'}</Info>
        <Info rotulo="Madeira">{formatarNumero(projeto.qtdeMadeira, 2)} m²</Info>
        <Info rotulo="Início">{formatarData(projeto.dataInicio)}</Info>
        <Info rotulo="Fim">{formatarData(projeto.dataFim)}</Info>
      </div>

      <RodapeModal>
        <button type="button" onClick={excluir} className={classeBotaoPerigo}>
          <Trash2 className="size-4" /> Excluir
        </button>
        {projeto.status !== 'CONCLUIDO' ? (
          <button
            type="button"
            disabled={concluindo}
            onClick={concluir}
            className="bg-ink text-canvas flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            <Check className="size-4" />
            {concluindo ? 'Concluindo...' : 'Concluir'}
          </button>
        ) : null}
        <button type="button" onClick={onEditar} className={classeBotao}>
          <Pencil className="size-4" /> Editar
        </button>
      </RodapeModal>
    </Modal>
  );
}
