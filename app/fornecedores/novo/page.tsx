'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { requisitar } from '@/lib/api';
import { useExigirPermissao } from '@/lib/current-user';
import { FORNECEDOR_VAZIO, FornecedorForm } from '../_components/fornecedor-form';

export default function NovoFornecedorPage() {
  useExigirPermissao('fornecedores', 'escrever');
  const router = useRouter();

  return (
    <AppShell
      active="fornecedores"
      header={
        <PageHeader
          title="Novo Fornecedor"
          subtitle="Informe os dados de contato, endereço e produtos fornecidos."
        />
      }
    >
      <div className="border-line bg-surface overflow-hidden rounded-xl border p-4 sm:p-6">
        <h2 className="text-ink mb-6 text-lg leading-7 font-bold">Dados do Fornecedor</h2>
        <FornecedorForm
          inicial={FORNECEDOR_VAZIO}
          onCancelar={() => router.push('/fornecedores')}
          onSalvar={async (dados) => {
            await requisitar('/api/fornecedores', 'POST', dados);
            router.push('/fornecedores');
          }}
        />
      </div>
    </AppShell>
  );
}
