'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { classeBotao } from '@/components/campo';
import { Modal } from '@/components/modal';
import { PageHeader } from '@/components/page-header';
import { buscarLista, mensagemDeErro, requisitar } from '@/lib/api';
import { formatarTelefone } from '@/lib/contato';
import { useCurrentUser } from '@/lib/current-user';
import { pode } from '@/lib/permissoes';
import type { FornecedorLista } from '@/lib/types';
import { DetalheFornecedor } from './_components/detalhe-fornecedor';
import { FornecedorForm, paraFormulario } from './_components/fornecedor-form';

const classeCabecalho =
  'text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase';

function filtrar(fornecedores: FornecedorLista[], busca: string) {
  const termo = busca.trim().toLowerCase();
  if (!termo) return fornecedores;
  return fornecedores.filter((fornecedor) =>
    [fornecedor.nome, fornecedor.telefone, fornecedor.email, ...fornecedor.produto]
      .join(' ')
      .toLowerCase()
      .includes(termo),
  );
}

export default function FornecedoresPage() {
  const user = useCurrentUser();
  const podeEditar = pode(user.role, 'fornecedores', 'escrever');
  const [fornecedores, setFornecedores] = useState<FornecedorLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [detalhe, setDetalhe] = useState<FornecedorLista | null>(null);
  const [editando, setEditando] = useState<FornecedorLista | null>(null);

  useEffect(() => {
    buscarLista<FornecedorLista>('/api/fornecedores').then((lista) => {
      setFornecedores(lista);
      setCarregando(false);
    });
  }, []);

  const filtrados = filtrar(fornecedores, busca);
  const aviso = carregando
    ? 'Carregando fornecedores...'
    : filtrados.length > 0
      ? ''
      : busca.trim()
        ? 'Nenhum fornecedor encontrado.'
        : 'Nenhum fornecedor cadastrado.';

  async function excluir(fornecedor: FornecedorLista) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      await requisitar(`/api/fornecedores/${fornecedor.id}`, 'DELETE');
      setFornecedores((lista) => lista.filter((item) => item.id !== fornecedor.id));
      setDetalhe(null);
    } catch (erro) {
      alert(mensagemDeErro(erro));
    }
  }

  return (
    <AppShell
      active="fornecedores"
      header={
        <PageHeader
          title="Gerenciamento de Fornecedores"
          subtitle={
            podeEditar
              ? 'Cadastre os fornecedores e os produtos que eles fornecem.'
              : 'Consulte os fornecedores e os produtos que eles fornecem.'
          }
          action={
            podeEditar ? (
              <Link href="/fornecedores/novo" className={classeBotao}>
                <Plus className="size-5" /> Novo Fornecedor
              </Link>
            ) : undefined
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <label className="border-line flex w-full max-w-[520px] items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-faint size-5 shrink-0" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="text-ink placeholder:text-faint w-full bg-transparent text-sm leading-5 outline-none"
            placeholder="Buscar por nome, telefone ou e-mail..."
            aria-label="Buscar por nome ou contato"
          />
        </label>

        <div className="border-line bg-surface overflow-hidden rounded-xl border">
          <table className="min-w-full">
            <thead className="bg-soft">
              <tr className="border-line border-b">
                <th className={classeCabecalho}>Nome</th>
                <th className={classeCabecalho}>Contato</th>
              </tr>
            </thead>
            <tbody>
              {aviso ? (
                <tr>
                  <td colSpan={2} className="text-muted px-6 py-4 text-center">
                    {aviso}
                  </td>
                </tr>
              ) : (
                filtrados.map((fornecedor) => (
                  <tr
                    key={fornecedor.id}
                    onClick={() => setDetalhe(fornecedor)}
                    className="border-line hover:bg-soft cursor-pointer border-b last:border-b-0"
                  >
                    <td className="text-ink px-6 py-4 text-sm font-medium">
                      {fornecedor.nome}
                    </td>
                    <td className="text-muted px-6 py-4 text-sm">
                      <div className="flex flex-col items-end gap-1">
                        <span>
                          <strong className="text-ink font-semibold">E-mail:</strong>{' '}
                          {fornecedor.email || '—'}
                        </span>
                        <span>
                          <strong className="text-ink font-semibold">Telefone:</strong>{' '}
                          {fornecedor.telefone
                            ? formatarTelefone(fornecedor.telefone)
                            : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detalhe && (
        <DetalheFornecedor
          fornecedor={detalhe}
          podeEditar={podeEditar}
          onFechar={() => setDetalhe(null)}
          onEditar={() => {
            setEditando(detalhe);
            setDetalhe(null);
          }}
          onExcluir={() => excluir(detalhe)}
        />
      )}

      {editando && (
        <Modal
          titulo="Editar Fornecedor"
          largura="max-w-2xl"
          onFechar={() => setEditando(null)}
        >
          <div className="p-6">
            <FornecedorForm
              inicial={paraFormulario(editando)}
              onCancelar={() => setEditando(null)}
              onSalvar={async (dados) => {
                const salvo = await requisitar<FornecedorLista>(
                  `/api/fornecedores/${editando.id}`,
                  'PUT',
                  dados,
                );
                setFornecedores((lista) =>
                  lista.map((item) => (item.id === salvo.id ? salvo : item)),
                );
                setEditando(null);
              }}
            />
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
