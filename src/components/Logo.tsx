export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`flex items-center gap-3 ${claro ? "text-white" : "text-tinta"}`}>
      <span className="font-display text-[2rem] leading-none italic tracking-tight">GG</span>
      <span className={`h-8 w-px ${claro ? "bg-white/40" : "bg-tinta/25"}`} aria-hidden="true" />
      <span className="rotulo leading-[1.25] !text-[0.66rem] !tracking-[0.22em]">
        Imóveis
        <br />
        Litoral
      </span>
    </span>
  );
}
