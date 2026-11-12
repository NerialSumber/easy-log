'use client';

import { useState, type FormEvent } from 'react';
import {
  Campo,
  classeBotao,
  classeBotaoSecundario,
  classeCampo,
} from '@/components/campo';
import { Modal, RodapeModal } from '@/components/modal';
import { mensagemDeErro, requisitar } from '@/lib/api';
import { unidadeDoItem } from '@/lib/estoque';
import { formatarNumero } from '@/lib/formatos';
import type { ItemEstoque } from '@/lib/types';

export type Operacao = 'entrada' | 'saida';

type MovimentoEstoqueProps = {
  item: ItemEstoque;
  operacao: Operacao;
  onFechar: () => void;
  onSalvo: (item: ItemEstoque) => void;
};

export function MovimentoEstoque({
  item,
  operacao,
  onFechar,
  onSalvo,
}: MovimentoEstoqueProps) {
  const [quantidade, setQuantidade] = useState('1');
  const [salvando, setSalvando] = useState(false);
  const entrada = operacao === 'entrada';
  const unidade = unidadeDoItem(item);

  const valor = Number(quantidade);
  const resultado =
    Number.isFinite(valor) && valor > 0
      ? Math.round((item.quantidade + (entrada ? valor : -valor)) * 100) / 100
      : null;

  let aviso = entrada
    ? 'Informe a quantidade que entrou no estoque físico.'
    : 'Informe a quantidade que saiu do estoque físico.';
  if (resultado !== null) {
    aviso =
      resultado < 0
        ? 'A saída é maior do que a quantidade disponível.'
        : `Novo estoque: ${formatarNumero(resultado)} ${unidade}`;
  }

  async function confirmar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const atualizado = await requisitar<ItemEstoque>(
        `/api/estoque/${item.id}`,
        'PATCH',
        {
          operacao,
          quantidade: valor,
        },
      );
      onSalvo(atualizado);
    } catch (erro) {
      alert(mensagemDeErro(erro));
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={entrada ? 'Entrada de estoque' : 'Saída de estoque'}
      subtitulo={item.nome}
      largura="max-w-md"
      onFechar={onFechar}
    >
      <form onSubmit={confirmar}>
        <div className="flex flex-col gap-5 p-6">
          <div className="bg-soft text-muted rounded-lg px-4 py-3 text-sm">
            Estoque atual:{' '}
            <span className="text-ink font-semibold">
              {formatarNumero(item.quantidade)} {unidade}
            </span>
          </div>
          <Campo rotulo={entrada ? 'Quantidade que entrou' : 'Quantidade que saiu'}>
            <input
              required
              autoFocus
              min="0.01"
              step={item.categoria === 'EPI' ? '1' : '0.01'}
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className={classeCampo}
            />
          </Campo>
          <p
            className={`text-sm ${resultado !== null && resultado < 0 ? 'text-danger' : 'text-muted'}`}
          >
            {aviso}
          </p>
        </div>
        <RodapeModal>
          <button type="button" onClick={onFechar} className={classeBotaoSecundario}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando || resultado === null || resultado < 0}
            className={classeBotao}
          >
            {salvando
              ? 'Atualizando...'
              : entrada
                ? 'Confirmar entrada'
                : 'Confirmar saída'}
          </button>
        </RodapeModal>
      </form>
    </Modal>
  );
}
