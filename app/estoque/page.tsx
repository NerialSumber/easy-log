'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Edit3, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';

type Categoria = 'MADEIRA' | 'QUIMICO' | 'EPI';
type ItemEstoque = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: Categoria;
};
type Formulario = { nome: string; quantidade: string; unidade: string };

const ABAS: { id: Categoria; label: string; description: string }[] = [
  { id: 'MADEIRA', label: 'Madeira', description: 'Controle de materiais em m²' },
  { id: 'QUIMICO', label: 'Produtos químicos', description: 'Tintas, colas e thinners' },
  { id: 'EPI', label: 'EPIs', description: 'Equipamentos disponíveis' },
];
const UNIDADES = ['litros', 'mililitros', 'quilogramas', 'gramas', 'centímetros', 'unidades'];
const VAZIO: Formulario = { nome: '', quantidade: '', unidade: 'litros' };

function formatarQuantidade(quantidade: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(quantidade);
}

export default function EstoquePage() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [aba, setAba] = useState<Categoria>('MADEIRA');
  const [busca, setBusca] = useState('');
  const [formulario, setFormulario] = useState<Formulario>(VAZIO);
  const [editando, setEditando] = useState<ItemEstoque | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch('/api/estoque', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (res.ok && Array.isArray(data)) setItens(data as ItemEstoque[]);
      })
      .catch(() => setItens([]))
      .finally(() => setCarregando(false));
  }, []);

  const itensVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter((item) =>
      item.categoria === aba && (!termo || item.nome.toLowerCase().includes(termo)),
    );
  }, [aba, busca, itens]);

  const abrirNovo = () => {
    setEditando(null);
    setFormulario({ ...VAZIO, unidade: aba === 'QUIMICO' ? 'litros' : aba === 'MADEIRA' ? 'm²' : 'unidades' });
    setModalAberto(true);
  };

  const abrirEdicao = (item: ItemEstoque) => {
    setEditando(item);
    setFormulario({ nome: item.nome, quantidade: String(item.quantidade), unidade: item.unidade });
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (!salvando) setModalAberto(false);
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
      const res = await fetch(editando ? `/api/estoque/${editando.id}` : '/api/estoque', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const data = (await res.json()) as ItemEstoque | { error?: string };
      if (!res.ok) {
        alert(('error' in data && data.error) || 'Não foi possível salvar o item.');
        return;
      }
      setItens((atual) => editando ? atual.map((item) => item.id === editando.id ? data as ItemEstoque : item) : [...atual, data as ItemEstoque]);
      setModalAberto(false);
    } catch {
      alert('Erro de conexão ao salvar o item.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (item: ItemEstoque) => {
    if (!confirm(`Excluir ${item.nome} do estoque?`)) return;
    const res = await fetch(`/api/estoque/${item.id}`, { method: 'DELETE' });
    if (res.ok) setItens((atual) => atual.filter((atualItem) => atualItem.id !== item.id));
    else alert('Não foi possível excluir o item.');
  };

  const abaAtual = ABAS.find((item) => item.id === aba)!;

  return (
    <AppShell
      active="estoque"
      header={<PageHeader title="Controle de estoque" subtitle="Acompanhe materiais, produtos e equipamentos disponíveis." action={<button type="button" onClick={abrirNovo} className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c2410c]"><Plus className="size-5" /> Novo item</button>} />}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3" role="tablist" aria-label="Categorias do estoque">
          {ABAS.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={aba === item.id} onClick={() => { setAba(item.id); setBusca(''); }} className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${aba === item.id ? 'border-[#ea580c] bg-[#fff7ed]' : 'border-[#e2e8f0] bg-white hover:border-[#fdba74]'}`}>
              <span className={`text-base font-bold ${aba === item.id ? 'text-[#c2410c]' : 'text-[#334155]'}`}>{item.label}</span>
              <span className="text-xs text-[#64748b]">{item.description}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-[#1e293b]">{abaAtual.label}</h2><p className="text-sm text-[#64748b]">{itens.filter((item) => item.categoria === aba).length} itens cadastrados</p></div>
          <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 py-2"><Search className="size-5 shrink-0 text-[#94a3b8]" /><input value={busca} onChange={(event) => setBusca(event.target.value)} className="w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]" placeholder={`Buscar em ${abaAtual.label.toLowerCase()}...`} aria-label="Buscar item" /></label>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          <table className="min-w-full">
            <thead className="bg-[#f8fafc]"><tr className="border-b border-[#e2e8f0]"><th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.72px] text-[#64748b]">{aba === 'MADEIRA' ? 'Tipo da madeira' : aba === 'EPI' ? 'EPI' : 'Produto'}</th><th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-[0.72px] text-[#64748b]">Quantidade disponível</th><th className="w-28 px-6 py-3" aria-label="Ações" /></tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-[#64748b]">Carregando estoque...</td></tr> : itensVisiveis.length === 0 ? <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-[#64748b]">{busca ? 'Nenhum item encontrado.' : 'Nenhum item cadastrado nesta aba.'}</td></tr> : itensVisiveis.map((item) => <tr key={item.id} className="border-b border-[#e2e8f0] last:border-0"><td className="px-6 py-4 text-sm font-semibold text-[#0f172a]">{item.nome}</td><td className="px-6 py-4 text-right text-sm text-[#475569]">{formatarQuantidade(item.quantidade)} {aba === 'MADEIRA' ? 'm²' : aba === 'EPI' ? '' : item.unidade}</td><td className="px-6 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => abrirEdicao(item)} className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ea580c]" aria-label={`Editar ${item.nome}`}><Edit3 className="size-4" /></button><button type="button" onClick={() => excluir(item)} className="rounded-lg p-2 text-[#64748b] hover:bg-red-50 hover:text-red-600" aria-label={`Excluir ${item.nome}`}><Trash2 className="size-4" /></button></div></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4"><form onSubmit={salvar} className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4"><div><h2 className="text-xl font-bold text-[#1e293b]">{editando ? 'Editar item' : 'Novo item'}</h2><p className="text-sm text-[#64748b]">{abaAtual.label}</p></div><button type="button" onClick={fecharModal} className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9]" aria-label="Fechar"><X className="size-5" /></button></div><div className="flex flex-col gap-5 p-6"><label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">{aba === 'MADEIRA' ? 'Tipo da madeira' : aba === 'EPI' ? 'Nome do EPI' : 'Nome do produto'}<input required value={formulario.nome} onChange={(event) => setFormulario({ ...formulario, nome: event.target.value })} className="rounded-lg border border-[#cbd5e1] px-3 py-2 font-normal outline-none focus:border-[#ea580c]" placeholder={aba === 'MADEIRA' ? 'Ex.: Pinus' : aba === 'EPI' ? 'Ex.: Capacete' : 'Ex.: Tinta esmalte'} /></label><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">Quantidade<input required min="0" step="0.01" type="number" value={formulario.quantidade} onChange={(event) => setFormulario({ ...formulario, quantidade: event.target.value })} className="rounded-lg border border-[#cbd5e1] px-3 py-2 font-normal outline-none focus:border-[#ea580c]" placeholder="0" /></label>{aba === 'QUIMICO' && <label className="flex flex-col gap-2 text-sm font-semibold text-[#334155]">Unidade de medida<select value={formulario.unidade} onChange={(event) => setFormulario({ ...formulario, unidade: event.target.value })} className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 font-normal outline-none focus:border-[#ea580c]">{UNIDADES.map((unidade) => <option key={unidade}>{unidade}</option>)}</select></label>}{aba === 'MADEIRA' && <div className="flex items-end pb-2 text-sm text-[#64748b]">A quantidade será registrada em metros quadrados (m²).</div>}{aba === 'EPI' && <div className="flex items-end pb-2 text-sm text-[#64748b]">A quantidade representa unidades disponíveis.</div>}</div></div><div className="flex justify-end gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4"><button type="button" onClick={fecharModal} className="rounded-lg border border-[#cbd5e1] px-4 py-2 text-sm font-semibold text-[#475569]">Cancelar</button><button disabled={salvando} type="submit" className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Package className="size-4" />{salvando ? 'Salvando...' : 'Salvar item'}</button></div></form></div>}
    </AppShell>
  );
}
