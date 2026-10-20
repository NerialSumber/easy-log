import type { ReactNode } from 'react';
import { UserSettings } from '@/components/user-settings';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="border-line bg-surface flex items-center justify-between border-b px-8 py-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-ink text-2xl font-medium tracking-tight">{title}</h1>
        {subtitle ? <p className="text-muted text-sm">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <UserSettings className="md:hidden" />
      </div>
    </header>
  );
}
