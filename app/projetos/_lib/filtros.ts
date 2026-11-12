import { formatarPeriodo, paraInputData } from '@/lib/formatos';
import { rotuloStatus } from '@/lib/status-projeto';
import type { ProjetoLista } from '@/lib/types';

export type CampoFiltro = 'todos' | 'nome' | 'data' | 'cliente' | 'status';

export const FILTROS: Record<CampoFiltro, { rotulo: string; placeholder: string }> = {
  todos: {
    rotulo: 'Todos os campos',
    placeholder: 'Buscar por nome, data, cliente ou status...',
  },
  nome: { rotulo: 'Nome', placeholder: 'Buscar por nome...' },
  data: { rotulo: 'Data', placeholder: 'Selecionar data' },
  cliente: { rotulo: 'Cliente', placeholder: 'Buscar por cliente...' },
  status: { rotulo: 'Status', placeholder: 'Selecionar status' },
};

const TEXTOS_POR_FILTRO: Record<
  'todos' | 'nome' | 'cliente',
  (projeto: ProjetoLista) => string[]
> = {
  nome: (projeto) => [projeto.nome],
  cliente: (projeto) => [projeto.cliente?.nome ?? ''],
  todos: (projeto) => [
    projeto.nome,
    projeto.codigo,
    projeto.cliente?.nome ?? '',
    formatarPeriodo(projeto.dataInicio, projeto.dataFim),
    rotuloStatus(projeto.status),
  ],
};

function projetoNoDia(projeto: ProjetoLista, dia: string) {
  const inicio = paraInputData(projeto.dataInicio);
  const fim = paraInputData(projeto.dataFim);
  if (inicio && fim) return dia >= inicio && dia <= fim;
  return dia === inicio || dia === fim;
}

export function filtrarProjetos(
  projetos: ProjetoLista[],
  busca: string,
  filtro: CampoFiltro,
) {
  const termo = busca.trim();
  if (!termo) return projetos;
  if (filtro === 'status') return projetos.filter((projeto) => projeto.status === termo);
  if (filtro === 'data')
    return projetos.filter((projeto) => projetoNoDia(projeto, termo));

  const textosDe = TEXTOS_POR_FILTRO[filtro];
  const minusculo = termo.toLowerCase();
  return projetos.filter(
    (projeto) =>
      textosDe(projeto).some((texto) => texto.toLowerCase().includes(minusculo)) ||
      (filtro === 'todos' && projetoNoDia(projeto, termo)),
  );
}
