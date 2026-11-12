'use client';

import { useEffect, useRef, useState } from 'react';
import { formatarNumero } from '@/lib/formatos';

type Ponto = {
  rotulo: string;
  valor: number;
  cor?: string;
};

function capitalizar(texto: string) {
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
    <div className="flex flex-wrap items-center justify-center gap-8">
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
          fontSize="24"
          className="text-ink fill-current font-medium"
        >
          {total}
        </text>
        <text
          x={centro}
          y={centro + 18}
          textAnchor="middle"
          fontSize="11"
          className="text-muted fill-current"
        >
          {legendaCentro}
        </text>
      </svg>

      <ul className="flex min-w-0 flex-1 basis-48 flex-col gap-3">
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
  const comUnidade = (valor: number) =>
    `${formatarNumero(valor)}${unidade ? ` ${unidade}` : ''}`;

  return (
    <div
      role="img"
      aria-label={itens
        .map((item) => `${item.rotulo}: ${comUnidade(item.valor)}`)
        .join(', ')}
    >
      <div className="flex h-48 items-end gap-3">
        {itens.map((item) => {
          const altura = item.valor <= 0 ? 0 : Math.max((item.valor / maximo) * 100, 6);
          return (
            <div
              key={item.rotulo}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="text-muted mb-2 text-xs tabular-nums">
                {formatarNumero(item.valor)}
              </span>
              <div
                className="bg-ink w-full max-w-9"
                style={{ height: `${altura}%` }}
                title={`${capitalizar(item.rotulo)}: ${comUnidade(item.valor)}`}
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

function useLargura<T extends HTMLElement>(inicial: number) {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(inicial);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      setLargura(Math.max(Math.round(entrada.contentRect.width), 240));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return [ref, largura] as const;
}

export function GraficoLinhas({
  rotulos,
  series,
}: {
  rotulos: string[];
  series: SerieLinha[];
}) {
  const [ref, largura] = useLargura<HTMLDivElement>(720);
  const altura = 260;
  const margem = { topo: 18, direita: 16, base: 40, esquerda: 44 };
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
    <div ref={ref}>
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
        width={largura}
        height={altura}
        className="block max-w-full"
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
              className="text-faint fill-current text-xs"
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
            y={altura - 12}
            textAnchor="middle"
            className="text-muted fill-current text-xs capitalize"
          >
            {rotulo}
          </text>
        ))}
      </svg>
    </div>
  );
}
