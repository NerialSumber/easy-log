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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-ink text-sm font-bold">Cliente *</label>
        <select
          required
          value={clienteId}
          onChange={(e) => onClienteIdChange(e.target.value)}
          className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 font-medium outline-none focus:ring-2"
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
        <div className="flex flex-col gap-2">
          <label className="text-ink text-sm font-bold">Nome do cliente *</label>
          <input
            type="text"
            required
            value={clienteNome}
            onChange={(e) => onClienteNomeChange(e.target.value)}
            className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
            placeholder="Ex: Marcenaria Silva"
          />
        </div>
      )}
    </div>
  );
}
