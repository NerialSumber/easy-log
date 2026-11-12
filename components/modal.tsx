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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-surface border-line flex max-h-[90vh] w-full ${largura} flex-col overflow-hidden rounded-xl border`}
      >
        <div className="border-line flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-ink text-xl font-bold">{titulo}</h2>
            {subtitulo ? <p className="text-muted text-sm">{subtitulo}</p> : null}
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-muted hover:bg-soft rounded-lg p-2"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
}

export function RodapeModal({ children }: { children: ReactNode }) {
  return (
    <div className="border-line bg-soft flex justify-end gap-3 border-t px-6 py-4">
      {children}
    </div>
  );
}
