import { Campo, classeCampo } from '@/components/campo';
import { formatarNumero } from '@/lib/formatos';
import type { MadeiraOpcao } from '@/lib/types';

type MadeiraFieldProps = {
  madeiras: MadeiraOpcao[];
  madeiraId: string;
  qtdeMadeira: string;
  bloqueado?: boolean;
  onMadeiraIdChange: (valor: string) => void;
  onQtdeMadeiraChange: (valor: string) => void;
};

export function MadeiraField({
  madeiras,
  madeiraId,
  qtdeMadeira,
  bloqueado = false,
  onMadeiraIdChange,
  onQtdeMadeiraChange,
}: MadeiraFieldProps) {
  const usaMadeira = Number(qtdeMadeira) > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo rotulo={usaMadeira ? 'Tipo de madeira *' : 'Tipo de madeira'}>
          <select
            required={usaMadeira}
            disabled={bloqueado}
            value={madeiraId}
            onChange={(e) => onMadeiraIdChange(e.target.value)}
            className={classeCampo}
          >
            <option value="">
              {madeiras.length ? 'Selecione a madeira' : 'Nenhuma madeira no estoque'}
            </option>
            {madeiras.map((madeira) => (
              <option key={madeira.id} value={madeira.id}>
                {madeira.nome} · {formatarNumero(madeira.quantidade)} m² no estoque
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Qtd. de madeira (m²) *">
          <input
            type="number"
            min="0"
            step="0.01"
            required
            disabled={bloqueado}
            value={qtdeMadeira}
            onChange={(e) => onQtdeMadeiraChange(e.target.value)}
            className={classeCampo}
            placeholder="0.00"
          />
        </Campo>
      </div>
      <p className="text-faint text-xs">
        {bloqueado
          ? 'Projeto concluído: esta madeira já foi descontada do estoque.'
          : 'A quantidade é descontada do estoque dessa madeira quando o projeto for concluído.'}
      </p>
    </div>
  );
}
