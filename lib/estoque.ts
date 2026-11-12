import type { Categoria, ItemEstoque } from '@/lib/types';

type InfoCategoria = {
  titulo: string;
  descricao: string;
  campo: string;
  exemplo: string;
  unidade: string;
  aviso: string;
};

export const CATEGORIAS: Record<Categoria, InfoCategoria> = {
  MADEIRA: {
    titulo: 'Madeira',
    descricao: 'Controle de materiais em m²',
    campo: 'Tipo da madeira',
    exemplo: 'Ex.: Pinus',
    unidade: 'm²',
    aviso: 'A quantidade fica em metros quadrados (m²).',
  },
  QUIMICO: {
    titulo: 'Produtos químicos',
    descricao: 'Tintas, colas e thinners',
    campo: 'Nome do produto',
    exemplo: 'Ex.: Tinta esmalte',
    unidade: '',
    aviso: '',
  },
  EPI: {
    titulo: 'EPIs',
    descricao: 'Equipamentos disponíveis',
    campo: 'Nome do EPI',
    exemplo: 'Ex.: Capacete',
    unidade: 'unidades',
    aviso: 'A quantidade fica em unidades.',
  },
};

export const UNIDADES = [
  'litros',
  'mililitros',
  'quilogramas',
  'gramas',
  'centímetros',
  'unidades',
];

export function unidadeDoItem(item: Pick<ItemEstoque, 'unidade' | 'categoria'>) {
  if (item.categoria === 'MADEIRA') return 'm²';
  if (item.categoria === 'EPI') return 'un.';
  return item.unidade;
}
