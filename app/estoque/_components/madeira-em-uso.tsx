import { BarraProgresso } from '@/components/barra-progresso';
import { formatarNumero } from '@/lib/formatos';

type MadeiraEmUsoProps = {
  emUso: number;
  projetos: number;
  emEstoque: number;
};

function Numero({
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <p className="text-muted text-sm">{rotulo}</p>
      <p
        className={`mt-1 text-2xl font-medium tabular-nums ${destaque ? 'text-danger' : 'text-ink'}`}
      >
        {valor}
      </p>
      {detalhe ? <p className="text-faint mt-0.5 text-xs">{detalhe}</p> : null}
    </div>
  );
}

export function MadeiraEmUso({ emUso, projetos, emEstoque }: MadeiraEmUsoProps) {
  const saldo = Math.round((emEstoque - emUso) * 100) / 100;
  const falta = saldo < 0;
  const percentual = emEstoque > 0 ? (emUso / emEstoque) * 100 : emUso > 0 ? 100 : 0;

  let resumo = 'Não há madeira no estoque.';
  if (emEstoque > 0) {
    resumo = falta
      ? 'Os projetos ativos precisam de mais madeira do que há no estoque.'
      : `${formatarNumero(percentual, 0)}% da madeira do estoque está reservada para projetos ativos.`;
  }

  return (
    <section className="border-line bg-surface rounded-xl border p-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Numero
          rotulo="Em uso agora"
          valor={`${formatarNumero(emUso)} m²`}
          detalhe={`${projetos} ${projetos === 1 ? 'projeto ativo' : 'projetos ativos'}`}
        />
        <Numero rotulo="No estoque" valor={`${formatarNumero(emEstoque)} m²`} />
        <Numero
          rotulo={falta ? 'Faltam' : 'Livre'}
          valor={`${formatarNumero(Math.abs(saldo))} m²`}
          destaque={falta}
        />
      </div>
      <BarraProgresso percentual={percentual} alerta={falta} className="mt-5" />
      <p className={`mt-2 text-xs ${falta ? 'text-danger' : 'text-faint'}`}>{resumo}</p>
    </section>
  );
}
