import type { StatusProjeto } from '@/lib/types';

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
      return 'bg-[#d9f0de] text-[#218c21]';
    case 'EM_ANDAMENTO':
      return 'bg-[#d9e8ff] text-[#1a59bf]';
    case 'ATRASADO':
      return 'bg-[#ffe0e0] text-[#cc2626]';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export function classesStatusModal(status: StatusProjeto) {
  switch (status) {
    case 'CONCLUIDO':
      return 'bg-[#d9f0de] text-[#218c21]';
    case 'EM_ANDAMENTO':
      return 'bg-[#fff7ed] text-[#c2410c]';
    case 'ATRASADO':
      return 'bg-[#ffe0e0] text-[#cc2626]';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}
