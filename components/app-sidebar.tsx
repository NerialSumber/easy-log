'use client';

import Link from 'next/link';
import {
  FolderKanban,
  LayoutDashboard,
  Package,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { UserSettings } from '@/components/user-settings';
import { useCurrentUser } from '@/lib/current-user';
import { pode } from '@/lib/permissoes';

export type NavKey = 'dashboard' | 'projetos' | 'estoque' | 'fornecedores' | 'usuarios';

const NAV_ITEMS: { key: NavKey; href: string; label: string; icon: LucideIcon }[] = [
  { key: 'dashboard', href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projetos', href: '/projetos', label: 'Projetos', icon: FolderKanban },
  { key: 'estoque', href: '/estoque', label: 'Estoque', icon: Package },
  { key: 'fornecedores', href: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { key: 'usuarios', href: '/usuarios', label: 'Usuários', icon: Users },
];

export function AppSidebar({ active }: { active: NavKey }) {
  const userData = useCurrentUser();

  return (
    <aside className="border-line bg-surface hidden w-64 shrink-0 flex-col self-stretch border-r md:flex">
      <div className="border-line flex items-center gap-3 border-b px-5 py-5">
        <div className="bg-ink text-canvas flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium">
          {userData.iniciais}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-ink truncate text-sm font-medium">{userData.nome}</span>
          <span className="text-faint text-xs">{userData.roleLabel}</span>
        </div>
        <UserSettings />
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-7">
        {NAV_ITEMS.filter((item) => pode(userData.role, item.key)).map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={
                isActive
                  ? 'border-accent text-ink flex items-center gap-2.5 border-l-4 py-8 pr-4 pl-3 text-lg leading-6 font-medium'
                  : 'text-muted hover:text-ink flex items-center gap-2.5 px-4 py-8 text-lg leading-6 transition-colors'
              }
            >
              <Icon
                className={`size-5 shrink-0 ${isActive ? 'text-accent' : 'text-faint'}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
