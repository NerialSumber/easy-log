'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Edit3, Minus, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { useExigirPermissao } from '@/lib/current-user';

type Categoria = 'MADEIRA' | 'QUIMICO' | 'EPI';
type Operacao = 'entrada' | 'saida';
type ItemEstoque = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: Categoria;
};
type Formulario = { nome: string; quantidade: string; unidade: string };
type FormularioEdicao = { nome: string; unidade: string };
type Movimento = { item: ItemEstoque; operacao: Operacao };

const ABAS: { id: Categoria; label: string; description: string }[] = [
  { id: 'MADEIRA', label: 'Madeira', description: 'Controle de materiais em m²' },
  { id: 'QUIMICO', label: 'Produtos químicos', description: 'Tintas, colas e thinners' },
  { id: 'EPI', label: 'EPIs', description: 'Equipamentos disponíveis' },
];
const UNIDADES = [
  'litros',
  'mililitros',
  'quilogramas',
  'gramas',
  'centímetros',
  'unidades',
];
const VAZIO: Formulario = { nome: '', quantidade: '', unidade: 'litros' };

function formatarQuantidade(quantidade: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(quantidade);
}

function unidadeDoItem(item: Pick<ItemEstoque, 'unidade' | 'categoria'>) {
  if (item.categoria === 'MADEIRA') return 'm²';
  if (item.categoria === 'EPI') return 'un.';
  return item.unidade;
}

function quantidadePrevista(item: ItemEstoque, operacao: Operacao, quantidade: number) {
  const atual =
    operacao === 'entrada' ? item.quantidade + quantidade : item.quantidade - quantidade;
  return Math.round(atual * 100) / 100;
}

