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
        <label className="text-sm font-bold text-[#1e293b]">Data início *</label>
        <input
          type="date"
          required
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-[#1e293b]">Data fim *</label>
        <input
          type="date"
          required
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
        />
      </div>
    </div>
  );
}
