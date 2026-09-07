'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Accessibility, Eye, EyeOff, KeyRound, LogOut, Pencil, Settings, UserRound, X } from 'lucide-react';
import { persistirDadosUsuario, senhaAtualConfere, useCurrentUser } from '@/lib/current-user';

type ModoUsuario = 'visualizar' | 'editar' | 'senha';

const campoEditavel =
  'h-11 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm text-[#1e293b] transition outline-none placeholder:text-[#94a3b8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15';

function DadoUsuario({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-[#334155]">{label}</p>
      <p className="text-base text-[#1e293b]">{valor || '—'}</p>
    </div>
  );
}

export function UserSettings({ className = '' }: { className?: string }) {
  const user = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'usuario' | 'acessibilidade'>('usuario');
  const [modoUsuario, setModoUsuario] = useState<ModoUsuario>('visualizar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [temaNoturno, setTemaNoturno] = useState(false);
  const [fonteMaior, setFonteMaior] = useState(false);

  function aplicarPreferencias(novoTemaNoturno: boolean, novaFonteMaior: boolean) {
    document.body.classList.toggle('dark-theme', novoTemaNoturno);
    document.body.classList.remove('large-font');
    document.documentElement.classList.toggle('large-font', novaFonteMaior);
  }

  useEffect(() => {
    const temaSalvo = localStorage.getItem('tema_noturno') === 'true';
    const fonteSalva = localStorage.getItem('fonte_maior') === 'true';
    aplicarPreferencias(temaSalvo, fonteSalva);
  }, []);

  function carregarDadosUsuario() {
    setNome(user.nome === 'Carregando...' ? '' : user.nome);
    setEmail(user.email);
  }

  function abrirConfiguracoes() {
    carregarDadosUsuario();
    setSenhaAtual('');
    setSenha('');
    setConfirmacao('');
    setMostrarSenha(false);
    setErro('');
    setModoUsuario('visualizar');
    setAbaAtiva('usuario');
    setTemaNoturno(localStorage.getItem('tema_noturno') === 'true');
    setFonteMaior(localStorage.getItem('fonte_maior') === 'true');
    setIsOpen(true);
  }

  function fecharConfiguracoes() {
    setIsOpen(false);
    setModoUsuario('visualizar');
    setErro('');
  }

  function cancelarEdicao() {
    carregarDadosUsuario();
    setSenhaAtual('');
    setSenha('');
    setConfirmacao('');
    setMostrarSenha(false);
    setErro('');
    setModoUsuario('visualizar');
  }

  function salvarDados(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();
    if (!nomeLimpo) {
      setErro('Informe o nome de usuário.');
      return;
    }
    if (!emailLimpo) {
      setErro('Informe o e-mail.');
      return;
    }

    persistirDadosUsuario({ nome: nomeLimpo, email: emailLimpo });
    setNome(nomeLimpo);
    setEmail(emailLimpo);
    setErro('');
    setModoUsuario('visualizar');
  }

  function iniciarEdicao(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setErro('');
    setModoUsuario('editar');
  }

  function iniciarAlteracaoSenha(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setErro('');
    setModoUsuario('senha');
  }

  function salvarSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!senhaAtual) {
      setErro('Informe a senha atual.');
      return;
    }
    if (!senhaAtualConfere(senhaAtual)) {
      setErro('A senha atual está incorreta.');
      return;
    }
    if (senha.length < 4) {
      setErro('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('A confirmação não confere com a nova senha.');
      return;
    }

    persistirDadosUsuario({ password: senha });
    setSenhaAtual('');
    setSenha('');
    setConfirmacao('');
    setMostrarSenha(false);
    setErro('');
    setModoUsuario('visualizar');
  }

  function alternarTemaNoturno() {
    const novoValor = !temaNoturno;
    setTemaNoturno(novoValor);
    localStorage.setItem('tema_noturno', String(novoValor));
    aplicarPreferencias(novoValor, fonteMaior);
  }

  function alternarFonteMaior() {
    const novoValor = !fonteMaior;
    setFonteMaior(novoValor);
    localStorage.setItem('fonte_maior', String(novoValor));
    aplicarPreferencias(temaNoturno, novoValor);
  }

  function fazerLogout() {
    localStorage.removeItem('current_user');
    window.location.href = '/login';
  }

  const editando = modoUsuario === 'editar';
  const alterandoSenha = modoUsuario === 'senha';

  return (
    <>
      <button
        type="button"
        onClick={abrirConfiguracoes}
        aria-label="Abrir configurações do usuário"
        title="Configurações"
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[#475569] transition hover:bg-[#f1f5f9] hover:text-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/30 focus:outline-none ${className}`}
      >
        <Settings size={24} strokeWidth={2} />
      </button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-settings-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-[#0f766e] uppercase">
                  Minha conta
                </p>
                <h2 id="user-settings-title" className="text-xl font-bold text-[#1e293b]">
                  Configurações do usuário
                </h2>
                <p className="mt-1 text-sm text-[#64748b]">
                  {alterandoSenha
                    ? 'Defina uma nova senha de acesso.'
                    : editando
                      ? 'Atualize seus dados de acesso.'
                      : 'Seus dados atuais estão bloqueados para edição.'}
                </p>
              </div>
              <button
                type="button"
                onClick={fecharConfiguracoes}
                aria-label="Fechar configurações"
                title="Fechar"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#1e293b] focus:ring-2 focus:ring-[#0f766e]/30 focus:outline-none"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mb-6 flex border-b border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => {
                  setAbaAtiva('usuario');
                  setErro('');
                }}
                className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition ${abaAtiva === 'usuario' ? 'border-[#0f766e] text-[#0f766e]' : 'border-transparent text-[#64748b] hover:text-[#334155]'}`}
              >
                <UserRound size={17} />
                Usuário
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbaAtiva('acessibilidade');
                  setErro('');
                }}
                className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition ${abaAtiva === 'acessibilidade' ? 'border-[#0f766e] text-[#0f766e]' : 'border-transparent text-[#64748b] hover:text-[#334155]'}`}
              >
                <Accessibility size={17} />
                Acessibilidade
              </button>
            </div>

            {abaAtiva === 'usuario' ? (
              alterandoSenha ? (
                <form onSubmit={salvarSenha} className="space-y-5">
                  {erro ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {erro}
                    </p>
                  ) : null}
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#334155]">
                      Senha atual
                    </span>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senhaAtual}
                      onChange={(event) => setSenhaAtual(event.target.value)}
                      placeholder="Digite a senha atual"
                      required
                      className={campoEditavel}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#334155]">
                      Nova senha
                    </span>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder="Digite a nova senha"
                        required
                        className={`${campoEditavel} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha((atual) => !atual)}
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#64748b] hover:text-[#0f766e]"
                      >
                        {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#334155]">
                      Confirmar nova senha
                    </span>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={confirmacao}
                      onChange={(event) => setConfirmacao(event.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      className={campoEditavel}
                    />
                  </label>
                  <div className="flex justify-end gap-3 border-t border-[#e2e8f0] pt-5">
                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#f1f5f9]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59] focus:ring-2 focus:ring-[#0f766e]/30 focus:outline-none"
                    >
                      Salvar senha
                    </button>
                  </div>
                </form>
              ) : editando ? (
                <form
                  onSubmit={salvarDados}
                  className="space-y-5"
                >
                  {erro ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {erro}
                    </p>
                  ) : null}
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#334155]">
                      Nome de usuário
                    </span>
                    <input
                      type="text"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      placeholder="Digite seu nome"
                      required
                      autoFocus
                      className={campoEditavel}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#334155]">
                      E-mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Digite seu e-mail"
                      required
                      className={campoEditavel}
                    />
                  </label>
                  <DadoUsuario label="Função" valor={user.role} />
                  <div className="flex justify-end gap-3 border-t border-[#e2e8f0] pt-5">
                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#f1f5f9]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59] focus:ring-2 focus:ring-[#0f766e]/30 focus:outline-none"
                    >
                      Salvar alterações
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <DadoUsuario label="Nome de usuário" valor={nome} />
                  <DadoUsuario label="E-mail" valor={email} />
                  <DadoUsuario label="Função" valor={user.role} />
                  <div className="flex flex-wrap justify-end gap-3 border-t border-[#e2e8f0] pt-5">
                    <button
                      type="button"
                      onClick={iniciarAlteracaoSenha}
                      className="flex items-center gap-2 rounded-lg border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
                    >
                      <KeyRound size={16} />
                      Alterar senha
                    </button>
                    <button
                      type="button"
                      onClick={iniciarEdicao}
                      className="flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59] focus:ring-2 focus:ring-[#0f766e]/30 focus:outline-none"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={alternarTemaNoturno}
                  className="flex w-full items-center justify-between rounded-lg border border-[#e2e8f0] p-4 text-left transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-[#334155]">
                      Tema noturno
                    </span>
                    <span className="mt-1 block text-xs text-[#64748b]">
                      Usar cores mais escuras no site
                    </span>
                  </span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition ${temaNoturno ? 'bg-[#0f766e]' : 'bg-[#cbd5e1]'}`}
                  >
                    <span
                      className={`absolute top-1 size-4 rounded-full bg-white transition ${temaNoturno ? 'left-6' : 'left-1'}`}
                    />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={alternarFonteMaior}
                  className="flex w-full items-center justify-between rounded-lg border border-[#e2e8f0] p-4 text-left transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-[#334155]">
                      Aumentar tamanho da fonte
                    </span>
                    <span className="mt-1 block text-xs text-[#64748b]">
                      Deixar todas as letras do site maiores
                    </span>
                  </span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition ${fonteMaior ? 'bg-[#0f766e]' : 'bg-[#cbd5e1]'}`}
                  >
                    <span
                      className={`absolute top-1 size-4 rounded-full bg-white transition ${fonteMaior ? 'left-6' : 'left-1'}`}
                    />
                  </span>
                </button>
                <div className="flex justify-end border-t border-[#e2e8f0] pt-5">
                  <button
                    type="button"
                    onClick={fecharConfiguracoes}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#f1f5f9]"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end border-t border-[#e2e8f0] pt-4">
              <button
                type="button"
                onClick={fazerLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fef2f2]"
              >
                <LogOut size={17} />
                Sair
              </button>
            </div>
          </section>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
