'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Accessibility,
  KeyRound,
  LogOut,
  Pencil,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import { classeBotao } from '@/components/campo';
import { sair, useCurrentUser } from '@/lib/current-user';
import { Acessibilidade, aplicarPreferenciasSalvas } from './acessibilidade';
import { FormDados } from './form-dados';
import { FormSenha } from './form-senha';

type Aba = 'usuario' | 'acessibilidade';
type Modo = 'ver' | 'editar' | 'senha';

const SUBTITULOS: Record<Modo, string> = {
  ver: 'Seus dados atuais estão bloqueados para edição.',
  editar: 'Atualize seus dados de acesso.',
  senha: 'Defina uma nova senha de acesso.',
};

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-ink mb-1 text-sm font-semibold">{rotulo}</p>
      <p className="text-ink text-base">{valor || '—'}</p>
    </div>
  );
}

function BotaoAba({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold whitespace-nowrap transition ${
        ativa
          ? 'border-accent text-accent'
          : 'text-muted hover:text-ink border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

export function UserSettings({ className = '' }: { className?: string }) {
  const user = useCurrentUser();
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState<Aba>('usuario');
  const [modo, setModo] = useState<Modo>('ver');

  useEffect(() => {
    aplicarPreferenciasSalvas();
  }, []);

  function abrir() {
    setAba('usuario');
    setModo('ver');
    setAberto(true);
  }

  function conteudoDaAba() {
    if (aba === 'acessibilidade')
      return <Acessibilidade onConcluir={() => setAberto(false)} />;
    if (modo === 'editar')
      return <FormDados usuario={user} onVoltar={() => setModo('ver')} />;
    if (modo === 'senha') return <FormSenha onVoltar={() => setModo('ver')} />;

    return (
      <div className="space-y-5">
        <Dado rotulo="Nome de usuário" valor={user.nome} />
        <Dado rotulo="E-mail" valor={user.email} />
        <Dado rotulo="Função" valor={user.roleLabel} />
        <div className="border-line flex flex-wrap justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() => setModo('senha')}
            className="border-line text-ink hover:bg-soft flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
          >
            <KeyRound size={16} />
            Alterar senha
          </button>
          <button type="button" onClick={() => setModo('editar')} className={classeBotao}>
            <Pencil size={16} />
            Editar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Abrir configurações do usuário"
        title="Configurações"
        className={`text-muted hover:bg-soft hover:text-accent focus:ring-accent/30 flex size-9 shrink-0 items-center justify-center rounded-lg transition focus:ring-2 focus:outline-none ${className}`}
      >
        <Settings size={24} strokeWidth={2} />
      </button>

      {aberto
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4">
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-settings-title"
                className="bg-surface max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl p-4 sm:p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-accent mb-1 text-xs font-semibold tracking-[0.14em] uppercase">
                      Minha conta
                    </p>
                    <h2
                      id="user-settings-title"
                      className="text-ink text-lg font-bold sm:text-xl"
                    >
                      Configurações do usuário
                    </h2>
                    <p className="text-muted mt-1 text-sm">{SUBTITULOS[modo]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    aria-label="Fechar configurações"
                    className="text-muted hover:bg-soft hover:text-ink flex size-9 shrink-0 items-center justify-center rounded-lg transition"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="border-line mb-6 flex overflow-x-auto border-b">
                  <BotaoAba ativa={aba === 'usuario'} onClick={() => setAba('usuario')}>
                    <UserRound size={17} />
                    Usuário
                  </BotaoAba>
                  <BotaoAba
                    ativa={aba === 'acessibilidade'}
                    onClick={() => setAba('acessibilidade')}
                  >
                    <Accessibility size={17} />
                    Acessibilidade
                  </BotaoAba>
                </div>

                {conteudoDaAba()}

                <div className="border-line mt-6 flex justify-end border-t pt-4">
                  <button
                    type="button"
                    onClick={sair}
                    className="text-danger hover:bg-danger-soft flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
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
