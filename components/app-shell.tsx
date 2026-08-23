import type { ReactNode } from 'react';
import { AppFooter } from '@/components/app-footer';
import { AppSidebar, type NavKey } from '@/components/app-sidebar';

type AppShellProps = {
  active: NavKey;
  header: ReactNode;
  children: ReactNode;
};

export function AppShell({ active, header, children }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc]">
      <div className="flex min-h-0 flex-1">
        <AppSidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          {header}
          <div className="flex-1 overflow-auto bg-white p-8">{children}</div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
