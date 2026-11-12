import type { StatusProjeto } from '@/lib/types';

const ROTULOS: Record<StatusProjeto, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Finalizado',
  ATRASADO: 'Atrasado',
};

const CLASSES: Record<StatusProjeto, string> = {
  ABERTO: 'bg-soft text-faint',
  EM_ANDAMENTO: 'bg-ink text-canvas',
  CONCLUIDO: 'bg-soft text-muted',
  ATRASADO: 'bg-danger-soft text-danger',
};

export const TODOS_STATUS = Object.keys(ROTULOS) as StatusProjeto[];

export function rotuloStatus(status: StatusProjeto) {
  return ROTULOS[status];
}

export function classesStatus(status: StatusProjeto) {
  return CLASSES[status];
}

function paraDia(valor: Date | string | null | undefined) {
  if (!valor) return null;
  const data =
    typeof valor === 'string' && valor.trim().length === 10
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
  if (!inicio || !fim || !hoje || hoje < inicio) return 'ABERTO';
  if (hoje > fim) return 'ATRASADO';
  return 'EM_ANDAMENTO';
}

export function statusVisivel(
  status: string | null | undefined,
  dataInicio: Date | string | null | undefined,
  dataFim: Date | string | null | undefined,
): StatusProjeto {
  if (status === 'CONCLUIDO') return 'CONCLUIDO';
  return statusPorPeriodo(dataInicio, dataFim);
}
