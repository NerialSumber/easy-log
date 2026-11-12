import type { ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { classeBotao, classeBotaoPerigo } from '@/components/campo';
import { Modal, RodapeModal } from '@/components/modal';
import type { FornecedorLista } from '@/lib/types';

type DetalheFornecedorProps = {
  fornecedor: FornecedorLista;
  podeEditar: boolean;
  onFechar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
};

function Info({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-ink text-sm font-bold">{rotulo}</p>
      <div className="text-ink text-sm">{children}</div>
    </div>
  );
}

export function DetalheFornecedor({
  fornecedor,
  podeEditar,
  onFechar,
  onEditar,
  onExcluir,
}: DetalheFornecedorProps) {
  return (
    <Modal titulo="Detalhes do Fornecedor" largura="max-w-xl" onFechar={onFechar}>
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <Info rotulo="Nome">{fornecedor.nome}</Info>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Info rotulo="Telefone">{fornecedor.telefone || '—'}</Info>
          <Info rotulo="E-mail">{fornecedor.email || '—'}</Info>
        </div>
        <Info rotulo="Endereço">{fornecedor.endereco || '—'}</Info>
        <Info rotulo="Produtos fornecidos">
          <div className="mt-2 flex flex-wrap gap-2">
            {fornecedor.produto.length
              ? fornecedor.produto.map((produto) => (
                  <span
                    key={produto}
                    className="bg-danger-soft text-danger rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {produto}
                  </span>
                ))
              : '—'}
          </div>
        </Info>
      </div>
      {podeEditar ? (
        <RodapeModal>
          <button type="button" onClick={onExcluir} className={classeBotaoPerigo}>
            <Trash2 className="size-4" /> Excluir
          </button>
          <button type="button" onClick={onEditar} className={classeBotao}>
            <Pencil className="size-4" /> Editar
          </button>
        </RodapeModal>
      ) : null}
    </Modal>
  );
}
