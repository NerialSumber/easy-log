'use client';

import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { formatarPeriodo } from '@/lib/formatos';
import { TODOS_STATUS, classesStatus, rotuloStatus } from '@/lib/status-projeto';
import type { ProjetoLista } from '@/lib/types';
import { FILTROS, filtrarProjetos, type CampoFiltro } from '../_lib/filtros';

type PedidosProps = {
  projetos: ProjetoLista[];
  carregando: boolean;
  onAbrir: (projeto: ProjetoLista) => void;
};

function LinhaAviso({ texto }: { texto: string }) {
  return (
    <tr>
      <td colSpan={4} className="text-muted px-6 py-12 text-center text-sm">
        {texto}
      </td>
    </tr>
  );
}

export function Pedidos({ projetos, carregando, onAbrir }: PedidosProps) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<CampoFiltro>('todos');
  const filtrados = useMemo(
    () => filtrarProjetos(projetos, busca, filtro),
    [projetos, busca, filtro],
  );
  const placeholder = FILTROS[filtro].placeholder;

  return (
    <section className="border-line bg-surface overflow-hidden rounded-md border">
      <div
        role="search"
        className="border-line flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center"
      >
        <div className="bg-soft flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
          <Search className="text-faint size-4 shrink-0" />
          {filtro === 'status' ? (
            <select
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="text-ink w-full bg-transparent text-sm outline-none"
              aria-label="Filtrar por status"
            >
              <option value="">Todos os status</option>
              {TODOS_STATUS.map((status) => (
                <option key={status} value={status}>
                  {rotuloStatus(status)}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={filtro === 'data' ? 'date' : 'search'}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="text-ink placeholder:text-faint w-full bg-transparent text-sm outline-none"
              placeholder={placeholder}
              aria-label={placeholder}
            />
          )}
        </div>

        <div className="bg-soft flex w-full items-center gap-2 rounded-xl px-3 py-2.5 sm:w-52">
          <Filter className="text-faint size-4 shrink-0" />
          <select
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value as CampoFiltro);
              setBusca('');
            }}
            className="text-ink w-full bg-transparent text-sm outline-none"
            aria-label="Filtrar por"
          >
            {Object.entries(FILTROS).map(([valor, { rotulo }]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </div>

        <p className="text-faint text-sm sm:ml-auto">
          {carregando
            ? 'Carregando'
            : `${filtrados.length} ${filtrados.length === 1 ? 'projeto' : 'projetos'}`}
        </p>
      </div>

      <table className="min-w-full">
        <thead>
          <tr className="border-line border-b">
            <th className="text-faint px-6 py-3 text-left text-xs font-medium">
              Projeto
            </th>
            <th className="text-faint w-[240px] px-6 py-3 text-left text-xs font-medium">
              Período
            </th>
            <th className="text-faint px-6 py-3 text-left text-xs font-medium">
              Cliente
            </th>
            <th className="text-faint w-[160px] px-6 py-3 text-right text-xs font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {carregando ? (
            <LinhaAviso texto="Carregando projetos..." />
          ) : filtrados.length === 0 ? (
            <LinhaAviso
              texto={
                busca.trim()
                  ? 'Nenhum projeto encontrado para esta busca.'
                  : 'Nenhum projeto cadastrado.'
              }
            />
          ) : (
            filtrados.map((projeto) => (
              <tr
                key={projeto.id}
                onClick={() => onAbrir(projeto)}
                className="border-line hover:bg-soft cursor-pointer border-b last:border-b-0"
              >
                <td className="px-6 py-4">
                  <p className="text-ink text-sm font-medium">{projeto.nome}</p>
                  <p className="text-faint mt-0.5 text-xs">{projeto.codigo}</p>
                </td>
                <td className="text-muted w-[240px] px-6 py-4 text-sm whitespace-nowrap">
                  {formatarPeriodo(projeto.dataInicio, projeto.dataFim)}
                </td>
                <td className="text-ink px-6 py-4 text-sm">
                  {projeto.cliente?.nome ?? '—'}
                </td>
                <td className="w-[160px] px-6 py-4 text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classesStatus(projeto.status)}`}
                  >
                    {rotuloStatus(projeto.status)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
