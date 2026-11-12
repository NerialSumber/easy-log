'use client';

import { useState, type ReactNode } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import {
  classeBotao,
  classeBotaoPerigo,
  classeBotaoSecundario,
} from '@/components/campo';
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
  const [pedido, setPedido] = useState<'concluir' | 'excluir' | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  let pergunta = 'Deseja marcar este projeto como concluído?';
  if (pedido === 'excluir') {
    pergunta = 'Tem certeza que deseja excluir este projeto?';
  } else if (projeto.madeira && projeto.qtdeMadeira > 0) {
    pergunta = `Concluir vai descontar ${formatarNumero(projeto.qtdeMadeira)} m² de ${projeto.madeira.nome} do estoque.`;
  }

  function pedir(acao: 'concluir' | 'excluir') {
    setErro('');
    setPedido(acao);
  }

  async function confirmar() {
    setOcupado(true);
    try {
      if (pedido === 'excluir') {
        await requisitar(`/api/projetos/${projeto.id}`, 'DELETE');
        onExcluido(projeto.id);
      } else {
        onConcluido(
          await requisitar<ProjetoLista>(`/api/projetos/${projeto.id}`, 'PATCH'),
        );
      }
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setPedido(null);
      setOcupado(false);
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
        <Info rotulo="Madeira">
          {formatarNumero(projeto.qtdeMadeira, 2)} m²
          {projeto.madeira ? ` de ${projeto.madeira.nome}` : ''}
        </Info>
        <Info rotulo="Início">{formatarData(projeto.dataInicio)}</Info>
        <Info rotulo="Fim">{formatarData(projeto.dataFim)}</Info>
      </div>

      {erro ? (
        <p
          role="alert"
          className="border-danger bg-danger-soft text-danger mx-6 mb-6 rounded-lg border px-4 py-3 text-sm"
        >
          {erro}
        </p>
      ) : null}

      {pedido ? (
        <RodapeModal>
          <p className="text-ink mr-auto self-center text-sm">{pergunta}</p>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => setPedido(null)}
            className={classeBotaoSecundario}
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={ocupado}
            onClick={confirmar}
            className={pedido === 'excluir' ? classeBotaoPerigo : classeBotao}
          >
            {ocupado
              ? 'Aguarde...'
              : pedido === 'excluir'
                ? 'Sim, excluir'
                : 'Confirmar conclusão'}
          </button>
        </RodapeModal>
      ) : (
        <RodapeModal>
          <button
            type="button"
            onClick={() => pedir('excluir')}
            className={classeBotaoPerigo}
          >
            <Trash2 className="size-4" /> Excluir
          </button>
          {projeto.status !== 'CONCLUIDO' ? (
            <button
              type="button"
              onClick={() => pedir('concluir')}
              className="bg-ink text-canvas flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              <Check className="size-4" /> Concluir
            </button>
          ) : null}
          <button type="button" onClick={onEditar} className={classeBotao}>
            <Pencil className="size-4" /> Editar
          </button>
        </RodapeModal>
      )}
    </Modal>
  );
}
