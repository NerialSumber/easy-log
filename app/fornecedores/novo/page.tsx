'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { useExigirPermissao } from '@/lib/current-user';
import { formatarTelefone, validarContato } from '@/lib/contato';

export default function NovoFornecedor() {
  useExigirPermissao('fornecedores', 'escrever');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [produtos, setProdutos] = useState<string[]>([]);
  const [novoProduto, setNovoProduto] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async (event: FormEvent) => {
    event.preventDefault();
    const erroContato = validarContato(telefone, email);
    if (erroContato) {
      alert(erroContato);
      return;
    }
    setSalvando(true);
    try {
      const response = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, email, endereco, produto: produtos }),
      });
      if (response.ok) {
        window.location.href = '/fornecedores';
      } else {
        const data = (await response.json()) as { error?: string };
        alert(data.error || 'Não foi possível salvar o fornecedor.');
      }
    } catch {
      alert('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setSalvando(false);
    }
  };

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
      <div className="border-line bg-surface overflow-hidden rounded-xl border">
        <div className="p-6">
          <h2 className="text-ink text-lg leading-7 font-bold">Dados do Fornecedor</h2>
        </div>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4 p-6 pt-0">
          <div className="flex flex-col gap-2">
            <label className="text-ink text-sm font-bold">Nome *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-ink text-sm font-bold">Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(event) => setTelefone(formatarTelefone(event.target.value))}
                className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-ink text-sm font-bold">E-mail</label>
              <input
                type="email"
                required={!telefone}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-ink text-sm font-bold">Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={(event) => setEndereco(event.target.value)}
              className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-ink text-sm font-bold">Produtos fornecidos</label>
            <div className="flex flex-wrap gap-2">
              {produtos.map((produto) => (
                <span
                  key={produto}
                  className="bg-danger-soft text-danger inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {produto}
                  <button
                    type="button"
                    onClick={() =>
                      setProdutos(produtos.filter((item) => item !== produto))
                    }
                    className="text-accent"
                    aria-label={`Remover ${produto}`}
                  >
                    <span aria-hidden="true">x</span>
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={novoProduto}
              onChange={(event) => setNovoProduto(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && novoProduto.trim()) {
                  event.preventDefault();
                  const produto = novoProduto.trim();
                  if (!produtos.includes(produto)) setProdutos([...produtos, produto]);
                  setNovoProduto('');
                }
              }}
              className="border-line bg-soft focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              placeholder="Digite um produto e pressione Enter"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/fornecedores"
              className="bg-soft text-muted hover:bg-soft rounded-lg px-6 py-3 text-sm font-bold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="bg-accent-fill text-on-accent flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold disabled:opacity-60"
            >
              <Save className="size-4" />
              {salvando ? 'Salvando...' : 'Salvar Fornecedor'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
