type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function requisitar<T>(
  url: string,
  metodo: Metodo = 'GET',
  corpo?: unknown,
) {
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: metodo,
      cache: 'no-store',
      headers: corpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error('Erro de conexão. Tente novamente.');
  }

  const dados = (await resposta.json().catch(() => null)) as { error?: string } | null;
  if (!resposta.ok) {
    throw new Error(dados?.error || 'Não foi possível concluir a ação.');
  }
  return dados as T;
}

export async function buscarLista<T>(url: string) {
  try {
    const dados = await requisitar<unknown>(url);
    return Array.isArray(dados) ? (dados as T[]) : [];
  } catch {
    return [];
  }
}

export function mensagemDeErro(erro: unknown) {
  return erro instanceof Error ? erro.message : 'Não foi possível concluir a ação.';
}
