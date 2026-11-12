'use client';

import { useState, type FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import {
  Campo,
  classeBotao,
  classeBotaoSecundario,
  classeCampo,
} from '@/components/campo';
import { mensagemDeErro } from '@/lib/api';
import { formatarTelefone, validarContato } from '@/lib/contato';
import type { FornecedorLista } from '@/lib/types';

export type DadosFornecedor = {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  produto: string[];
};

export const FORNECEDOR_VAZIO: DadosFornecedor = {
  nome: '',
  telefone: '',
  email: '',
  endereco: '',
  produto: [],
};

export function paraFormulario(fornecedor: FornecedorLista): DadosFornecedor {
  return {
    nome: fornecedor.nome,
    telefone: fornecedor.telefone ?? '',
    email: fornecedor.email ?? '',
    endereco: fornecedor.endereco ?? '',
    produto: fornecedor.produto,
  };
}

type FornecedorFormProps = {
  inicial: DadosFornecedor;
  onSalvar: (dados: DadosFornecedor) => Promise<void>;
  onCancelar: () => void;
};

export function FornecedorForm({ inicial, onSalvar, onCancelar }: FornecedorFormProps) {
  const [dados, setDados] = useState(inicial);
  const [novoProduto, setNovoProduto] = useState('');
  const [salvando, setSalvando] = useState(false);

  function alterar(campos: Partial<DadosFornecedor>) {
    setDados((atual) => ({ ...atual, ...campos }));
  }

  function adicionarProduto() {
    const produto = novoProduto.trim();
    if (produto && !dados.produto.includes(produto)) {
      alterar({ produto: [...dados.produto, produto] });
    }
    setNovoProduto('');
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    const erro = validarContato(dados.telefone, dados.email);
    if (erro) {
      alert(erro);
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(dados);
    } catch (falha) {
      alert(mensagemDeErro(falha));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Campo rotulo="Nome *">
        <input
          type="text"
          required
          value={dados.nome}
          onChange={(e) => alterar({ nome: e.target.value })}
          className={classeCampo}
        />
      </Campo>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo rotulo="Telefone">
          <input
            type="tel"
            value={dados.telefone}
            onChange={(e) => alterar({ telefone: formatarTelefone(e.target.value) })}
            className={classeCampo}
            placeholder="(00) 00000-0000"
          />
        </Campo>
        <Campo rotulo="E-mail">
          <input
            type="email"
            required={!dados.telefone}
            value={dados.email}
            onChange={(e) => alterar({ email: e.target.value })}
            className={classeCampo}
          />
        </Campo>
      </div>
      <Campo rotulo="Endereço">
        <input
          type="text"
          value={dados.endereco}
          onChange={(e) => alterar({ endereco: e.target.value })}
          className={classeCampo}
        />
      </Campo>
      <div className="flex flex-col gap-2">
        <span className="text-ink text-sm font-bold">Produtos fornecidos</span>
        {dados.produto.length > 0 && (
          <span className="flex flex-wrap gap-2">
            {dados.produto.map((produto) => (
              <span
                key={produto}
                className="bg-danger-soft text-danger inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              >
                {produto}
                <button
                  type="button"
                  onClick={() =>
                    alterar({ produto: dados.produto.filter((item) => item !== produto) })
                  }
                  className="text-accent"
                  aria-label={`Remover ${produto}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </span>
        )}
        <input
          type="text"
          value={novoProduto}
          onChange={(e) => setNovoProduto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              adicionarProduto();
            }
          }}
          className={classeCampo}
          placeholder="Digite um produto e pressione Enter"
          aria-label="Novo produto"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancelar} className={classeBotaoSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={salvando} className={classeBotao}>
          <Save className="size-4" />
          {salvando ? 'Salvando...' : 'Salvar Fornecedor'}
        </button>
      </div>
    </form>
  );
}
