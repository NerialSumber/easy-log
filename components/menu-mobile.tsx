'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { NavLinks, UsuarioResumo, type NavKey } from '@/components/app-sidebar';
import { Logo } from '@/components/logo';
import { UserSettings } from '@/components/user-settings';

export function MenuMobile({ active }: { active: NavKey }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const fecharComEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAberto(false);
    };
    window.addEventListener('keydown', fecharComEsc);
    return () => window.removeEventListener('keydown', fecharComEsc);
  }, [aberto]);

  return (
    <>
      <div className="border-line bg-surface sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          className="text-ink hover:bg-soft rounded-lg p-2"
        >
          <Menu className="size-6" />
        </button>
        <Link href="/" className="text-ink flex items-center gap-2 font-medium">
          <Logo className="size-7" />
          Easy-Log
        </Link>
        <UserSettings />
      </div>

      {aberto ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div className="bg-surface border-line absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r">
            <div className="border-line flex items-center gap-3 border-b px-5 py-4">
              <UsuarioResumo />
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="text-muted hover:bg-soft rounded-lg p-2"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks active={active} onNavegar={() => setAberto(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
