type BarraProgressoProps = {
  percentual: number;
  alerta?: boolean;
  className?: string;
};

export function BarraProgresso({
  percentual,
  alerta = false,
  className = '',
}: BarraProgressoProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percentual)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`bg-line h-1.5 overflow-hidden rounded-full ${className}`}
    >
      <div
        className={`h-full rounded-full ${alerta ? 'bg-accent-fill' : 'bg-ink'}`}
        style={{ width: `${Math.min(percentual, 100)}%` }}
      />
    </div>
  );
}
