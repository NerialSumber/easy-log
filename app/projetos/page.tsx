'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Users,
  Truck,
  Plus,
  Pencil,
  Trash2,
  Search,
  LogOut,
  X,
  Save,
} from 'lucide-react';

type UserDataType = { nome: string; role: string; iniciais: string };

export default function ProjetosCRUD() {
  const [userData, setUserData] = useState<UserDataType>({
    nome: 'Carregando...',
    role: 'Aguarde',
    iniciais: '--',
  });

  const [projetos, setProjetos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const partesNome = (parsedUser.nome || 'Usuário').trim().split(' ');
      let iniciais = 'US';
      if (partesNome.length >= 2)
        iniciais = (
          partesNome[0][0] + partesNome[partesNome.length - 1][0]
        ).toUpperCase();
      else if (partesNome[0].length >= 2)
        iniciais = partesNome[0].substring(0, 2).toUpperCase();
      else iniciais = partesNome[0].toUpperCase();
      setUserData({
        nome: parsedUser.nome || 'Usuário',
        role: parsedUser.role || 'Administrador',
        iniciais,
      });
    }

    fetchProjetos();
  }, []);

  const fetchProjetos = async () => {
    try {
      // O 'no-store' força o Next.js a sempre buscar do banco real, matando o cache
      const res = await fetch('/api/projetos', { cache: 'no-store' });
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setProjetos(data);
      } else {
        setProjetos([]);
      }
    } catch (error) {
      setProjetos([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        const res = await fetch(`/api/projetos/${id}`, { method: 'DELETE' });

        // Agora a tela SÓ remove o item se o banco confirmou que deu certo!
        if (res.ok) {
          setProjetos(projetos.filter((p) => p.id !== id));
        } else {
          alert('Erro do Servidor: O banco recusou a exclusão.');
        }
      } catch (error) {
        alert('Erro de conexão ao tentar excluir.');
      }
    }
  };

  const abrirModalEditar = (projeto: any) => {
    setProjetoEditando({ ...projeto });
    setIsModalOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projetos/${projetoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projetoEditando),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProjetos();
      } else {
        alert('Erro ao atualizar no servidor.');
      }
    } catch (error) {
      alert('Erro ao salvar as edições.');
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 font-sans">
      <aside className="flex hidden w-64 flex-col bg-slate-900 text-slate-300 md:flex">
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
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Projetos</h1>
          <Link
            href="/projetos/novo"
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Plus className="h-5 w-5" /> Novo Projeto
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6 flex">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border border-slate-300 py-2 pr-3 pl-10 text-sm outline-none focus:border-orange-600 focus:ring-orange-600"
                placeholder="Buscar projeto..."
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Projeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Madeira
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {carregando ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                      Carregando projetos...
                    </td>
                  </tr>
                ) : projetos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                      Nenhum projeto cadastrado.
                    </td>
                  </tr>
                ) : (
                  projetos.map((projeto) => (
                    <tr key={projeto.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-slate-900">
                        {projeto.codigo}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-700">
                        {projeto.nome}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            projeto.status === 'ABERTO'
                              ? 'bg-blue-100 text-blue-700'
                              : projeto.status === 'EM_ANDAMENTO'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {projeto.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                        {projeto.qtdeMadeira} m²
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => abrirModalEditar(projeto)}
                          className="mr-4 text-slate-400 transition-colors hover:text-orange-600"
                          title="Editar"
                        >
                          <Pencil className="inline h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(projeto.id)}
                          className="text-slate-400 transition-colors hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="inline h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Edição Sobreposto */}
      {isModalOpen && projetoEditando && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-800">Editar Projeto</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-slate-100 p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={projetoEditando.codigo}
                    onChange={(e) =>
                      setProjetoEditando({
                        ...projetoEditando,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Status
                  </label>
                  <select
                    value={projetoEditando.status}
                    onChange={(e) =>
                      setProjetoEditando({ ...projetoEditando, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    required
                    value={projetoEditando.nome}
                    onChange={(e) =>
                      setProjetoEditando({ ...projetoEditando, nome: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-800">
                    Qtd. de Madeira (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={projetoEditando.qtdeMadeira}
                    onChange={(e) =>
                      setProjetoEditando({
                        ...projetoEditando,
                        qtdeMadeira: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-5 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-orange-700"
                >
                  <Save className="h-4 w-4" /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
