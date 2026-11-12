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
import type { Categoria, ItemEstoque } from '@/lib/types';

type NovoItemProps = {
  categoria: Categoria;
  onFechar: () => void;
  onCriado: (item: ItemEstoque) => void;
};

export function NovoItem({ categoria, onFechar, onCriado }: NovoItemProps) {
  const info = CATEGORIAS[categoria];
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState(UNIDADES[0]);
  const [salvando, setSalvando] = useState(false);

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const item = await requisitar<ItemEstoque>('/api/estoque', 'POST', {
        nome,
        quantidade,
        unidade: info.unidade || unidade,
        categoria,
      });
      onCriado(item);
    } catch (erro) {
      alert(mensagemDeErro(erro));
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Novo item" subtitulo={info.titulo} onFechar={onFechar}>
      <form onSubmit={salvar}>
        <div className="flex flex-col gap-5 p-6">
          <Campo rotulo={info.campo}>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classeCampo}
              placeholder={info.exemplo}
            />
          </Campo>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Quantidade">
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className={classeCampo}
                placeholder="0"
              />
            </Campo>
            {info.aviso ? (
              <p className="text-muted flex items-end pb-3 text-sm">{info.aviso}</p>
            ) : (
              <Campo rotulo="Unidade de medida">
                <select
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className={classeCampo}
                >
                  {UNIDADES.map((opcao) => (
                    <option key={opcao}>{opcao}</option>
                  ))}
                </select>
              </Campo>
            )}
          </div>
        </div>
        <RodapeModal>
          <button type="button" onClick={onFechar} className={classeBotaoSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={classeBotao}>
            <Package className="size-4" />
            {salvando ? 'Salvando...' : 'Salvar item'}
          </button>
        </RodapeModal>
      </form>
    </Modal>
  );
}
