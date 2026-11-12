'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { mensagemDeErro, requisitar } from '@/lib/api';
import type { DashboardDados } from '@/lib/dashboard';
import { formatarData, formatarNumero } from '@/lib/formatos';
import { classesStatus, rotuloStatus } from '@/lib/status-projeto';
import { GraficoColunas, GraficoLinhas, GraficoRosca } from './_components/graficos';
import { CarregandoDashboard, Cartao, Painel, Vazio } from './_components/paineis';

const AVISO_ESTOQUE = {
  critico: 'Há itens em falta ou madeira insuficiente.',
  atencao: 'Há itens com estoque baixo.',
  ok: 'Estoque em dia.',
};

function hojePorExtenso() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardDados | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitar<DashboardDados>('/api/dashboard')
      .then(setDados)
      .catch((falha) => setErro(mensagemDeErro(falha)));
  }, []);

  return (
    <AppShell
      active="dashboard"
      canvas
      header={
        <PageHeader
          title="Visão Geral"
          subtitle="Acompanhe o que está em produção, os prazos e os alertas."
          action={<div className="text-muted text-sm">{hojePorExtenso()}</div>}
        />
      }
    >
      {erro ? (
        <div className="border-danger bg-danger-soft text-danger border px-6 py-8 text-sm">
          {erro}
        </div>
      ) : !dados ? (
        <CarregandoDashboard />
      ) : (
        <Conteudo dados={dados} />
      )}
    </AppShell>
  );
}

function Conteudo({ dados }: { dados: DashboardDados }) {
  const { resumo } = dados;
  const madeira = `${formatarNumero(resumo.madeiraAtiva)} m²`;
  const estoque = `${formatarNumero(resumo.madeiraEstoque ?? 0)} m²`;
  const temEstoque = resumo.madeiraEstoque !== null;
  const madeiraEstoque = resumo.madeiraEstoque ?? 0;
  const faltaMadeira = temEstoque && resumo.madeiraAtiva > madeiraEstoque;
  const usoDoEstoque =
    madeiraEstoque > 0
      ? (resumo.madeiraAtiva / madeiraEstoque) * 100
      : resumo.madeiraAtiva > 0
        ? 100
        : 0;

  let detalheMadeira = 'Somando os projetos ativos.';
  if (temEstoque) {
    detalheMadeira =
      madeiraEstoque > 0
        ? `${formatarNumero(usoDoEstoque, 0)}% dos ${estoque} em estoque`
        : 'Sem madeira no estoque.';
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${dados.podeVerEstoque ? 'lg:grid-cols-3 xl:grid-cols-5' : 'xl:grid-cols-4'}`}
      >
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
        <Cartao
          titulo="Madeira em uso"
          valor={madeira}
          detalhe={detalheMadeira}
          href={dados.podeVerEstoque ? '/estoque' : '/projetos'}
          destaque={faltaMadeira}
          progresso={temEstoque ? usoDoEstoque : undefined}
        />
        {dados.podeVerEstoque ? (
          <Cartao
            titulo="Alertas de estoque"
            valor={String(resumo.alertasEstoque ?? 0)}
            detalhe={AVISO_ESTOQUE[resumo.nivelEstoque ?? 'ok']}
            href="/estoque"
            destaque={
              resumo.nivelEstoque === 'critico' || resumo.nivelEstoque === 'atencao'
            }
          />
        ) : null}
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
            itens={dados.meses.map((mes) => ({ rotulo: mes.rotulo, valor: mes.madeira }))}
          />
          <div className="border-line text-muted mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t pt-4 text-sm">
            <span>
              Em uso <strong className="text-ink font-medium">{madeira}</strong>
            </span>
            {resumo.madeiraEstoque !== null ? (
              <span>
                No estoque <strong className="text-ink font-medium">{estoque}</strong>
              </span>
            ) : null}
          </div>
        </Painel>
      </div>

      <Painel titulo="Projetos por mês">
        <GraficoLinhas
          rotulos={dados.meses.map((mes) => mes.rotulo)}
          series={[
            {
              nome: 'Iniciados',
              cor: 'var(--ink)',
              valores: dados.meses.map((mes) => mes.iniciados),
            },
            {
              nome: 'Finalizados',
              cor: 'var(--accent)',
              valores: dados.meses.map((mes) => mes.finalizados),
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
              <li key={projeto.id} className="flex items-center gap-4 py-4 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate text-sm">{projeto.nome}</p>
                  <p className="text-faint mt-0.5 truncate text-xs">
                    {projeto.codigo}
                    {projeto.clienteNome ? ` · ${projeto.clienteNome}` : ''} ·{' '}
                    {formatarData(projeto.criadoEm)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${classesStatus(projeto.status)}`}
                >
                  {rotuloStatus(projeto.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Painel>
    </div>
  );
}
