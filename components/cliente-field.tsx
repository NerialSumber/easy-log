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
        <label className="text-sm font-bold text-[#1e293b]">Cliente *</label>
        <select
          required
          value={clienteId}
          onChange={(e) => onClienteIdChange(e.target.value)}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
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
          <label className="text-sm font-bold text-[#1e293b]">Nome do cliente *</label>
          <input
            type="text"
            required
            value={clienteNome}
            onChange={(e) => onClienteNomeChange(e.target.value)}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
            placeholder="Ex: Marcenaria Silva"
          />
        </div>
      )}
    </div>
  );
}
