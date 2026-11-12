import { classeBotao, classeBotaoSecundario } from '@/components/campo';

export function Erro({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <p className="border-danger bg-danger-soft text-danger rounded-lg border px-3 py-2 text-sm font-medium">
      {texto}
    </p>
  );
}

export function Rodape({
  textoSalvar,
  salvando,
  onCancelar,
}: {
  textoSalvar: string;
  salvando: boolean;
  onCancelar: () => void;
}) {
  return (
    <div className="border-line flex flex-wrap justify-end gap-3 border-t pt-5">
      <button type="button" onClick={onCancelar} className={classeBotaoSecundario}>
        Cancelar
      </button>
      <button type="submit" disabled={salvando} className={classeBotao}>
        {salvando ? 'Salvando...' : textoSalvar}
      </button>
    </div>
  );
}