export default function EstoquePage() {
  const { permitido } = useExigirPermissao('estoque');
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [aba, setAba] = useState<Categoria>('MADEIRA');
  const [busca, setBusca] = useState('');
  const [formulario, setFormulario] = useState<Formulario>(VAZIO);
  const [editando, setEditando] = useState<ItemEstoque | null>(null);
  const [formularioEdicao, setFormularioEdicao] = useState<FormularioEdicao>({
    nome: '',
    unidade: 'litros',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [movimento, setMovimento] = useState<Movimento | null>(null);
  const [quantidadeMovimento, setQuantidadeMovimento] = useState('1');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [movimentando, setMovimentando] = useState(false);

  useEffect(() => {
    if (!permitido) return;
    fetch('/api/estoque', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (res.ok && Array.isArray(data)) setItens(data as ItemEstoque[]);
      })
      .catch(() => setItens([]))
      .finally(() => setCarregando(false));
  }, [permitido]);

  const itensVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter(
      (item) =>
        item.categoria === aba && (!termo || item.nome.toLowerCase().includes(termo)),
    );
  }, [aba, busca, itens]);

  const abrirNovo = () => {
    setFormulario({
      ...VAZIO,
      unidade: aba === 'QUIMICO' ? 'litros' : aba === 'MADEIRA' ? 'm²' : 'unidades',
    });
    setModalAberto(true);
  };

  const abrirEdicao = (item: ItemEstoque) => {
    setEditando(item);
    setFormularioEdicao({ nome: item.nome, unidade: item.unidade });
  };

  const abrirMovimento = (item: ItemEstoque, operacao: Operacao) => {
    setMovimento({ item, operacao });
    setQuantidadeMovimento('1');
  };

  const fecharModal = () => {
    if (!salvando) setModalAberto(false);
  };

  const fecharEdicao = () => {
    if (!salvando) setEditando(null);
  };

  const fecharMovimento = () => {
    if (!movimentando) setMovimento(null);
  };

  const salvar = async (event: FormEvent) => {
    event.preventDefault();
    setSalvando(true);
    const dados = {
      nome: formulario.nome,
      quantidade: formulario.quantidade,
      unidade: aba === 'MADEIRA' ? 'm²' : aba === 'EPI' ? 'unidades' : formulario.unidade,
      categoria: aba,
    };
    try {
      const res = await fetch('/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const data = (await res.json()) as ItemEstoque | { error?: string };
      if (!res.ok) {
        alert(('error' in data && data.error) || 'Não foi possível salvar o item.');
        return;
      }
      setItens((atual) => [...atual, data as ItemEstoque]);
      setModalAberto(false);
    } catch {
      alert('Erro de conexão ao salvar o item.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicao = async (event: FormEvent) => {
    event.preventDefault();
    if (!editando) return;
    setSalvando(true);
    const unidade =
      editando.categoria === 'MADEIRA'
        ? 'm²'
        : editando.categoria === 'EPI'
          ? 'unidades'
          : formularioEdicao.unidade;
    try {
      const res = await fetch(`/api/estoque/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: formularioEdicao.nome, unidade }),
      });
      const data = (await res.json()) as ItemEstoque | { error?: string };
      if (!res.ok) {
        alert(('error' in data && data.error) || 'Não foi possível atualizar o item.');
        return;
      }
      setItens((atual) =>
        atual.map((item) => (item.id === editando.id ? (data as ItemEstoque) : item)),
      );
      setEditando(null);
    } catch {
      alert('Erro de conexão ao atualizar o item.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarMovimento = async (event: FormEvent) => {
    event.preventDefault();
    if (!movimento) return;
    const quantidade = Number(quantidadeMovimento);
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      alert('Informe uma quantidade maior que zero.');
      return;
    }
    setMovimentando(true);
    try {
      const res = await fetch(`/api/estoque/${movimento.item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operacao: movimento.operacao, quantidade }),
      });
      const data = (await res.json()) as ItemEstoque | { error?: string };
      if (!res.ok) {
        alert(('error' in data && data.error) || 'Não foi possível atualizar o estoque.');
        return;
      }
      setItens((atual) =>
        atual.map((item) =>
          item.id === movimento.item.id ? (data as ItemEstoque) : item,
        ),
      );
      setMovimento(null);
    } catch {
      alert('Erro de conexão ao atualizar o estoque.');
    } finally {
      setMovimentando(false);
    }
  };

  const excluir = async (item: ItemEstoque) => {
    if (!confirm(`Excluir ${item.nome} do estoque?`)) return;
    const res = await fetch(`/api/estoque/${item.id}`, { method: 'DELETE' });
    if (res.ok)
      setItens((atual) => atual.filter((atualItem) => atualItem.id !== item.id));
    else alert('Não foi possível excluir o item.');
  };

  const abaAtual = ABAS.find((item) => item.id === aba)!;
  const quantidadeInformada = Number(quantidadeMovimento);
  const quantidadeValida =
    Number.isFinite(quantidadeInformada) && quantidadeInformada > 0;
  const estoqueResultante =
    movimento && quantidadeValida
      ? quantidadePrevista(movimento.item, movimento.operacao, quantidadeInformada)
      : null;

  return (
    <AppShell
      active="estoque"
      header={
        <PageHeader
          title="Controle de estoque"
          subtitle="Registre entradas e saídas para manter o estoque alinhado ao físico."
          action={
            <button
              type="button"
              onClick={abrirNovo}
              className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              <Plus className="size-5" /> Novo item
            </button>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
          role="tablist"
          aria-label="Categorias do estoque"
        >
          {ABAS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={aba === item.id}
              onClick={() => {
                setAba(item.id);
                setBusca('');
              }}
              className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
                aba === item.id
                  ? 'border-accent bg-soft'
                  : 'border-line bg-surface hover:border-accent'
              }`}
            >
              <span
                className={`text-base font-bold ${aba === item.id ? 'text-accent' : 'text-ink'}`}
              >
                {item.label}
              </span>
              <span className="text-muted text-xs">{item.description}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-ink text-lg font-bold">{abaAtual.label}</h2>
            <p className="text-muted text-sm">
              {itens.filter((item) => item.categoria === aba).length} itens cadastrados
            </p>
          </div>
          <label className="border-line flex w-full max-w-sm items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="text-faint size-5 shrink-0" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="text-ink placeholder:text-faint w-full bg-transparent text-sm outline-none"
              placeholder={`Buscar em ${abaAtual.label.toLowerCase()}...`}
              aria-label="Buscar item"
            />
          </label>
        </div>

        <div className="border-line bg-surface overflow-hidden rounded-xl border">
          <table className="min-w-full">
            <thead className="bg-soft">
              <tr className="border-line border-b">
                <th className="text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase">
                  {aba === 'MADEIRA'
                    ? 'Tipo da madeira'
                    : aba === 'EPI'
                      ? 'EPI'
                      : 'Produto'}
                </th>
                <th className="text-muted px-6 py-3 text-right text-xs font-bold tracking-[0.72px] uppercase">
                  Quantidade disponível
                </th>
                <th className="w-28 px-6 py-3" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={3} className="text-muted px-6 py-10 text-center text-sm">
                    Carregando estoque...
                  </td>
                </tr>
              ) : itensVisiveis.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-muted px-6 py-10 text-center text-sm">
                    {busca
                      ? 'Nenhum item encontrado.'
                      : 'Nenhum item cadastrado nesta aba.'}
                  </td>
                </tr>
              ) : (
                itensVisiveis.map((item) => (
                  <tr key={item.id} className="border-line border-b last:border-0">
                    <td className="text-ink px-6 py-4 text-sm font-semibold">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirMovimento(item, 'saida')}
                          disabled={item.quantidade <= 0}
                          className="border-line text-muted hover:border-danger hover:bg-danger-soft hover:text-danger rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Registrar saída de ${item.nome}`}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="text-muted min-w-24 text-right text-sm">
                          {formatarQuantidade(item.quantidade)} {unidadeDoItem(item)}
                        </span>
                        <button
                          type="button"
                          onClick={() => abrirMovimento(item, 'entrada')}
                          className="border-line text-muted hover:border-accent hover:bg-soft hover:text-accent rounded-lg border p-1.5"
                          aria-label={`Registrar entrada de ${item.nome}`}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => abrirEdicao(item)}
                          className="text-muted hover:bg-soft hover:text-accent rounded-lg p-2"
                          aria-label={`Editar ${item.nome}`}
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => excluir(item)}
                          className="text-muted hover:bg-danger-soft hover:text-danger rounded-lg p-2"
                          aria-label={`Excluir ${item.nome}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <form
            onSubmit={salvar}
            className="bg-surface border-line w-full max-w-lg overflow-hidden rounded-xl border"
          >
            <div className="border-line flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-ink text-xl font-bold">Novo item</h2>
                <p className="text-muted text-sm">{abaAtual.label}</p>
              </div>
              <button
                type="button"
                onClick={fecharModal}
                className="text-muted hover:bg-soft rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                {aba === 'MADEIRA'
                  ? 'Tipo da madeira'
                  : aba === 'EPI'
                    ? 'Nome do EPI'
                    : 'Nome do produto'}
                <input
                  required
                  value={formulario.nome}
                  onChange={(event) =>
                    setFormulario({ ...formulario, nome: event.target.value })
                  }
                  className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                  placeholder={
                    aba === 'MADEIRA'
                      ? 'Ex.: Pinus'
                      : aba === 'EPI'
                        ? 'Ex.: Capacete'
                        : 'Ex.: Tinta esmalte'
                  }
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                  Quantidade
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={formulario.quantidade}
                    onChange={(event) =>
                      setFormulario({ ...formulario, quantidade: event.target.value })
                    }
                    className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                    placeholder="0"
                  />
                </label>
                {aba === 'QUIMICO' && (
                  <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                    Unidade de medida
                    <select
                      value={formulario.unidade}
                      onChange={(event) =>
                        setFormulario({ ...formulario, unidade: event.target.value })
                      }
                      className="border-line bg-surface focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                    >
                      {UNIDADES.map((unidade) => (
                        <option key={unidade}>{unidade}</option>
                      ))}
                    </select>
                  </label>
                )}
                {aba === 'MADEIRA' && (
                  <div className="text-muted flex items-end pb-2 text-sm">
                    A quantidade será registrada em metros quadrados (m²).
                  </div>
                )}
                {aba === 'EPI' && (
                  <div className="text-muted flex items-end pb-2 text-sm">
                    A quantidade representa unidades disponíveis.
                  </div>
                )}
              </div>
            </div>
            <div className="border-line bg-soft flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={fecharModal}
                className="border-line text-muted rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={salvando}
                type="submit"
                className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <Package className="size-4" />
                {salvando ? 'Salvando...' : 'Salvar item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <form
            onSubmit={salvarEdicao}
            className="bg-surface border-line w-full max-w-lg overflow-hidden rounded-xl border"
          >
            <div className="border-line flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-ink text-xl font-bold">Editar item</h2>
                <p className="text-muted text-sm">
                  Altere apenas o nome e a unidade. A quantidade fica no + e −.
                </p>
              </div>
              <button
                type="button"
                onClick={fecharEdicao}
                className="text-muted hover:bg-soft rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                {editando.categoria === 'MADEIRA'
                  ? 'Tipo da madeira'
                  : editando.categoria === 'EPI'
                    ? 'Nome do EPI'
                    : 'Nome do produto'}
                <input
                  required
                  value={formularioEdicao.nome}
                  onChange={(event) =>
                    setFormularioEdicao({ ...formularioEdicao, nome: event.target.value })
                  }
                  className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                />
              </label>
              {editando.categoria === 'QUIMICO' ? (
                <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                  Unidade de medida
                  <select
                    value={formularioEdicao.unidade}
                    onChange={(event) =>
                      setFormularioEdicao({
                        ...formularioEdicao,
                        unidade: event.target.value,
                      })
                    }
                    className="border-line bg-surface focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                  >
                    {(UNIDADES.includes(formularioEdicao.unidade)
                      ? UNIDADES
                      : [formularioEdicao.unidade, ...UNIDADES]
                    ).map((unidade) => (
                      <option key={unidade}>{unidade}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-muted text-sm">
                  {editando.categoria === 'MADEIRA'
                    ? 'A unidade permanece em metros quadrados (m²).'
                    : 'A unidade permanece em unidades.'}
                </p>
              )}
            </div>
            <div className="border-line bg-soft flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={fecharEdicao}
                className="border-line text-muted rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={salvando}
                type="submit"
                className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <Package className="size-4" />
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {movimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4">
          <form
            onSubmit={confirmarMovimento}
            className="bg-surface border-line w-full max-w-md overflow-hidden rounded-xl border"
          >
            <div className="border-line flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-ink text-xl font-bold">
                  {movimento.operacao === 'entrada'
                    ? 'Entrada de estoque'
                    : 'Saída de estoque'}
                </h2>
                <p className="text-muted text-sm">{movimento.item.nome}</p>
              </div>
              <button
                type="button"
                onClick={fecharMovimento}
                className="text-muted hover:bg-soft rounded-lg p-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <div className="bg-soft text-muted rounded-lg px-4 py-3 text-sm">
                Estoque atual:{' '}
                <span className="text-ink font-semibold">
                  {formatarQuantidade(movimento.item.quantidade)}{' '}
                  {unidadeDoItem(movimento.item)}
                </span>
              </div>
              <label className="text-ink flex flex-col gap-2 text-sm font-semibold">
                {movimento.operacao === 'entrada'
                  ? 'Quantidade que entrou'
                  : 'Quantidade que saiu'}
                <input
                  required
                  autoFocus
                  min="0.01"
                  step={movimento.item.categoria === 'EPI' ? '1' : '0.01'}
                  type="number"
                  value={quantidadeMovimento}
                  onChange={(event) => setQuantidadeMovimento(event.target.value)}
                  className="border-line focus:border-accent rounded-lg border px-3 py-2 font-normal outline-none"
                />
              </label>
              <p
                className={`text-sm ${estoqueResultante !== null && estoqueResultante < 0 ? 'text-danger' : 'text-muted'}`}
              >
                {estoqueResultante === null
                  ? movimento.operacao === 'entrada'
                    ? 'Informe a quantidade que entrou no estoque físico.'
                    : 'Informe a quantidade que saiu do estoque físico.'
                  : estoqueResultante < 0
                    ? 'A saída é maior do que a quantidade disponível.'
                    : `Novo estoque: ${formatarQuantidade(estoqueResultante)} ${unidadeDoItem(movimento.item)}`}
              </p>
            </div>
            <div className="border-line bg-soft flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={fecharMovimento}
                className="border-line text-muted rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={
                  movimentando || estoqueResultante === null || estoqueResultante < 0
                }
                type="submit"
                className="bg-accent-fill text-on-accent rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {movimentando
                  ? 'Atualizando...'
                  : movimento.operacao === 'entrada'
                    ? 'Confirmar entrada'
                    : 'Confirmar saída'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
