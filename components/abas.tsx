type Aba<T extends string> = { id: T; titulo: string; descricao: string };

type AbasProps<T extends string> = {
  abas: Aba<T>[];
  ativa: T;
  rotulo: string;
  onTrocar: (id: T) => void;
};

export function Abas<T extends string>({ abas, ativa, rotulo, onTrocar }: AbasProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={rotulo}
      className={`grid grid-cols-1 gap-3 ${abas.length > 2 ? 'md:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onTrocar(aba.id)}
            className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
              selecionada
                ? 'border-accent bg-soft'
                : 'border-line bg-surface hover:border-accent'
            }`}
          >
            <span
              className={`text-base font-bold ${selecionada ? 'text-accent' : 'text-ink'}`}
            >
              {aba.titulo}
            </span>
            <span className="text-muted text-xs">{aba.descricao}</span>
          </button>
        );
      })}
    </div>
  );
}
