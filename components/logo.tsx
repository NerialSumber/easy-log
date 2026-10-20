export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true" className={className}>
      <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="1.75" />
      <circle
        cx="36"
        cy="37.5"
        r="23"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.72"
      />
      <circle
        cx="36"
        cy="38.5"
        r="13"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.42"
      />
      <circle cx="36" cy="39.5" r="3.25" fill="#9f1b1b" />
    </svg>
  );
}
