import { unidadeDoItem } from '@/lib/estoque';
import { formatarNumero } from '@/lib/formatos';
import { rotuloStatus } from '@/lib/status-projeto';
import type { Categoria, ItemEstoque, StatusProjeto } from '@/lib/types';

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

type Alerta = {
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
  meses: {
    chave: string;
    rotulo: string;
    madeira: number;
    iniciados: number;
    finalizados: number;
  }[];
  alertas: Alerta[];
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

const ROTULO_CATEGORIA: Record<Categoria, string> = {
  MADEIRA: 'Madeira',
  QUIMICO: 'Produto químico',
  EPI: 'EPI',
};

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100;
}

function paraData(valor: Date | string | null | undefined) {
  if (!valor) return null;
  const data = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function formatarDataCurta(data: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(data);
}

function chaveMes(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

function ultimosMeses(hoje: Date, quantidade: number) {
  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - (quantidade - 1 - indice),
      1,
    );
    return {
      chave: chaveMes(data),
      rotulo: new Intl.DateTimeFormat('pt-BR', { month: 'short' })
        .format(data)
        .replace('.', ''),
      madeira: 0,
      iniciados: 0,
      finalizados: 0,
    };
  });
}

function limiteEstoqueBaixo(item: ItemEstoque) {
  if (item.categoria !== 'QUIMICO') return 5;
  const unidade = item.unidade.trim().toLowerCase();
  if (unidade.startsWith('mililit') || unidade === 'ml') return 500;
  if (unidade === 'gramas' || unidade === 'g') return 500;
  if (unidade.startsWith('cent')) return 100;
  return 2;
}

function estaAtrasado(projeto: ProjetoDashboard, hoje: Date) {
  if (projeto.status === 'CONCLUIDO') return false;
  if (projeto.status === 'ATRASADO') return true;
  const fim = paraData(projeto.dataFim);
  return fim ? inicioDoDia(fim) < hoje : false;
}

function entregaProxima(projeto: ProjetoDashboard, hoje: Date, limite: Date) {
  if (projeto.status === 'CONCLUIDO' || estaAtrasado(projeto, hoje)) return false;
  const fim = paraData(projeto.dataFim);
  if (!fim) return false;
  const dia = inicioDoDia(fim);
  return dia >= hoje && dia <= limite;
}

function alertasDeMadeira(ativos: ProjetoDashboard[], madeiraEstoque: number) {
  const folgaMinima = Math.max(5, arredondar(madeiraEstoque * 0.1));
  const fila = ativos
    .filter((projeto) => projeto.qtdeMadeira > 0)
    .sort((a, b) => {
      const fimA = paraData(a.dataFim)?.getTime() ?? Infinity;
      const fimB = paraData(b.dataFim)?.getTime() ?? Infinity;
      return fimA - fimB || a.nome.localeCompare(b.nome, 'pt-BR');
    });

  const alertas: Alerta[] = [];
  let restante = madeiraEstoque;
  let avisou = false;

  for (const projeto of fila) {
    if (restante < projeto.qtdeMadeira) {
      const falta = arredondar(projeto.qtdeMadeira - Math.max(restante, 0));
      alertas.push({
        id: `madeira-${projeto.id}`,
        nivel: 'critico',
        titulo: `Não há madeira suficiente para completar o projeto ${projeto.nome}.`,
        detalhe: `Faltam ${formatarNumero(falta)} m².`,
        href: '/estoque',
      });
      restante = 0;
      avisou = true;
      continue;
    }

    restante = arredondar(restante - projeto.qtdeMadeira);
    if (!avisou && restante <= folgaMinima) {
      alertas.push({
        id: `madeira-${projeto.id}`,
        nivel: 'atencao',
        titulo: `Pouca madeira para completar o projeto ${projeto.nome}.`,
        detalhe:
          restante === 0
            ? 'Não sobra madeira no estoque depois deste projeto.'
            : `Sobram ${formatarNumero(restante)} m² no estoque.`,
        href: '/estoque',
      });
      avisou = true;
    }
  }

  return alertas;
}

