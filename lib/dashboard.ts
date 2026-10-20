import { rotuloStatus } from '@/lib/status-projeto';
import type { StatusProjeto } from '@/lib/types';

export type ProjetoDashboard = {
  id: string;
  codigo: string;
  nome: string;
  qtdeMadeira: number;
  status: StatusProjeto;
  criadoEm: Date | string;
  dataInicio: Date | string | null;
  dataFim: Date | string | null;
  clienteNome: string | null;
};

export type ItemEstoqueDashboard = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: 'MADEIRA' | 'QUIMICO' | 'EPI';
};

export type AlertaDashboard = {
  id: string;
  nivel: 'critico' | 'atencao';
  titulo: string;
  detalhe: string;
  href: string;
};

export type DashboardDados = {
  podeVerEstoque: boolean;
  resumo: {
    ativos: number;
    emAndamento: number;
    abertos: number;
    atrasados: number;
    entregasProximas: number;
    madeiraAtiva: number;
    madeiraEstoque: number | null;
    alertasEstoque: number | null;
    nivelEstoque: 'ok' | 'atencao' | 'critico' | null;
  };
  porStatus: { status: StatusProjeto; rotulo: string; quantidade: number; cor: string }[];
  madeiraPorMes: { chave: string; rotulo: string; madeira: number; projetos: number }[];
  projetosPorMes: {
    chave: string;
    rotulo: string;
    iniciados: number;
    finalizados: number;
  }[];
  maisFeitos: { nome: string; quantidade: number }[];
  alertas: AlertaDashboard[];
  totalAlertas: number;
  recentes: {
    id: string;
    codigo: string;
    nome: string;
    status: StatusProjeto;
    clienteNome: string | null;
    criadoEm: string;
  }[];
};

const STATUS_ORDEM: StatusProjeto[] = ['EM_ANDAMENTO', 'ABERTO', 'ATRASADO', 'CONCLUIDO'];

const COR_STATUS: Record<StatusProjeto, string> = {
  EM_ANDAMENTO: 'var(--ink)',
  ABERTO: 'var(--faint)',
  ATRASADO: 'var(--accent)',
  CONCLUIDO: 'var(--muted)',
};

const ROTULO_CATEGORIA: Record<ItemEstoqueDashboard['categoria'], string> = {
  MADEIRA: 'Madeira',
  QUIMICO: 'Produto químico',
  EPI: 'EPI',
};

function limiteEstoqueBaixo(item: ItemEstoqueDashboard) {
  if (item.categoria === 'MADEIRA') return 5;
  if (item.categoria === 'EPI') return 5;

  const unidade = item.unidade.trim().toLowerCase();
  if (unidade.startsWith('mililit') || unidade === 'ml') return 500;
  if (unidade === 'gramas' || unidade === 'g') return 500;
  if (unidade.startsWith('cent')) return 100;
  return 2;
}

function unidadeExibida(item: ItemEstoqueDashboard) {
  if (item.categoria === 'MADEIRA') return 'm²';
  if (item.categoria === 'EPI') return 'un.';
  return item.unidade;
}

function alertasDeMadeira(
  ativos: ProjetoDashboard[],
  madeiraEstoque: number,
  limiteFolga: number,
) {
  const fila = ativos
    .filter((projeto) => projeto.qtdeMadeira > 0)
    .sort((a, b) => {
      const fimA = paraData(a.dataFim)?.getTime() ?? Number.POSITIVE_INFINITY;
      const fimB = paraData(b.dataFim)?.getTime() ?? Number.POSITIVE_INFINITY;
      return fimA - fimB || a.nome.localeCompare(b.nome, 'pt-BR');
    });

  const alertas: AlertaDashboard[] = [];
  let restante = madeiraEstoque;
  let avisouFolga = false;

  for (const projeto of fila) {
    if (restante < projeto.qtdeMadeira) {
      const falta = Math.round((projeto.qtdeMadeira - Math.max(restante, 0)) * 100) / 100;
      alertas.push({
        id: `madeira-${projeto.id}`,
        nivel: 'critico',
        titulo: `Não há madeira suficiente para completar o projeto ${projeto.nome}.`,
        detalhe: `Faltam ${formatarMadeira(falta)} m².`,
        href: '/estoque',
      });
      restante = 0;
      avisouFolga = true;
      continue;
    }

    restante = Math.round((restante - projeto.qtdeMadeira) * 100) / 100;
    if (!avisouFolga && restante <= limiteFolga) {
      alertas.push({
        id: `madeira-${projeto.id}`,
        nivel: 'atencao',
        titulo: `Pouca madeira para completar o projeto ${projeto.nome}.`,
        detalhe:
          restante === 0
            ? 'Não sobra madeira no estoque depois deste projeto.'
            : `Sobram ${formatarMadeira(restante)} m² no estoque.`,
        href: '/estoque',
      });
      avisouFolga = true;
    }
  }

  return alertas;
}

