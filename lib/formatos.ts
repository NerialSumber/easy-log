function lerData(iso: string | null | undefined) {
  if (!iso) return null;
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarData(iso: string | null | undefined) {
  const data = lerData(iso);
  return data ? new Intl.DateTimeFormat('pt-BR').format(data) : '—';
}

export function formatarPeriodo(
  inicio: string | null | undefined,
  fim: string | null | undefined,
) {
  if (inicio && fim) return `${formatarData(inicio)} — ${formatarData(fim)}`;
  return formatarData(inicio ?? fim);
}

export function paraInputData(iso: string | null | undefined) {
  const data = lerData(iso);
  if (!data) return '';
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function formatarNumero(valor: number, casasFixas?: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasFixas ?? 0,
    maximumFractionDigits: casasFixas ?? 2,
  }).format(valor);
}
