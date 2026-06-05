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
  LogOut,
  AlertCircle,
  Clock,
} from 'lucide-react';

type UserDataType = {
  nome: string;
  role: string;
  iniciais: string;
};

export default function Dashboard() {
  const [userData, setUserData] = useState<UserDataType>({
    nome: 'Carregando...',
    role: 'Aguarde',
    iniciais: '--',
  });

  useEffect(() => {
    const carregarUsuario = async () => {
      const storedUser = localStorage.getItem('current_user');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const nomeCompleto = parsedUser.nome || 'Usuário';

        const partesNome = nomeCompleto.trim().split(' ');
        let iniciais = 'US';
        if (partesNome.length >= 2) {
          iniciais = (
            partesNome[0][0] + partesNome[partesNome.length - 1][0]
          ).toUpperCase();
        } else if (partesNome[0].length >= 2) {
          iniciais = partesNome[0].substring(0, 2).toUpperCase();
        } else {
          iniciais = partesNome[0].toUpperCase();
        }

        setUserData({
          nome: nomeCompleto,
          role: parsedUser.role || 'Administrador',
          iniciais: iniciais,
        });
      } else {
        window.location.href = '/login';
      }
    };

    carregarUsuario();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
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
            className="flex items-center gap-3 rounded-lg border-l-4 border-orange-600 bg-slate-800 px-4 py-3 text-white"
          >
            <LayoutDashboard className="h-5 w-5 text-orange-500" /> Dashboard
          </Link>

          <Link
            href="/projetos"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <FolderKanban className="h-5 w-5" /> Projetos
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

        {/* Rodapé do Sidebar */}
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
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-500"
              title="Sair do sistema"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Dashboard */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Área de Cards */}
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card: Projetos Ativos */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-lg bg-orange-100 p-3">
                <FolderKanban className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Projetos em Andamento
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-800">0</h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600"></p>
              </div>
            </div>

            {/* Card: Alertas de Estoque */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-lg bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Alertas de Estoque</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-800">0</h3>
                <p className="mt-2 text-xs text-red-600"> </p>
              </div>
            </div>

            {/* Card: Prazos Próximos */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-lg bg-blue-100 p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Entregas Próximas</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-800">0</h3>
                <p className="mt-2 text-xs text-slate-500"> </p>
              </div>
            </div>
          </div>

          {/* tabelas ou gráficos */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Atividades Recentes</h2>
            <div className="py-10 text-center text-slate-500">
              <p>Os gráficos e listagens recentes aparecerão aqui.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