export function montarDashboard(
  projetos: ProjetoDashboard[],
  estoque: ItemEstoque[] | null,
  agora = new Date(),
): DashboardDados {
  const hoje = inicioDoDia(agora);
  const limiteEntrega = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7);
  const ativos = projetos.filter((projeto) => projeto.status !== 'CONCLUIDO');
  const atrasados = projetos.filter((projeto) => estaAtrasado(projeto, hoje));
  const entregas = projetos.filter((projeto) =>
    entregaProxima(projeto, hoje, limiteEntrega),
  );
  const madeiraAtiva = arredondar(
    ativos.reduce((total, projeto) => total + (projeto.qtdeMadeira || 0), 0),
  );

  const porStatus = STATUS_ORDEM.map((status) => ({
    status,
    rotulo: rotuloStatus(status),
    quantidade: projetos.filter((projeto) => projeto.status === status).length,
    cor: COR_STATUS[status],
  }));

  const meses = ultimosMeses(hoje, 6);
  const mesPorChave = new Map(meses.map((mes) => [mes.chave, mes]));
  for (const projeto of projetos) {
    const inicio = paraData(projeto.dataInicio) ?? paraData(projeto.criadoEm);
    const mesInicio = inicio && mesPorChave.get(chaveMes(inicio));
    if (mesInicio) {
      mesInicio.madeira += projeto.qtdeMadeira || 0;
      mesInicio.iniciados += 1;
    }

    const fim = paraData(projeto.dataFim);
    const mesFim =
      projeto.status === 'CONCLUIDO' && fim && mesPorChave.get(chaveMes(fim));
    if (mesFim) mesFim.finalizados += 1;
  }
  for (const mes of meses) mes.madeira = arredondar(mes.madeira);

  const itensZerados = estoque?.filter((item) => item.quantidade <= 0) ?? [];
  const itensBaixos =
    estoque?.filter(
      (item) => item.quantidade > 0 && item.quantidade <= limiteEstoqueBaixo(item),
    ) ?? [];
  const madeiraEstoque =
    estoque === null
      ? null
      : arredondar(
          estoque
            .filter((item) => item.categoria === 'MADEIRA')
            .reduce((total, item) => total + item.quantidade, 0),
        );
  const alertasMadeira =
    madeiraEstoque === null ? [] : alertasDeMadeira(ativos, madeiraEstoque);

  const alertas: Alerta[] = [];

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

  alertas.push(...alertasMadeira.filter((alerta) => alerta.nivel === 'critico'));

  for (const item of itensZerados) {
    alertas.push({
      id: `estoque-${item.id}`,
      nivel: 'critico',
      titulo: `O item ${item.nome} está sem estoque.`,
      detalhe: ROTULO_CATEGORIA[item.categoria],
      href: '/estoque',
    });
  }

  alertas.push(...alertasMadeira.filter((alerta) => alerta.nivel === 'atencao'));

  for (const item of itensBaixos) {
    alertas.push({
      id: `estoque-baixo-${item.id}`,
      nivel: 'atencao',
      titulo: `O item ${item.nome} está com estoque baixo.`,
      detalhe: `Restam ${formatarNumero(item.quantidade)} ${unidadeDoItem(item).replace(/\.$/, '')}.`,
      href: '/estoque',
    });
  }

  for (const projeto of entregas) {
    const fim = paraData(projeto.dataFim);
    alertas.push({
      id: `entrega-${projeto.id}`,
      nivel: 'atencao',
      titulo: fim
        ? `O projeto ${projeto.nome} deve ser entregue até ${formatarDataCurta(fim)}.`
        : `O projeto ${projeto.nome} deve ser entregue nesta semana.`,
      detalhe: projeto.clienteNome ? `Cliente ${projeto.clienteNome}.` : '',
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

  let nivelEstoque: DashboardDados['resumo']['nivelEstoque'] = null;
  if (estoque !== null) {
    if (itensZerados.length > 0 || alertasMadeira.some((a) => a.nivel === 'critico')) {
      nivelEstoque = 'critico';
    } else if (itensBaixos.length > 0 || alertasMadeira.length > 0) {
      nivelEstoque = 'atencao';
    } else {
      nivelEstoque = 'ok';
    }
  }

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
      nivelEstoque,
    },
    porStatus,
    meses,
    alertas,
    recentes,
  };
}
