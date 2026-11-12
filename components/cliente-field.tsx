import { Campo, classeCampo } from '@/components/campo';
import type { ClienteResumo } from '@/lib/types';

export const NOVO_CLIENTE = '__new__';

type ClienteFieldProps = {
  clientes: ClienteResumo[];
  clienteId: string;
  clienteNome: string;
  onClienteIdChange: (valor: string) => void;
  onClienteNomeChange: (valor: string) => void;
};

export function ClienteField({
  clientes,
  clienteId,
  clienteNome,
  onClienteIdChange,
  onClienteNomeChange,
}: ClienteFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <Campo rotulo="Cliente *">
        <select
          required
          value={clienteId}
          onChange={(e) => onClienteIdChange(e.target.value)}
          className={classeCampo}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
          <option value={NOVO_CLIENTE}>Cadastrar novo cliente</option>
        </select>
      </Campo>
      {clienteId === NOVO_CLIENTE && (
        <Campo rotulo="Nome do cliente *">
          <input
            type="text"
            required
            value={clienteNome}
            onChange={(e) => onClienteNomeChange(e.target.value)}
            className={classeCampo}
            placeholder="Ex: Marcenaria Silva"
          />
        </Campo>
      )}
    </div>
  );
}

export function dadosDoCliente(clienteId: string, clienteNome: string) {
  return clienteId === NOVO_CLIENTE ? { clienteNome } : { clienteId };
}
