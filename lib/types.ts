export type StatusProjeto = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export type ClienteResumo = {
  id: string;
  nome: string;
};

export type ProjetoLista = {
  id: string;
  codigo: string;
  nome: string;
  qtdeMadeira: number;
  status: StatusProjeto;
  criadoEm: string;
  clienteId: string | null;
  cliente: ClienteResumo | null;
};
