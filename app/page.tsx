'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { GraficoColunas, GraficoLinhas, GraficoRosca } from '@/components/graficos';
import { PageHeader } from '@/components/page-header';
import type { DashboardDados } from '@/lib/dashboard';
import { formatarData } from '@/lib/datas';
import { classesStatusTabela, rotuloStatus } from '@/lib/status-projeto';

function formatarMadeira(valor: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor);
}

function Cartao({
  titulo,
  valor,
  detalhe,
  href,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
  href: string;
  destaque?: boolean;
}) {
  return (
    <Link
      href={href}
      className="border-line bg-surface flex h-full flex-col border px-5 py-5"
    >
      <p className="text-muted text-sm">{titulo}</p>
      <p
        className={`mt-4 text-3xl font-medium tabular-nums ${destaque ? 'text-danger' : 'text-ink'}`}
      >
        {valor}
      </p>
      {detalhe ? <p className="text-faint mt-2 text-sm leading-5">{detalhe}</p> : null}
    </Link>
  );
}

function Painel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-line bg-surface flex h-full flex-col border p-6">
      <h2 className="text-ink text-base font-medium">{titulo}</h2>
      <div className="mt-6 flex-1">{children}</div>
    </section>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="flex h-full min-h-36 items-center justify-center px-6 py-8 text-center">
      <p className="text-muted max-w-xs text-sm leading-5">{texto}</p>
    </div>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState<DashboardDados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelado = false;

    fetch('/api/dashboard', { cache: 'no-store' })
      .then(async (res) => {
        const corpo: unknown = await res.json();
        if (!res.ok) {
          const mensagem =
            corpo && typeof corpo === 'object' && 'error' in corpo
              ? String((corpo as { error?: string }).error)
              : 'Não foi possível carregar o dashboard.';
          throw new Error(mensagem);
        }
        return corpo as DashboardDados;
      })
      .then((corpo) => {
        if (!cancelado) setDados(corpo);
      })
      .catch((error: unknown) => {
        if (!cancelado) {
          setErro(
            error instanceof Error ? error.message : 'Erro ao carregar o dashboard.',
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const resumo = dados?.resumo;

  return (
    <AppShell
      active="dashboard"
      canvas
      header={
        <PageHeader
          title="Visão Geral"
          subtitle="Acompanhe o que está em produção, os prazos e os alertas."
          action={
            <div className="text-muted text-sm">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          }
        />
      }
    >
      {carregando ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, indice) => (
              <div
                key={indice}
                className="border-line bg-surface h-32 animate-pulse border"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="border-line bg-surface h-72 animate-pulse border" />
            <div className="border-line bg-surface h-72 animate-pulse border" />
          </div>
        </div>
      ) : erro || !dados || !resumo ? (
        <div className="border-danger bg-danger-soft text-danger border px-6 py-8 text-sm">
          {erro || 'Não foi possível carregar o dashboard.'}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Cartao
              titulo="Projetos ativos"
              valor={String(resumo.ativos)}
              detalhe={`${resumo.emAndamento} em execução · ${resumo.abertos} abertos`}
              href="/projetos"
            />
            <Cartao
              titulo="Atrasados"
              valor={String(resumo.atrasados)}
              href="/projetos"
              destaque={resumo.atrasados > 0}
            />
            <Cartao
              titulo="Entregas próximas"
              valor={String(resumo.entregasProximas)}
              href="/projetos"
            />
            {dados.podeVerEstoque ? (
              <Cartao
                titulo="Alertas de estoque"
                valor={String(resumo.alertasEstoque ?? 0)}
                detalhe={
                  resumo.nivelEstoque === 'critico'
                    ? `Sem madeira suficiente. Estoque ${formatarMadeira(resumo.madeiraEstoque ?? 0)} m² · projetos ${formatarMadeira(resumo.madeiraAtiva)} m²`
                    : resumo.nivelEstoque === 'atencao'
                      ? `Estoque baixo. Estoque ${formatarMadeira(resumo.madeiraEstoque ?? 0)} m² · projetos ${formatarMadeira(resumo.madeiraAtiva)} m²`
                      : `Estoque ${formatarMadeira(resumo.madeiraEstoque ?? 0)} m² · projetos ${formatarMadeira(resumo.madeiraAtiva)} m²`
                }
                href="/estoque"
                destaque={
                  resumo.nivelEstoque === 'critico' || resumo.nivelEstoque === 'atencao'
                }
              />
            ) : (
              <Cartao
                titulo="Madeira em uso"
                valor={`${formatarMadeira(resumo.madeiraAtiva)} m²`}
                href="/projetos"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <Painel titulo="Projetos por status">
              <GraficoRosca
                legendaCentro="projetos"
                itens={dados.porStatus.map((item) => ({
                  rotulo: item.rotulo,
                  valor: item.quantidade,
                  cor: item.cor,
                }))}
              />
            </Painel>

            <Painel titulo="Madeira por mês">
              <GraficoColunas
                unidade="m²"
                itens={dados.madeiraPorMes.map((mes) => ({
                  rotulo: mes.rotulo,
                  valor: mes.madeira,
                }))}
              />
              <div className="border-line text-muted mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t pt-4 text-sm">
                <span>
                  Em uso{' '}
                  <strong className="text-ink font-medium">
                    {formatarMadeira(resumo.madeiraAtiva)} m²
                  </strong>
                </span>
                {resumo.madeiraEstoque !== null ? (
                  <span>
                    No estoque{' '}
                    <strong className="text-ink font-medium">
                      {formatarMadeira(resumo.madeiraEstoque)} m²
                    </strong>
                  </span>
                ) : null}
              </div>
            </Painel>
          </div>

          <Painel titulo="Projetos por mês">
            <GraficoLinhas
              rotulos={dados.projetosPorMes.map((mes) => mes.rotulo)}
              series={[
                {
                  nome: 'Iniciados',
                  cor: 'var(--ink)',
                  valores: dados.projetosPorMes.map((mes) => mes.iniciados),
                },
                {
                  nome: 'Finalizados',
                  cor: 'var(--accent)',
                  valores: dados.projetosPorMes.map((mes) => mes.finalizados),
                },
              ]}
            />
          </Painel>

          <Painel titulo="Alertas">
            {dados.alertas.length === 0 ? (
              <Vazio texto="Nenhum alerta no momento. Prazos e estoque estão em dia." />
            ) : (
              <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
                {dados.alertas.map((alerta) => (
                  <li key={alerta.id}>
                    <Link
                      href={alerta.href}
                      className={`border-line flex items-start gap-3 border-y border-r border-l-2 px-4 py-3 ${
                        alerta.nivel === 'critico'
                          ? 'border-l-accent! bg-danger-soft'
                          : 'border-l-ink! bg-signal-soft'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block text-sm leading-5">
                          {alerta.titulo}
                        </span>
                        {alerta.detalhe ? (
                          <span className="text-muted mt-0.5 block text-sm leading-5">
                            {alerta.detalhe}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight className="text-faint mt-0.5 size-4 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Painel>

          <Painel titulo="Atividades recentes">
            {dados.recentes.length === 0 ? (
              <Vazio texto="Nenhum projeto cadastrado ainda." />
            ) : (
              <ul className="divide-line divide-y">
                {dados.recentes.map((projeto) => (
                  <li
                    key={projeto.id}
                    className="flex items-center gap-4 py-4 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-ink truncate text-sm">{projeto.nome}</p>
                      <p className="text-faint mt-0.5 truncate text-xs">
                        {projeto.codigo}
                        {projeto.clienteNome ? ` · ${projeto.clienteNome}` : ''} ·{' '}
                        {formatarData(projeto.criadoEm)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${classesStatusTabela(projeto.status)}`}
                    >
                      {rotuloStatus(projeto.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Painel>
        </div>
      )}
    </AppShell>
  );
}
