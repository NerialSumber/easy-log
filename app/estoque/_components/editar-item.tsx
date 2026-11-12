'use client';

import { useState, type FormEvent } from 'react';
import { Package } from 'lucide-react';
import {
  Campo,
  classeBotao,
  classeBotaoSecundario,
  classeCampo,
} from '@/components/campo';
import { Modal, RodapeModal } from '@/components/modal';
import { mensagemDeErro, requisitar } from '@/lib/api';
import { CATEGORIAS, UNIDADES } from '@/lib/estoque';
import type { ItemEstoque } from '@/lib/types';

type EditarItemProps = {
  item: ItemEstoque;
  onFechar: () => void;
  onSalvo: (item: ItemEstoque) => void;
};

export function EditarItem({ item, onFechar, onSalvo }: EditarItemProps) {
  const info = CATEGORIAS[item.categoria];
  const [nome, setNome] = useState(item.nome);
  const [unidade, setUnidade] = useState(item.unidade);
  const [salvando, setSalvando] = useState(false);
  const opcoes = UNIDADES.includes(item.unidade) ? UNIDADES : [item.unidade, ...UNIDADES];

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const atualizado = await requisitar<ItemEstoque>(`/api/estoque/${item.id}`, 'PUT', {
        nome,
        unidade: info.unidade || unidade,
      });
      onSalvo(atualizado);
    } catch (erro) {
      alert(mensagemDeErro(erro));
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo="Editar item"
      subtitulo="Altere apenas o nome e a unidade. A quantidade fica no + e −."
      onFechar={onFechar}
    >
      <form onSubmit={salvar}>
        <div className="flex flex-col gap-5 p-6">
          <Campo rotulo={info.campo}>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classeCampo}
            />
          </Campo>
          {info.aviso ? (
            <p className="text-muted text-sm">{info.aviso}</p>
          ) : (
            <Campo rotulo="Unidade de medida">
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className={classeCampo}
              >
                {opcoes.map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
            </Campo>
          )}
        </div>
        <RodapeModal>
          <button type="button" onClick={onFechar} className={classeBotaoSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={classeBotao}>
            <Package className="size-4" />
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </RodapeModal>
      </form>
    </Modal>
  );
}
