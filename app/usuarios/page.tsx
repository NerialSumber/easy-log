'use client';

import { useEffect, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { classeBotao } from '@/components/campo';
import { PageHeader } from '@/components/page-header';
import { buscarLista, mensagemDeErro, requisitar } from '@/lib/api';
import { salvarSessao, useExigirPermissao } from '@/lib/current-user';
import type { Usuario } from '@/lib/types';
import { UsuarioForm } from './_components/usuario-form';

const classeCabecalho =
  'text-muted px-6 py-3 text-left text-xs font-bold tracking-[0.72px] uppercase';

function porNome(a: Usuario, b: Usuario) {
  return a.nome.localeCompare(b.nome, 'pt-BR');
}

export default function UsuariosPage() {
  const { permitido, user } = useExigirPermissao('usuarios', 'escrever');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!permitido) return;
    buscarLista<Usuario>('/api/usuarios').then((lista) => {
      setUsuarios(lista);
      setCarregando(false);
    });
  }, [permitido]);

  function abrir(usuario: Usuario | null) {
    setEditando(usuario);
    setModalAberto(true);
  }

  function aoSalvar(salvo: Usuario) {
    setUsuarios((lista) =>
      (editando
        ? lista.map((item) => (item.id === salvo.id ? salvo : item))
        : [...lista, salvo]
      ).sort(porNome),
    );
    if (salvo.id === user.id) salvarSessao(salvo);
    setModalAberto(false);
  }

  async function excluir(usuario: Usuario) {
    if (!confirm(`Excluir o acesso de ${usuario.nome}?`)) return;
    try {
      await requisitar(`/api/usuarios/${usuario.id}`, 'DELETE');
      setUsuarios((lista) => lista.filter((item) => item.id !== usuario.id));
    } catch (erro) {
      alert(mensagemDeErro(erro));
    }
  }

  const aviso = carregando
    ? 'Carregando usuários...'
    : usuarios.length === 0
      ? 'Nenhum usuário cadastrado.'
      : '';

  return (
    <AppShell
      active="usuarios"
      header={
        <PageHeader
          title="Usuários"
          subtitle="Crie, edite e remova acessos ao sistema."
          action={
            <button type="button" onClick={() => abrir(null)} className={classeBotao}>
              <Plus className="size-5" /> Novo usuário
            </button>
          }
        />
      }
    >
      <div className="border-line bg-surface overflow-hidden rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-soft">
            <tr className="border-line border-b">
              <th className={classeCabecalho}>Nome</th>
              <th className={classeCabecalho}>E-mail</th>
              <th className={classeCabecalho}>Função</th>
              <th className="w-28 px-6 py-3" aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {aviso ? (
              <tr>
                <td colSpan={4} className="text-muted px-6 py-10 text-center text-sm">
                  {aviso}
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-line border-b last:border-0">
                  <td className="text-ink px-6 py-4 text-sm font-semibold">
                    {usuario.nome}
                  </td>
                  <td className="text-muted px-6 py-4 text-sm">{usuario.email}</td>
                  <td className="text-muted px-6 py-4 text-sm">{usuario.roleLabel}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrir(usuario)}
                        className="text-muted hover:bg-soft hover:text-accent rounded-lg p-2"
                        aria-label={`Editar ${usuario.nome}`}
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(usuario)}
                        disabled={usuario.id === user.id}
                        className="text-muted hover:bg-danger-soft hover:text-danger rounded-lg p-2 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Excluir ${usuario.nome}`}
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

      {modalAberto && (
        <UsuarioForm
          usuario={editando}
          ehVoceMesmo={editando?.id === user.id}
          onFechar={() => setModalAberto(false)}
          onSalvo={aoSalvar}
        />
      )}
    </AppShell>
  );
}