function paraData(valor: Date | string | null | undefined) {
  if (!valor) return null;
  const data = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function somarDias(data: Date, dias: number) {
  const copia = new Date(data);
  copia.setDate(copia.getDate() + dias);
  return inicioDoDia(copia);
}

function formatarDataCurta(data: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(data);
}

function formatarMadeira(valor: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor);
}

function estaAtrasado(projeto: ProjetoDashboard, hoje: Date) {
  if (projeto.status === 'CONCLUIDO') return false;
  if (projeto.status === 'ATRASADO') return true;
  const fim = paraData(projeto.dataFim);
  if (!fim) return false;
  return inicioDoDia(fim).getTime() < hoje.getTime();
}

function entregaProxima(projeto: ProjetoDashboard, hoje: Date, limite: Date) {
  if (projeto.status === 'CONCLUIDO' || estaAtrasado(projeto, hoje)) return false;
  const fim = paraData(projeto.dataFim);
  if (!fim) return false;
  const dia = inicioDoDia(fim).getTime();
  return dia >= hoje.getTime() && dia <= limite.getTime();
}

function mesesRecentes(hoje: Date, quantidade: number) {
  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - (quantidade - 1 - indice),
      1,
    );
    const chave = chaveMes(data);
    return { chave, rotulo: rotuloMes(data), madeira: 0, projetos: 0 };
  });
}

