import { formatarTelefone, validarContato } from '@/lib/contato';

function texto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function lerFornecedor(corpo: unknown) {
  const dados = (corpo ?? {}) as Record<string, unknown>;
  const nome = texto(dados.nome);
  const telefone = formatarTelefone(texto(dados.telefone));
  const email = texto(dados.email);
  const endereco = texto(dados.endereco);
  const produto = Array.isArray(dados.produto)
    ? dados.produto.map(texto).filter(Boolean)
    : [];

  if (!nome) return { erro: 'O nome do fornecedor é obrigatório.' };
  const erro = validarContato(telefone, email);
  if (erro) return { erro };

  return {
    dados: {
      nome,
      telefone: telefone || null,
      email: email || null,
      endereco: endereco || null,
      produto,
    },
  };
}
