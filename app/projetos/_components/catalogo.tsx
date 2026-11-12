'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import type { ProjetoLista } from '@/lib/types';

type Modelo = {
  nome: string;
  vezes: number;
  qtdeMadeira: number;
  madeiraId: string;
  clienteId: string;
};

function modelosMaisFeitos(projetos: ProjetoLista[]) {
  const modelos = new Map<string, Modelo>();

  for (const projeto of projetos) {
    const nome = projeto.nome.trim();
    const chave = nome.toLowerCase();
    if (!chave) continue;

    const modelo = modelos.get(chave);
    if (modelo) {
      modelo.vezes += 1;
    } else {
      modelos.set(chave, {
        nome,
        vezes: 1,
        qtdeMadeira: projeto.qtdeMadeira ?? 0,
        madeiraId: projeto.madeiraId ?? '',
        clienteId: projeto.clienteId ?? '',
      });
    }
  }

  return [...modelos.values()].sort(
    (a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

function linkNovoProjeto(modelo: Modelo) {
  const params = new URLSearchParams({
    nome: modelo.nome,
    madeira: String(modelo.qtdeMadeira),
  });
  if (modelo.clienteId) params.set('cliente', modelo.clienteId);
  if (modelo.madeiraId) params.set('tipo', modelo.madeiraId);
  return `/projetos/novo?${params}`;
}

function Aviso({ texto }: { texto: string }) {
  return (
    <p className="bg-soft text-muted mt-5 rounded-xl px-4 py-8 text-center text-sm">
      {texto}
    </p>
  );
}

export function Catalogo({
  projetos,
  carregando,
}: {
  projetos: ProjetoLista[];
  carregando: boolean;
}) {
  const [busca, setBusca] = useState('');
  const modelos = useMemo(() => modelosMaisFeitos(projetos), [projetos]);
  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? modelos.filter((modelo) => modelo.nome.toLowerCase().includes(termo))
    : modelos;
  const maisFeito = modelos[0]?.vezes ?? 1;

  return (
    <section className="border-line bg-surface rounded-md border p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-ink text-base font-semibold">Catálogo de projetos</h2>
          <p className="text-muted mt-1 text-sm leading-5">
            Toque em um nome para iniciar outro projeto igual, com datas novas.
          </p>
        </div>
        <label className="border-line bg-soft flex w-full max-w-sm items-center gap-2 rounded-xl border px-3 py-2.5">
          <Search className="text-faint size-4 shrink-0" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="text-ink placeholder:text-faint w-full bg-transparent text-sm outline-none"
            placeholder="Buscar no catálogo..."
            aria-label="Buscar no catálogo"
          />
        </label>
      </div>

      {carregando ? (
        <div className="mt-5 flex flex-col gap-2">
          {[0, 1, 2].map((indice) => (
            <div key={indice} className="bg-soft h-14 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : modelos.length === 0 ? (
        <Aviso texto="Nenhum projeto cadastrado para montar o catálogo." />
      ) : visiveis.length === 0 ? (
        <Aviso texto="Nenhum modelo encontrado para esta busca." />
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {visiveis.map((modelo, indice) => {
            const lider = indice === 0 && !termo;
            const largura = Math.max((modelo.vezes / maisFeito) * 100, 8);

            return (
              <li key={modelo.nome.toLowerCase()}>
                <Link
                  href={linkNovoProjeto(modelo)}
                  className="border-line hover:border-accent relative block overflow-hidden rounded-xl border"
                >
                  <span
                    className="bg-soft absolute inset-y-0 left-0"
                    style={{ width: `${largura}%` }}
                  />
                  <span className="relative flex items-center gap-4 px-4 py-3.5">
                    <span
                      className={`w-4 text-sm tabular-nums ${lider ? 'text-accent font-semibold' : 'text-faint'}`}
                    >
                      {indice + 1}
                    </span>
                    <span
                      className={`text-ink min-w-0 flex-1 truncate ${lider ? 'text-base font-semibold' : 'text-sm font-medium'}`}
                    >
                      {modelo.nome}
                    </span>
                    <span className="text-muted shrink-0 text-sm tabular-nums">
                      <span className="text-ink font-semibold">{modelo.vezes}</span>
                      <span className="ml-1 text-xs">
                        {modelo.vezes === 1 ? 'vez' : 'vezes'}
                      </span>
                    </span>
                    <Plus className="text-accent size-4 shrink-0" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
