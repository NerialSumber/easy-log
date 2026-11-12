import { Edit3, Minus, Plus, Trash2 } from 'lucide-react';
import { unidadeDoItem } from '@/lib/estoque';
import { formatarNumero } from '@/lib/formatos';
import type { ItemEstoque } from '@/lib/types';
import type { Operacao } from './movimento-estoque';

type TabelaEstoqueProps = {
  itens: ItemEstoque[];
  carregando: boolean;
  coluna: string;
  textoVazio: string;
  onMovimentar: (item: ItemEstoque, operacao: Operacao) => void;
  onEditar: (item: ItemEstoque) => void;
  onExcluir: (item: ItemEstoque) => void;
};

const classeCabecalho =
  'text-muted px-6 py-3 text-xs font-bold tracking-[0.72px] uppercase';

export function TabelaEstoque({
  itens,
  carregando,
  coluna,
  textoVazio,
  onMovimentar,
  onEditar,
  onExcluir,
}: TabelaEstoqueProps) {
  const aviso = carregando
    ? 'Carregando estoque...'
    : itens.length === 0
      ? textoVazio
      : '';

  return (
    <div className="border-line bg-surface overflow-hidden rounded-xl border">
      <table className="min-w-full">
        <thead className="bg-soft">
          <tr className="border-line border-b">
            <th className={`${classeCabecalho} text-left`}>{coluna}</th>
            <th className={`${classeCabecalho} text-right`}>Quantidade disponível</th>
            <th className="w-28 px-6 py-3" aria-label="Ações" />
          </tr>
        </thead>
        <tbody>
          {aviso ? (
            <tr>
              <td colSpan={3} className="text-muted px-6 py-10 text-center text-sm">
                {aviso}
              </td>
            </tr>
          ) : (
            itens.map((item) => (
              <tr key={item.id} className="border-line border-b last:border-0">
                <td className="text-ink px-6 py-4 text-sm font-semibold">{item.nome}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onMovimentar(item, 'saida')}
                      disabled={item.quantidade <= 0}
                      className="border-line text-muted hover:border-danger hover:bg-danger-soft hover:text-danger rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Registrar saída de ${item.nome}`}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-muted min-w-24 text-right text-sm">
                      {formatarNumero(item.quantidade)} {unidadeDoItem(item)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onMovimentar(item, 'entrada')}
                      className="border-line text-muted hover:border-accent hover:bg-soft hover:text-accent rounded-lg border p-1.5"
                      aria-label={`Registrar entrada de ${item.nome}`}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditar(item)}
                      className="text-muted hover:bg-soft hover:text-accent rounded-lg p-2"
                      aria-label={`Editar ${item.nome}`}
                    >
                      <Edit3 className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onExcluir(item)}
                      className="text-muted hover:bg-danger-soft hover:text-danger rounded-lg p-2"
                      aria-label={`Excluir ${item.nome}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
