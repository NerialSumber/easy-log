import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  titulo: string;
  subtitulo?: string;
  largura?: string;
  onFechar: () => void;
  children: ReactNode;
};

export function Modal({
  titulo,
  subtitulo,
  largura = 'max-w-lg',
  onFechar,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-surface border-line flex max-h-[calc(100dvh-1.5rem)] w-full ${largura} flex-col overflow-hidden rounded-xl border`}
      >
        <div className="border-line flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-ink text-lg font-bold sm:text-xl">{titulo}</h2>
            {subtitulo ? <p className="text-muted text-sm">{subtitulo}</p> : null}
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-muted hover:bg-soft shrink-0 rounded-lg p-2"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function RodapeModal({ children }: { children: ReactNode }) {
  return (
    <div className="border-line bg-soft flex flex-wrap items-center justify-end gap-3 border-t px-4 py-4 sm:px-6">
      {children}
    </div>
  );
}
