export type Role = 'ADMIN' | 'PROJETISTA';
export type Area = 'dashboard' | 'projetos' | 'estoque' | 'fornecedores' | 'usuarios';
export type Acao = 'ver' | 'escrever';

export function rotuloRole(role: Role) {
  return role === 'ADMIN' ? 'Administrador' : 'Projetista';
}

export function pode(role: Role | '', area: Area, acao: Acao = 'ver') {
  if (role === 'ADMIN') return true;
  if (role !== 'PROJETISTA') return false;
  if (area === 'estoque' || area === 'usuarios') return false;
  if (area === 'projetos') return true;
  return acao === 'ver';
}
