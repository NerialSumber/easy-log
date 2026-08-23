import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-8 py-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl leading-8 font-bold text-[#1e293b]">{title}</h1>
        {subtitle ? <p className="text-sm leading-5 text-[#64748b]">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
