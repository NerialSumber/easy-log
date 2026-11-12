import type { Role } from '@/lib/permissoes';

export type StatusProjeto = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ATRASADO';

export type Categoria = 'MADEIRA' | 'QUIMICO' | 'EPI';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  roleLabel: string;
};

export type ClienteResumo = {
  id: string;
  nome: string;
};

export type FornecedorLista = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  produto: string[];
};

export type MadeiraOpcao = {
  id: string;
  nome: string;
  quantidade: number;
};

export type ProjetoLista = {
  id: string;
  codigo: string;
  nome: string;
  qtdeMadeira: number;
  madeiraId: string | null;
  madeira: { id: string; nome: string } | null;
  status: StatusProjeto;
  criadoEm: string;
  dataInicio: string | null;
  dataFim: string | null;
  clienteId: string | null;
  cliente: ClienteResumo | null;
};

export type ItemEstoque = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: Categoria;
};
