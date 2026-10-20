import type { StatusProjeto } from '@/lib/types';

function paraDia(valor: Date | string | null | undefined) {
  if (!valor) return null;

  const data =
    valor instanceof Date
      ? valor
      : valor.trim().length === 10
        ? new Date(`${valor.trim()}T00:00:00`)
        : new Date(valor);
  if (Number.isNaN(data.getTime())) return null;

  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function statusPorPeriodo(
  dataInicio: Date | string | null | undefined,
  dataFim: Date | string | null | undefined,
  agora = new Date(),
): StatusProjeto {
  const inicio = paraDia(dataInicio);
  const fim = paraDia(dataFim);
  const hoje = paraDia(agora);
  if (!inicio || !fim || !hoje) return 'ABERTO';
  if (hoje < inicio) return 'ABERTO';
  if (hoje > fim) return 'ATRASADO';
  return 'EM_ANDAMENTO';
}

export function statusVisivel(
  status: string | null | undefined,
  dataInicio: Date | string | null | undefined,
  dataFim: Date | string | null | undefined,
  agora = new Date(),
): StatusProjeto {
  if (status === 'CONCLUIDO') return 'CONCLUIDO';
  return statusPorPeriodo(dataInicio, dataFim, agora);
}

export function rotuloStatus(status: StatusProjeto) {
  switch (status) {
    case 'CONCLUIDO':
      return 'Finalizado';
    case 'EM_ANDAMENTO':
      return 'Em Andamento';
    case 'ATRASADO':
      return 'Atrasado';
    default:
      return 'Aberto';
  }
}

export function classesStatusTabela(status: StatusProjeto) {
  switch (status) {
    case 'CONCLUIDO':
      return 'bg-soft text-muted';
    case 'EM_ANDAMENTO':
      return 'bg-ink text-canvas';
    case 'ATRASADO':
      return 'bg-danger-soft text-danger';
    default:
      return 'bg-soft text-faint';
  }
}

export function classesStatusModal(status: StatusProjeto) {
  return classesStatusTabela(status);
}
