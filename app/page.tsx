'use client';

import { AlertCircle, Clock, FolderKanban } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';

export default function Dashboard() {
  return (
    <AppShell
      active="dashboard"
      header={
        <PageHeader
          title="Visão Geral"
          action={
            <div className="text-sm text-[#64748b]">
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
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-start gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6">
          <div className="rounded-lg bg-orange-100 p-3">
            <FolderKanban className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Projetos em Andamento</p>
            <h3 className="mt-1 text-2xl font-bold text-[#1e293b]">0</h3>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6">
          <div className="rounded-lg bg-red-100 p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Alertas de Estoque</p>
            <h3 className="mt-1 text-2xl font-bold text-[#1e293b]">0</h3>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6">
          <div className="rounded-lg bg-blue-100 p-3">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Entregas Próximas</p>
            <h3 className="mt-1 text-2xl font-bold text-[#1e293b]">0</h3>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#1e293b]">Atividades Recentes</h2>
        <div className="py-10 text-center text-[#64748b]">
          <p>Os gráficos e listagens recentes aparecerão aqui.</p>
        </div>
      </div>
    </AppShell>
  );
}
