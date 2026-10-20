type PeriodoFieldProps = {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (value: string) => void;
  onDataFimChange: (value: string) => void;
};

export function PeriodoField({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
}: PeriodoFieldProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="text-ink text-sm font-bold">Data início *</label>
        <input
          type="date"
          required
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
          className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-ink text-sm font-bold">Data fim *</label>
        <input
          type="date"
          required
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
          className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>
    </div>
  );
}
