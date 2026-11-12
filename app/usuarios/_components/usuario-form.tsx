'use client';

import { useState, type FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import {
  Campo,
  classeBotao,
  classeBotaoSecundario,
  classeCampo,
} from '@/components/campo';
import { Modal, RodapeModal } from '@/components/modal';
import { mensagemDeErro, requisitar } from '@/lib/api';
import type { Role } from '@/lib/permissoes';
import type { Usuario } from '@/lib/types';

type UsuarioFormProps = {
  usuario: Usuario | null;
  ehVoceMesmo: boolean;
  onFechar: () => void;
  onSalvo: (usuario: Usuario) => void;
};

export function UsuarioForm({
  usuario,
  ehVoceMesmo,
  onFechar,
  onSalvo,
}: UsuarioFormProps) {
  const editando = usuario !== null;
  const [form, setForm] = useState({
    nome: usuario?.nome ?? '',
    email: usuario?.email ?? '',
    password: '',
    role: usuario?.role ?? ('PROJETISTA' as Role),
  });
  const [salvando, setSalvando] = useState(false);

  function alterar(campos: Partial<typeof form>) {
    setForm((atual) => ({ ...atual, ...campos }));
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const salvo = editando
        ? await requisitar<Usuario>(`/api/usuarios/${usuario.id}`, 'PUT', form)
        : await requisitar<Usuario>('/api/usuarios', 'POST', form);
      onSalvo(salvo);
    } catch (erro) {
      alert(mensagemDeErro(erro));
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={editando ? 'Editar usuário' : 'Novo usuário'}
      subtitulo={
        editando
          ? 'Atualize os dados de acesso. A senha é opcional.'
          : 'Crie o acesso e envie e-mail e senha para a pessoa.'
      }
      onFechar={onFechar}
    >
      <form onSubmit={salvar}>
        <div className="flex flex-col gap-5 p-6">
          <Campo rotulo="Nome completo">
            <input
              required
              value={form.nome}
              onChange={(e) => alterar({ nome: e.target.value })}
              className={classeCampo}
              placeholder="Ex.: Ana Souza"
            />
          </Campo>
          <Campo rotulo="E-mail">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => alterar({ email: e.target.value })}
              className={classeCampo}
              placeholder="ana@easylog.com"
            />
          </Campo>
          <Campo rotulo={editando ? 'Nova senha' : 'Senha inicial'}>
            <input
              required={!editando}
              minLength={6}
              type="password"
              value={form.password}
              onChange={(e) => alterar({ password: e.target.value })}
              className={classeCampo}
              placeholder={
                editando
                  ? 'Deixe em branco para manter a senha atual'
                  : 'Mínimo de 6 caracteres'
              }
            />
          </Campo>
          <Campo rotulo="Função">
            <select
              value={form.role}
              onChange={(e) => alterar({ role: e.target.value as Role })}
              disabled={ehVoceMesmo}
              className={classeCampo}
            >
              <option value="PROJETISTA">Projetista</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </Campo>
        </div>
        <RodapeModal>
          <button type="button" onClick={onFechar} className={classeBotaoSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={classeBotao}>
            <UserPlus className="size-4" />
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar acesso'}
          </button>
        </RodapeModal>
      </form>
    </Modal>
  );
}
