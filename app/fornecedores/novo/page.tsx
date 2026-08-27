'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { formatarTelefone, validarContato } from '@/lib/contato';

export default function NovoFornecedor() {
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
      <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
        <div className="p-6">
          <h2 className="text-lg leading-7 font-bold text-[#1e293b]">
            Dados do Fornecedor
          </h2>
        </div>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4 p-6 pt-0">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1e293b]">Nome *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#1e293b]">Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(event) => setTelefone(formatarTelefone(event.target.value))}
                className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#1e293b]">E-mail</label>
              <input
                type="email"
                required={!telefone}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1e293b]">Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={(event) => setEndereco(event.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1e293b]">
              Produtos fornecidos
            </label>
            <div className="flex flex-wrap gap-2">
              {produtos.map((produto) => (
                <span
                  key={produto}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                >
                  {produto}
                  <button
                    type="button"
                    onClick={() =>
                      setProdutos(produtos.filter((item) => item !== produto))
                    }
                    className="text-orange-700"
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
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]"
              placeholder="Digite um produto e pressione Enter"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/fornecedores"
              className="rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-lg bg-[#ea580c] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
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
