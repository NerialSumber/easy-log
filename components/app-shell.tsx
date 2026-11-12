import type { ReactNode } from 'react';
import { AppFooter } from '@/components/app-footer';
import { AppSidebar, type NavKey } from '@/components/app-sidebar';
import { MenuMobile } from '@/components/menu-mobile';

type AppShellProps = {
  active: NavKey;
  header: ReactNode;
  children: ReactNode;
  canvas?: boolean;
};

export function AppShell({ active, header, children, canvas = false }: AppShellProps) {
  return (
    <div className="bg-canvas flex min-h-dvh flex-col">
      <div className="flex flex-1">
        <AppSidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MenuMobile active={active} />
          {header}
          <main
            className={`min-w-0 flex-1 p-4 sm:p-6 lg:p-8 ${canvas ? 'bg-canvas' : 'bg-surface'}`}
          >
            {children}
          </main>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
