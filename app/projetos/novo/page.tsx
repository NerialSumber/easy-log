'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Users,
  Truck,
  LogOut,
  ArrowLeft,
  Save,
  ClipboardList,
} from 'lucide-react';
import { ClienteField } from '@/components/cliente-field';
import { useCurrentUser } from '@/lib/current-user';
import type { ClienteResumo } from '@/lib/types';

export default function NovoProjeto() {
  const router = useRouter();
  const userData = useCurrentUser();

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [qtdeMadeira, setQtdeMadeira] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/clientes', { cache: 'no-store' })
      .then(async (res) => {
        const data: unknown = await res.json();
        if (!cancelled && res.ok && Array.isArray(data)) {
          setClientes(data as ClienteResumo[]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClientes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSalvarProjeto = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const response = await fetch('/api/projetos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo,
          nome,
          qtdeMadeira,
          clienteId: clienteId === '__new__' ? undefined : clienteId,
          clienteNome: clienteId === '__new__' ? clienteNome : undefined,
        }),
      });

      if (response.ok) {
        router.push('/projetos');
      } else {
        const errorData = (await response.json()) as { error?: string };
        alert(`Erro do servidor: ${errorData.error || 'Não foi possível salvar.'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="hidden w-64 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 p-6">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-white">Easy-Log</span>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link
            href="/projetos"
            className="flex items-center gap-3 rounded-lg border-l-4 border-orange-600 bg-slate-800 px-4 py-3 text-white"
          >
            <FolderKanban className="h-5 w-5 text-orange-500" /> Projetos
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <Package className="h-5 w-5" /> Estoque
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <Users className="h-5 w-5" /> Clientes
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <Truck className="h-5 w-5" /> Fornecedores
          </Link>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                {userData.iniciais}
              </div>
              <div className="flex flex-col">
                <span className="text-sm leading-tight font-medium text-white">
                  {userData.nome}
                </span>
                <span className="text-xs text-slate-400">{userData.role}</span>
              </div>
            </div>
            <Link
              href="/login"
              onClick={() => localStorage.removeItem('current_user')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-500"
              aria-label="Sair do sistema"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-8 py-5">
          <Link
            href="/projetos"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-orange-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Novo Projeto</h1>
            <p className="text-sm text-slate-500">
              Informe o cliente, o código e os dados iniciais do projeto.
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-6">
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Detalhes do Projeto</h2>
            </div>

            <form onSubmit={handleSalvarProjeto} className="space-y-6 p-6">
              <ClienteField
                clientes={clientes}
                clienteId={clienteId}
                clienteNome={clienteNome}
                onClienteIdChange={(value) => {
                  setClienteId(value);
                  setClienteNome('');
                }}
                onClienteNomeChange={setClienteNome}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="PRJ-001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Armário Planejado"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Qtd. Madeira (m²) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={qtdeMadeira}
                    onChange={(e) => setQtdeMadeira(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <Link
                  href="/projetos"
                  className="rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {salvando ? 'Salvando...' : 'Salvar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
