import type { ReactNode } from 'react';

export const classeCampo =
  'border-line bg-soft text-ink placeholder:text-faint focus:bg-surface focus:ring-accent w-full rounded-lg border px-4 py-3 text-sm font-normal outline-none focus:ring-2 disabled:opacity-60';

export const classeBotao =
  'bg-accent-fill text-on-accent flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60';

export const classeBotaoSecundario =
  'text-muted hover:bg-soft rounded-lg px-4 py-2.5 text-sm font-semibold';

export const classeBotaoPerigo =
  'border-danger text-danger hover:bg-danger-soft flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold';

export function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-ink text-sm font-bold">{rotulo}</span>
      {children}
    </label>
  );
}
