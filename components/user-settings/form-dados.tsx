'use client';

import { useState, type FormEvent } from 'react';
import { Campo, classeCampo } from '@/components/campo';
import { mensagemDeErro, requisitar } from '@/lib/api';
import { salvarSessao, type UserData } from '@/lib/current-user';
import type { Usuario } from '@/lib/types';
import { Erro, Rodape } from './partes';

export function FormDados({
  usuario,
  onVoltar,
}: {
  usuario: UserData;
  onVoltar: () => void;
}) {
  const [nome, setNome] = useState(usuario.id ? usuario.nome : '');
  const [email, setEmail] = useState(usuario.email);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      salvarSessao(await requisitar<Usuario>('/api/auth/me', 'PUT', { nome, email }));
      onVoltar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <Erro texto={erro} />
      <Campo rotulo="Nome de usuário">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite seu nome"
          required
          autoFocus
          className={classeCampo}
        />
      </Campo>
      <Campo rotulo="E-mail">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail"
          required
          className={classeCampo}
        />
      </Campo>
      <Rodape textoSalvar="Salvar alterações" salvando={salvando} onCancelar={onVoltar} />
    </form>
  );
}
