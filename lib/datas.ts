export function formatarData(iso: string | null | undefined) {
  if (!iso) {
    return '—';
  }

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR').format(data);
}

export function formatarPeriodo(
  inicio: string | null | undefined,
  fim: string | null | undefined,
) {
  if (!inicio && !fim) {
    return '—';
  }

  if (inicio && fim) {
    return `${formatarData(inicio)} — ${formatarData(fim)}`;
  }

  return formatarData(inicio ?? fim);
}

export function toInputDate(iso: string | null | undefined) {
  if (!iso) {
    return '';
  }

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return '';
  }

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
