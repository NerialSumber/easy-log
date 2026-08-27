'use client';

import Link from 'next/link';
import {
  FolderKanban,
  LayoutDashboard,
  Package,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { useCurrentUser } from '@/lib/current-user';

export type NavKey = 'dashboard' | 'projetos' | 'estoque' | 'fornecedores';

const NAV_ITEMS: { key: NavKey; href: string; label: string; icon: LucideIcon }[] = [
  { key: 'dashboard', href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projetos', href: '/projetos', label: 'Projetos', icon: FolderKanban },
  { key: 'estoque', href: '#', label: 'Estoque', icon: Package },
  { key: 'fornecedores', href: '/fornecedores', label: 'Fornecedores', icon: Truck },
];

export function AppSidebar({ active }: { active: NavKey }) {
  const userData = useCurrentUser();

  return (
    <aside className="hidden w-64 shrink-0 flex-col self-stretch bg-white md:flex">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-5">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ea580c] text-xl font-bold text-white">
          {userData.iniciais}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm leading-[18px] font-medium text-slate-800">
            {userData.nome}
          </span>
          <span className="text-xs leading-4 text-[#94a3b8]">{userData.role}</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-7">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-2.5 rounded-lg border-l-4 border-[#ea580c] bg-[#1e293b] py-8 pr-4 pl-3 text-lg leading-6 font-medium text-white'
                  : 'flex items-center gap-2.5 rounded-lg px-4 py-8 text-lg leading-6 text-[#94a3b8] transition-colors hover:bg-slate-50'
              }
            >
              <Icon
                className={`size-5 shrink-0 ${isActive ? 'text-[#ea580c]' : 'text-[#94a3b8]'}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
