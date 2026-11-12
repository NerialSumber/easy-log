import { Campo, classeCampo } from '@/components/campo';

type PeriodoFieldProps = {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (valor: string) => void;
  onDataFimChange: (valor: string) => void;
};

export function PeriodoField({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
}: PeriodoFieldProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Campo rotulo="Data início *">
        <input
          type="date"
          required
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
          className={classeCampo}
        />
      </Campo>
      <Campo rotulo="Data fim *">
        <input
          type="date"
          required
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
          className={classeCampo}
        />
      </Campo>
    </div>
  );
}
