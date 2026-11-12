'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Abas } from '@/components/abas';
import { AppShell } from '@/components/app-shell';
import { classeBotao } from '@/components/campo';
import { PageHeader } from '@/components/page-header';
import { buscarLista, mensagemDeErro, requisitar } from '@/lib/api';
import { useExigirPermissao } from '@/lib/current-user';
import { CATEGORIAS } from '@/lib/estoque';
import type { Categoria, ItemEstoque } from '@/lib/types';
import { EditarItem } from './_components/editar-item';
import { MovimentoEstoque, type Operacao } from './_components/movimento-estoque';
import { NovoItem } from './_components/novo-item';
import { TabelaEstoque } from './_components/tabela-estoque';

const ABAS = (Object.keys(CATEGORIAS) as Categoria[]).map((id) => ({
  id,
  titulo: CATEGORIAS[id].titulo,
  descricao: CATEGORIAS[id].descricao,
}));

export default function EstoquePage() {
  const { permitido } = useExigirPermissao('estoque');
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<Categoria>('MADEIRA');
  const [busca, setBusca] = useState('');
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<ItemEstoque | null>(null);
  const [movimento, setMovimento] = useState<{
    item: ItemEstoque;
    operacao: Operacao;
  } | null>(null);

  useEffect(() => {
    if (!permitido) return;
    buscarLista<ItemEstoque>('/api/estoque').then((lista) => {
      setItens(lista);
      setCarregando(false);
    });
  }, [permitido]);

  const info = CATEGORIAS[categoria];
  const daCategoria = itens.filter((item) => item.categoria === categoria);
  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? daCategoria.filter((item) => item.nome.toLowerCase().includes(termo))
    : daCategoria;

  function substituir(atualizado: ItemEstoque) {
    setItens((lista) =>
      lista.map((item) => (item.id === atualizado.id ? atualizado : item)),
    );
  }

  async function excluir(item: ItemEstoque) {
    if (!confirm(`Excluir ${item.nome} do estoque?`)) return;
    try {
      await requisitar(`/api/estoque/${item.id}`, 'DELETE');
      setItens((lista) => lista.filter((atual) => atual.id !== item.id));
    } catch (erro) {
      alert(mensagemDeErro(erro));
    }
  }

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
              onClick={() => setCriando(true)}
              className={classeBotao}
            >
              <Plus className="size-5" /> Novo item
            </button>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <Abas
          abas={ABAS}
          ativa={categoria}
          rotulo="Categorias do estoque"
          onTrocar={(id) => {
            setCategoria(id);
            setBusca('');
          }}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-ink text-lg font-bold">{info.titulo}</h2>
            <p className="text-muted text-sm">{daCategoria.length} itens cadastrados</p>
          </div>
          <label className="border-line flex w-full max-w-sm items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="text-faint size-5 shrink-0" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="text-ink placeholder:text-faint w-full bg-transparent text-sm outline-none"
              placeholder={`Buscar em ${info.titulo.toLowerCase()}...`}
              aria-label="Buscar item"
            />
          </label>
        </div>

        <TabelaEstoque
          itens={visiveis}
          carregando={carregando}
          coluna={info.campo}
          textoVazio={
            termo ? 'Nenhum item encontrado.' : 'Nenhum item cadastrado nesta aba.'
          }
          onMovimentar={(item, operacao) => setMovimento({ item, operacao })}
          onEditar={setEditando}
          onExcluir={excluir}
        />
      </div>

      {criando && (
        <NovoItem
          categoria={categoria}
          onFechar={() => setCriando(false)}
          onCriado={(item) => {
            setItens((lista) => [...lista, item]);
            setCriando(false);
          }}
        />
      )}

      {editando && (
        <EditarItem
          item={editando}
          onFechar={() => setEditando(null)}
          onSalvo={(item) => {
            substituir(item);
            setEditando(null);
          }}
        />
      )}

      {movimento && (
        <MovimentoEstoque
          item={movimento.item}
          operacao={movimento.operacao}
          onFechar={() => setMovimento(null)}
          onSalvo={(item) => {
            substituir(item);
            setMovimento(null);
          }}
        />
      )}
    </AppShell>
  );
}
