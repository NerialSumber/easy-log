'use client';

import type { ClienteResumo } from '@/lib/types';

type ClienteFieldProps = {
  clientes: ClienteResumo[];
  clienteId: string;
  clienteNome: string;
  onClienteIdChange: (value: string) => void;
  onClienteNomeChange: (value: string) => void;
};

export function ClienteField({
  clientes,
  clienteId,
  clienteNome,
  onClienteIdChange,
  onClienteNomeChange,
}: ClienteFieldProps) {
  const isNovo = clienteId === '__new__';

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className={isNovo ? '' : 'md:col-span-2'}>
        <label className="mb-1 block text-sm font-semibold text-slate-800">Cliente *</label>
        <select
          required
          value={clienteId}
          onChange={(e) => onClienteIdChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
          <option value="__new__">Cadastrar novo cliente</option>
        </select>
      </div>
      {isNovo && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">
            Nome do cliente *
          </label>
          <input
            type="text"
            required
            value={clienteNome}
            onChange={(e) => onClienteNomeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Ex: Marcenaria Silva"
          />
        </div>
      )}
    </div>
  );
}
