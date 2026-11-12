'use client';

import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import {
  Campo,
  classeBotao,
  classeBotaoSecundario,
  classeCampo,
} from '@/components/campo';
import { ClienteField, dadosDoCliente } from '@/components/cliente-field';
import { Modal, RodapeModal } from '@/components/modal';
import { PeriodoField } from '@/components/periodo-field';
import { mensagemDeErro, requisitar } from '@/lib/api';
import { paraInputData } from '@/lib/formatos';
import { classesStatus, rotuloStatus, statusVisivel } from '@/lib/status-projeto';
import type { ClienteResumo, ProjetoLista } from '@/lib/types';

type EditarProjetoProps = {
  projeto: ProjetoLista;
  clientes: ClienteResumo[];
  onFechar: () => void;
  onSalvo: () => void;
};

export function EditarProjeto({
  projeto,
  clientes,
  onFechar,
  onSalvo,
}: EditarProjetoProps) {
  const [form, setForm] = useState({
    nome: projeto.nome,
    qtdeMadeira: String(projeto.qtdeMadeira ?? 0),
    dataInicio: paraInputData(projeto.dataInicio),
    dataFim: paraInputData(projeto.dataFim),
    clienteId: projeto.clienteId ?? '',
    clienteNome: '',
  });
  const [salvando, setSalvando] = useState(false);
  const status = statusVisivel(projeto.status, form.dataInicio, form.dataFim);

  function alterar(campos: Partial<typeof form>) {
    setForm((atual) => ({ ...atual, ...campos }));
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      await requisitar(`/api/projetos/${projeto.id}`, 'PUT', {
        nome: form.nome,
        qtdeMadeira: form.qtdeMadeira,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        ...dadosDoCliente(form.clienteId, form.clienteNome),
      });
      onSalvo();
    } catch (erro) {
      alert(mensagemDeErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Editar projeto" largura="max-w-2xl" onFechar={onFechar}>
      <form onSubmit={salvar}>
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <p className="text-ink mb-2 text-sm font-bold">Código</p>
            <p className="bg-soft text-ink rounded-lg px-4 py-3 text-sm">
              {projeto.codigo}
            </p>
          </div>
          <div>
            <p className="text-ink mb-2 text-sm font-bold">Status</p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classesStatus(status)}`}
            >
              {rotuloStatus(status)}
            </span>
          </div>
          <div className="md:col-span-2">
            <PeriodoField
              dataInicio={form.dataInicio}
              dataFim={form.dataFim}
              onDataInicioChange={(dataInicio) => alterar({ dataInicio })}
              onDataFimChange={(dataFim) => alterar({ dataFim })}
            />
          </div>
          <div className="md:col-span-2">
            <Campo rotulo="Nome do projeto">
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => alterar({ nome: e.target.value })}
                className={classeCampo}
              />
            </Campo>
          </div>
          <div className="md:col-span-2">
            <ClienteField
              clientes={clientes}
              clienteId={form.clienteId}
              clienteNome={form.clienteNome}
              onClienteIdChange={(clienteId) => alterar({ clienteId, clienteNome: '' })}
              onClienteNomeChange={(clienteNome) => alterar({ clienteNome })}
            />
          </div>
          <Campo rotulo="Qtd. de madeira (m²)">
            <input
              type="number"
              step="0.01"
              required
              value={form.qtdeMadeira}
              onChange={(e) => alterar({ qtdeMadeira: e.target.value })}
              className={classeCampo}
            />
          </Campo>
        </div>

        <RodapeModal>
          <button type="button" onClick={onFechar} className={classeBotaoSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={classeBotao}>
            <Save className="size-4" />
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </RodapeModal>
      </form>
    </Modal>
  );
}
