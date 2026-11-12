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

type AcoesProps = Pick<TabelaEstoqueProps, 'onMovimentar' | 'onEditar' | 'onExcluir'> & {
  item: ItemEstoque;
};

const classeCabecalho =
  'text-muted px-4 py-3 text-xs font-bold tracking-[0.72px] uppercase xl:px-6';
const classeSaida =
  'border-line text-muted hover:border-danger hover:bg-danger-soft hover:text-danger flex items-center justify-center gap-1.5 rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-40';
const classeEntrada =
  'border-line text-muted hover:border-accent hover:bg-soft hover:text-accent flex items-center justify-center gap-1.5 rounded-lg border p-1.5';

function quantidade(item: ItemEstoque) {
  return `${formatarNumero(item.quantidade)} ${unidadeDoItem(item)}`;
}

function BotoesEditar({ item, onEditar, onExcluir }: AcoesProps) {
  return (
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
  );
}

function CartaoItem(props: AcoesProps) {
  const { item, onMovimentar } = props;

  return (
    <li className="border-line flex flex-col gap-2 border-b px-4 py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink min-w-0 flex-1 text-sm font-semibold">{item.nome}</span>
        <BotoesEditar {...props} />
      </div>
      <p className="text-muted text-sm">
        Disponível: <span className="text-ink font-medium">{quantidade(item)}</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onMovimentar(item, 'saida')}
          disabled={item.quantidade <= 0}
          className={`${classeSaida} px-3 py-2 text-sm`}
        >
          <Minus className="size-4" /> Saída
        </button>
        <button
          type="button"
          onClick={() => onMovimentar(item, 'entrada')}
          className={`${classeEntrada} px-3 py-2 text-sm`}
        >
          <Plus className="size-4" /> Entrada
        </button>
      </div>
    </li>
  );
}

export function TabelaEstoque({
  itens,
  carregando,
  coluna,
  textoVazio,
  ...acoes
}: TabelaEstoqueProps) {
  const aviso = carregando
    ? 'Carregando estoque...'
    : itens.length === 0
      ? textoVazio
      : '';

  if (aviso) {
    return (
      <div className="border-line bg-surface text-muted rounded-xl border px-4 py-10 text-center text-sm">
        {aviso}
      </div>
    );
  }

  return (
    <div className="border-line bg-surface overflow-x-auto rounded-xl border">
      <ul className="md:hidden">
        {itens.map((item) => (
          <CartaoItem key={item.id} item={item} {...acoes} />
        ))}
      </ul>

      <table className="hidden min-w-full md:table">
        <thead className="bg-soft">
          <tr className="border-line border-b">
            <th className={`${classeCabecalho} text-left`}>{coluna}</th>
            <th className={`${classeCabecalho} text-right`}>Quantidade disponível</th>
            <th className="px-4 py-3 xl:px-6" aria-label="Ações" />
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id} className="border-line border-b last:border-0">
              <td className="text-ink px-4 py-4 text-sm font-semibold xl:px-6">
                {item.nome}
              </td>
              <td className="px-4 py-4 xl:px-6">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => acoes.onMovimentar(item, 'saida')}
                    disabled={item.quantidade <= 0}
                    className={classeSaida}
                    aria-label={`Registrar saída de ${item.nome}`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-muted min-w-24 text-right text-sm whitespace-nowrap">
                    {quantidade(item)}
                  </span>
                  <button
                    type="button"
                    onClick={() => acoes.onMovimentar(item, 'entrada')}
                    className={classeEntrada}
                    aria-label={`Registrar entrada de ${item.nome}`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-4 xl:px-6">
                <BotoesEditar item={item} {...acoes} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
