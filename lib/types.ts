export type StatusProjeto = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ATRASADO';

export type ClienteResumo = {
  id: string;
  nome: string;
};

export type FornecedorLista = {
  id: string;
  nome: string;
  contato: string | null;
};

export type ProjetoLista = {
  id: string;
  codigo: string;
  nome: string;
  qtdeMadeira: number;
  status: StatusProjeto;
  criadoEm: string;
  dataInicio: string | null;
  dataFim: string | null;
  clienteId: string | null;
  cliente: ClienteResumo | null;
};
