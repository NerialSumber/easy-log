import type { ReactNode } from 'react';
import Link from 'next/link';
import { BarraProgresso } from '@/components/barra-progresso';

type CartaoProps = {
  titulo: string;
  valor: string;
  detalhe?: string;
  href: string;
  destaque?: boolean;
  progresso?: number;
};

export function Cartao({
  titulo,
  valor,
  detalhe,
  href,
  destaque = false,
  progresso,
}: CartaoProps) {
  return (
    <Link
      href={href}
      className="border-line bg-surface hover:border-accent flex h-full flex-col border px-5 py-5 transition-colors"
    >
      <p className="text-muted text-sm">{titulo}</p>
      <p
        className={`mt-4 text-3xl font-medium tabular-nums ${destaque ? 'text-danger' : 'text-ink'}`}
      >
        {valor}
      </p>
      {progresso !== undefined ? (
        <BarraProgresso percentual={progresso} alerta={destaque} className="mt-3" />
      ) : null}
      {detalhe ? <p className="text-faint mt-2 text-sm leading-5">{detalhe}</p> : null}
    </Link>
  );
}

export function Painel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-line bg-surface flex h-full flex-col border p-6">
      <h2 className="text-ink text-base font-medium">{titulo}</h2>
      <div className="mt-6 flex-1">{children}</div>
    </section>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return (
    <div className="flex h-full min-h-36 items-center justify-center px-6 py-8 text-center">
      <p className="text-muted max-w-xs text-sm leading-5">{texto}</p>
    </div>
  );
}

export function CarregandoDashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((indice) => (
          <div
            key={indice}
            className="border-line bg-surface h-32 animate-pulse border"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="border-line bg-surface h-72 animate-pulse border" />
        <div className="border-line bg-surface h-72 animate-pulse border" />
      </div>
    </div>
  );
}