function chaveMes(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

function rotuloMes(data: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(data)
    .replace('.', '');
}

export function montarDashboard(
  projetos: ProjetoDashboard[],
  estoque: ItemEstoqueDashboard[] | null,
  agora = new Date(),
): DashboardDados {
  const hoje = inicioDoDia(agora);
  const limiteEntrega = somarDias(hoje, 7);
  const atrasados = projetos.filter((projeto) => estaAtrasado(projeto, hoje));
  const entregas = projetos.filter((projeto) =>
    entregaProxima(projeto, hoje, limiteEntrega),
  );
  const ativos = projetos.filter((projeto) => projeto.status !== 'CONCLUIDO');
  const madeiraAtiva =
    Math.round(
      ativos.reduce((total, projeto) => total + (projeto.qtdeMadeira || 0), 0) * 100,
    ) / 100;

  const porStatus = STATUS_ORDEM.map((status) => ({
    status,
    rotulo: rotuloStatus(status),
    quantidade: projetos.filter((projeto) => projeto.status === status).length,
    cor: COR_STATUS[status],
  }));

  const madeiraPorMes = mesesRecentes(hoje, 6);
  const projetosPorMes = madeiraPorMes.map((mes) => ({
    chave: mes.chave,
    rotulo: mes.rotulo,
    iniciados: 0,
    finalizados: 0,
  }));
  const indiceMes = new Map(madeiraPorMes.map((mes, indice) => [mes.chave, indice]));
  for (const projeto of projetos) {
    const referencia = paraData(projeto.dataInicio) ?? paraData(projeto.criadoEm);
    if (referencia) {
      const indice = indiceMes.get(chaveMes(referencia));
      if (indice !== undefined) {
        madeiraPorMes[indice].madeira += projeto.qtdeMadeira || 0;
        madeiraPorMes[indice].projetos += 1;
        projetosPorMes[indice].iniciados += 1;
      }
    }

    const fim = paraData(projeto.dataFim);
    if (projeto.status === 'CONCLUIDO' && fim) {
      const indiceFim = indiceMes.get(chaveMes(fim));
      if (indiceFim !== undefined) projetosPorMes[indiceFim].finalizados += 1;
    }
  }
  for (const mes of madeiraPorMes) {
    mes.madeira = Math.round(mes.madeira * 100) / 100;
  }

  const contagem = new Map<string, { nome: string; quantidade: number }>();
  for (const projeto of projetos) {
    const nome = projeto.nome.trim();
    const chave = nome.toLowerCase();
    if (!chave) continue;
    const atual = contagem.get(chave);
    if (atual) atual.quantidade += 1;
    else contagem.set(chave, { nome, quantidade: 1 });
  }
  const maisFeitos = [...contagem.values()]
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'))
    .slice(0, 5);

  const itensZerados = estoque?.filter((item) => item.quantidade <= 0) ?? [];
  const itensBaixos =
    estoque?.filter((item) => {
      if (item.quantidade <= 0) return false;
      return item.quantidade <= limiteEstoqueBaixo(item);
    }) ?? [];
  const madeiraEstoque =
    estoque === null
      ? null
      : Math.round(
          estoque
            .filter((item) => item.categoria === 'MADEIRA')
            .reduce((total, item) => total + item.quantidade, 0) * 100,
        ) / 100;
  const limiteFolga =
    madeiraEstoque === null
      ? 0
      : Math.max(5, Math.round(madeiraEstoque * 0.1 * 100) / 100);
  const alertasMadeira =
    madeiraEstoque === null ? [] : alertasDeMadeira(ativos, madeiraEstoque, limiteFolga);

  const alertas: AlertaDashboard[] = [];

  for (const projeto of atrasados) {
    const fim = paraData(projeto.dataFim);
    const cliente = projeto.clienteNome ? ` Cliente ${projeto.clienteNome}.` : '';
    alertas.push({
      id: `atraso-${projeto.id}`,
      nivel: 'critico',
      titulo: `O projeto ${projeto.nome} está atrasado.`,
      detalhe: fim
        ? `O prazo venceu em ${formatarDataCurta(fim)}.${cliente}`
        : `O prazo deste projeto já passou.${cliente}`,
      href: '/projetos',
    });
  }

  for (const alerta of alertasMadeira) {
    if (alerta.nivel === 'critico') alertas.push(alerta);
  }

  for (const item of itensZerados) {
    alertas.push({
      id: `estoque-${item.id}`,
      nivel: 'critico',
      titulo: `O item ${item.nome} está sem estoque.`,
      detalhe: ROTULO_CATEGORIA[item.categoria],
      href: '/estoque',
    });
  }

  for (const alerta of alertasMadeira) {
    if (alerta.nivel === 'atencao') alertas.push(alerta);
  }

  for (const item of itensBaixos) {
    alertas.push({
      id: `estoque-baixo-${item.id}`,
      nivel: 'atencao',
      titulo: `O item ${item.nome} está com estoque baixo.`,
      detalhe: `Restam ${formatarMadeira(item.quantidade)} ${unidadeExibida(item).replace(/\.$/, '')}.`,
      href: '/estoque',
    });
  }

  for (const projeto of entregas) {
    const fim = paraData(projeto.dataFim);
    const cliente = projeto.clienteNome ? ` Cliente ${projeto.clienteNome}.` : '';
    alertas.push({
      id: `entrega-${projeto.id}`,
      nivel: 'atencao',
      titulo: fim
        ? `O projeto ${projeto.nome} deve ser entregue até ${formatarDataCurta(fim)}.`
        : `O projeto ${projeto.nome} deve ser entregue nesta semana.`,
      detalhe: cliente.trim(),
      href: '/projetos',
    });
  }

  const recentes = [...projetos]
    .sort(
      (a, b) =>
        (paraData(b.criadoEm)?.getTime() ?? 0) - (paraData(a.criadoEm)?.getTime() ?? 0),
    )
    .slice(0, 5)
    .map((projeto) => ({
      id: projeto.id,
      codigo: projeto.codigo,
      nome: projeto.nome,
      status: projeto.status,
      clienteNome: projeto.clienteNome,
      criadoEm: (paraData(projeto.criadoEm) ?? agora).toISOString(),
    }));

  return {
    podeVerEstoque: estoque !== null,
    resumo: {
      ativos: ativos.length,
      emAndamento: projetos.filter((projeto) => projeto.status === 'EM_ANDAMENTO').length,
      abertos: projetos.filter((projeto) => projeto.status === 'ABERTO').length,
      atrasados: atrasados.length,
      entregasProximas: entregas.length,
      madeiraAtiva,
      madeiraEstoque,
      alertasEstoque:
        estoque === null
          ? null
          : itensZerados.length + itensBaixos.length + alertasMadeira.length,
      nivelEstoque:
        estoque === null
          ? null
          : itensZerados.length > 0 ||
              alertasMadeira.some((alerta) => alerta.nivel === 'critico')
            ? 'critico'
            : itensBaixos.length > 0 || alertasMadeira.length > 0
              ? 'atencao'
              : 'ok',
    },
    porStatus,
    madeiraPorMes,
    projetosPorMes,
    maisFeitos,
    alertas,
    totalAlertas: alertas.length,
    recentes,
  };
}
