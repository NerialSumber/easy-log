type Ponto = {
  rotulo: string;
  valor: number;
  cor?: string;
};

function formatarPadrao(valor: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(valor);
}

function capitalizar(texto: string) {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function GraficoRosca({
  itens,
  legendaCentro,
}: {
  itens: Ponto[];
  legendaCentro: string;
}) {
  const total = itens.reduce((soma, item) => soma + item.valor, 0);
  const tamanho = 176;
  const centro = tamanho / 2;
  const raio = 68;
  const circunferencia = 2 * Math.PI * raio;
  const visiveis = itens.filter((item) => item.valor > 0);
  const folga = visiveis.length > 1 ? 4 : 0;
  let percorrido = 0;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
      <svg
        viewBox={`0 0 ${tamanho} ${tamanho}`}
        className="size-44 shrink-0"
        role="img"
        aria-label={itens.map((item) => `${item.rotulo}: ${item.valor}`).join(', ')}
      >
        <circle
          cx={centro}
          cy={centro}
          r={raio}
          fill="none"
          stroke="currentColor"
          className="text-line"
          strokeWidth="16"
        />
        {total > 0
          ? visiveis.map((item) => {
              const fatia = (item.valor / total) * circunferencia;
              const comprimento = Math.max(fatia - folga, 1);
              const circulo = (
                <circle
                  key={item.rotulo}
                  cx={centro}
                  cy={centro}
                  r={raio}
                  fill="none"
                  stroke={item.cor ?? 'var(--ink)'}
                  strokeWidth="16"
                  strokeLinecap="butt"
                  strokeDasharray={`${comprimento} ${circunferencia - comprimento}`}
                  strokeDashoffset={-percorrido}
                  transform={`rotate(-90 ${centro} ${centro})`}
                />
              );
              percorrido += fatia;
              return circulo;
            })
          : null}
        <text
          x={centro}
          y={centro - 2}
          textAnchor="middle"
          className="text-ink fill-current text-2xl font-medium"
        >
          {total}
        </text>
        <text
          x={centro}
          y={centro + 18}
          textAnchor="middle"
          className="text-muted fill-current text-[11px]"
        >
          {legendaCentro}
        </text>
      </svg>

      <ul className="flex w-full flex-col gap-3">
        {itens.map((item) => {
          const percentual = total === 0 ? 0 : Math.round((item.valor / total) * 100);
          return (
            <li key={item.rotulo} className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.cor ?? 'var(--ink)' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-ink truncate text-sm">{item.rotulo}</span>
                  <span className="text-ink text-sm font-medium tabular-nums">
                    {item.valor}
                  </span>
                </div>
                <div className="bg-line mt-1.5 h-px overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentual}%`,
                      backgroundColor: item.cor ?? 'var(--ink)',
                    }}
                  />
                </div>
              </div>
              <span className="text-faint w-10 text-right text-xs tabular-nums">
                {percentual}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GraficoColunas({ itens, unidade }: { itens: Ponto[]; unidade?: string }) {
  const maximo = Math.max(...itens.map((item) => item.valor), 1);

  return (
    <div
      role="img"
      aria-label={itens
        .map(
          (item) =>
            `${item.rotulo}: ${formatarPadrao(item.valor)}${unidade ? ` ${unidade}` : ''}`,
        )
        .join(', ')}
    >
      <div className="flex h-48 items-end gap-3">
        {itens.map((item) => {
          const altura = item.valor <= 0 ? 0 : Math.max((item.valor / maximo) * 100, 6);
          const legenda = `${capitalizar(item.rotulo)}: ${formatarPadrao(item.valor)}${unidade ? ` ${unidade}` : ''}`;
          return (
            <div
              key={item.rotulo}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="text-muted mb-2 text-xs tabular-nums">
                {formatarPadrao(item.valor)}
              </span>
              <div
                className="bg-ink w-full max-w-9"
                style={{ height: `${altura}%` }}
                title={legenda}
              />
            </div>
          );
        })}
      </div>
      <div className="border-line mt-3 flex gap-3 border-t pt-2">
        {itens.map((item) => (
          <span
            key={item.rotulo}
            className="text-muted flex-1 text-center text-xs capitalize"
          >
            {item.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

type SerieLinha = {
  nome: string;
  cor: string;
  valores: number[];
};

function marcasEixo(maior: number) {
  if (maior <= 4) {
    return Array.from({ length: Math.max(maior, 1) + 1 }, (_, indice) => indice);
  }

  const passo = Math.ceil(maior / 4);
  return [0, passo, passo * 2, passo * 3, passo * 4];
}

function caminhoSuave(pontos: { x: number; y: number }[]) {
  if (pontos.length === 0) return '';
  if (pontos.length === 1) return `M ${pontos[0].x} ${pontos[0].y}`;

  let desenho = `M ${pontos[0].x} ${pontos[0].y}`;
  for (let indice = 0; indice < pontos.length - 1; indice += 1) {
    const atual = pontos[indice];
    const proximo = pontos[indice + 1];
    const meio = (atual.x + proximo.x) / 2;
    desenho += ` C ${meio} ${atual.y}, ${meio} ${proximo.y}, ${proximo.x} ${proximo.y}`;
  }
  return desenho;
}

export function GraficoLinhas({
  rotulos,
  series,
}: {
  rotulos: string[];
  series: SerieLinha[];
}) {
  const largura = 720;
  const altura = 260;
  const margem = { topo: 18, direita: 16, base: 36, esquerda: 36 };
  const maior = Math.max(0, ...series.flatMap((serie) => serie.valores));
  const marcas = marcasEixo(maior);
  const topo = Math.max(marcas[marcas.length - 1] ?? 1, 1);
  const areaLargura = largura - margem.esquerda - margem.direita;
  const areaAltura = altura - margem.topo - margem.base;
  const x = (indice: number) =>
    margem.esquerda +
    (rotulos.length <= 1
      ? areaLargura / 2
      : (indice / (rotulos.length - 1)) * areaLargura);
  const y = (valor: number) => margem.topo + areaAltura - (valor / topo) * areaAltura;
  const base = y(0);

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-2">
        {series.map((serie) => (
          <li key={serie.nome} className="text-muted flex items-center gap-2 text-sm">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: serie.cor }}
            />
            {serie.nome}
          </li>
        ))}
      </ul>
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="h-auto w-full"
        role="img"
        aria-label={series
          .map(
            (serie) =>
              `${serie.nome}: ${rotulos
                .map((rotulo, indice) => `${rotulo} ${serie.valores[indice] ?? 0}`)
                .join(', ')}`,
          )
          .join('. ')}
      >
        {marcas.map((marca) => (
          <g key={marca}>
            <line
              x1={margem.esquerda}
              x2={largura - margem.direita}
              y1={y(marca)}
              y2={y(marca)}
              stroke="currentColor"
              className="text-line"
            />
            <text
              x={margem.esquerda - 10}
              y={y(marca) + 4}
              textAnchor="end"
              fontSize="12"
              className="text-faint fill-current"
            >
              {marca}
            </text>
          </g>
        ))}
        {series.map((serie) => {
          const pontos = serie.valores.map((valor, indice) => ({
            x: x(indice),
            y: y(valor),
          }));
          const linha = caminhoSuave(pontos);
          const area =
            pontos.length > 1
              ? `${linha} L ${pontos[pontos.length - 1].x} ${base} L ${pontos[0].x} ${base} Z`
              : '';
          return (
            <g key={serie.nome}>
              {area ? <path d={area} fill={serie.cor} opacity="0.12" /> : null}
              <path
                d={linha}
                fill="none"
                stroke={serie.cor}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {pontos.map((ponto, indice) => (
                <circle
                  key={`${serie.nome}-${rotulos[indice]}`}
                  cx={ponto.x}
                  cy={ponto.y}
                  r="4.5"
                  fill="var(--surface)"
                  stroke={serie.cor}
                  strokeWidth="2.5"
                >
                  <title>{`${serie.nome} em ${capitalizar(rotulos[indice] ?? '')}: ${serie.valores[indice] ?? 0}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        {rotulos.map((rotulo, indice) => (
          <text
            key={rotulo}
            x={x(indice)}
            y={altura - 10}
            textAnchor="middle"
            fontSize="12"
            className="text-muted fill-current capitalize"
          >
            {rotulo}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function GraficoBarras({ itens }: { itens: Ponto[] }) {
  const maximo = Math.max(...itens.map((item) => item.valor), 1);

  return (
    <ol
      className="flex flex-col gap-2"
      aria-label={itens.map((item) => `${item.rotulo}: ${item.valor}`).join(', ')}
    >
      {itens.map((item, indice) => {
        const lider = indice === 0;
        const largura = Math.max((item.valor / maximo) * 100, item.valor > 0 ? 8 : 0);

        return (
          <li key={item.rotulo} className="flex items-center gap-4 py-2">
            <span
              className={`w-4 text-sm tabular-nums ${lider ? 'text-accent' : 'text-faint'}`}
            >
              {indice + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-ink truncate text-sm">{item.rotulo}</span>
                <span className="text-muted shrink-0 text-sm tabular-nums">
                  {item.valor} {item.valor === 1 ? 'vez' : 'vezes'}
                </span>
              </div>
              <div className="bg-line mt-2 h-px">
                <div
                  className={`h-px ${lider ? 'bg-accent' : 'bg-ink'}`}
                  style={{ width: `${largura}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
