import type { ReactNode } from 'react';
import { AppFooter } from '@/components/app-footer';
import { AppSidebar, type NavKey } from '@/components/app-sidebar';

type AppShellProps = {
  active: NavKey;
  header: ReactNode;
  children: ReactNode;
  canvas?: boolean;
};

export function AppShell({ active, header, children, canvas = false }: AppShellProps) {
  return (
    <div className="bg-canvas relative flex min-h-screen flex-col">
      <div className="flex min-h-0 flex-1">
        <AppSidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          {header}
          <div
            className={`flex-1 overflow-auto p-8 ${canvas ? 'bg-canvas' : 'bg-surface'}`}
          >
            {children}
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
