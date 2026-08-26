'use client';

import { useEffect, useState } from 'react';
import { Accessibility, Eye, EyeOff, LogOut, Settings, UserRound, X } from 'lucide-react';
import { useCurrentUser } from '@/lib/current-user';

export function UserSettings() {
  const user = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'usuario' | 'acessibilidade'>('usuario');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [temaNoturno, setTemaNoturno] = useState(false);
  const [fonteMaior, setFonteMaior] = useState(false);

  function aplicarPreferencias(novoTemaNoturno: boolean, novaFonteMaior: boolean) {
    document.body.classList.toggle('dark-theme', novoTemaNoturno);
    document.body.classList.toggle('large-font', novaFonteMaior);
  }

  useEffect(() => {
    const temaSalvo = localStorage.getItem('tema_noturno') === 'true';
    const fonteSalva = localStorage.getItem('fonte_maior') === 'true';
    aplicarPreferencias(temaSalvo, fonteSalva);
  }, []);

  function abrirConfiguracoes() {
    setNome(user.nome === 'Carregando...' ? '' : user.nome);
    setSenha('');
    setConfirmacao('');
    setMostrarSenha(false);
    setAbaAtiva('usuario');
    setTemaNoturno(localStorage.getItem('tema_noturno') === 'true');
    setFonteMaior(localStorage.getItem('fonte_maior') === 'true');
    setIsOpen(true);
  }

  function fecharConfiguracoes() {
    setIsOpen(false);
  }

  function salvarAlteracoes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsOpen(false);
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

  return (
    <>
      <button
        type="button"
        onClick={abrirConfiguracoes}
        aria-label="Abrir configurações do usuário"
        title="Configurações"
        className="flex size-10 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#475569] transition hover:border-[#cbd5e1] hover:bg-[#f8fafc] hover:text-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/30 focus:outline-none"
      >
        <Settings size={19} strokeWidth={2} />
      </button>

      {isOpen ? (
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
                  Atualize seus dados de acesso.
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
                onClick={() => setAbaAtiva('usuario')}
                className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition ${abaAtiva === 'usuario' ? 'border-[#0f766e] text-[#0f766e]' : 'border-transparent text-[#64748b] hover:text-[#334155]'}`}
              >
                <UserRound size={17} />
                Usuário
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('acessibilidade')}
                className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition ${abaAtiva === 'acessibilidade' ? 'border-[#0f766e] text-[#0f766e]' : 'border-transparent text-[#64748b] hover:text-[#334155]'}`}
              >
                <Accessibility size={17} />
                Acessibilidade
              </button>
            </div>

            {abaAtiva === 'usuario' ? (
              <form onSubmit={salvarAlteracoes} className="space-y-5">
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
                    className="h-11 w-full rounded-lg border border-[#cbd5e1] px-3 text-sm text-[#1e293b] transition outline-none placeholder:text-[#94a3b8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15"
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
                      placeholder="Digite uma nova senha"
                      className="h-11 w-full rounded-lg border border-[#cbd5e1] px-3 pr-11 text-sm text-[#1e293b] transition outline-none placeholder:text-[#94a3b8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15"
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
                    className="h-11 w-full rounded-lg border border-[#cbd5e1] px-3 text-sm text-[#1e293b] transition outline-none placeholder:text-[#94a3b8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15"
                  />
                </label>
                <div className="flex justify-end gap-3 border-t border-[#e2e8f0] pt-5">
                  <button
                    type="button"
                    onClick={fecharConfiguracoes}
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
                      Facilitar a leitura dos textos
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
        </div>
      ) : null}
    </>
  );
}
