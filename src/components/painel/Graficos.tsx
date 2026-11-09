// Gráficos do painel em SVG puro (sem biblioteca, sem custo). Passe o mouse para ver os números.
// Paleta categórica validada (ordem fixa); "Outros" sempre em cinza.
export const PALETA = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
export const CINZA = "#a3adb2";
// A cor acompanha a origem (não a posição), para não mudar de cor quando o período muda.
export const COR_ORIGEM: Record<string, string> = {
  Google: PALETA[0], Instagram: PALETA[1], WhatsApp: PALETA[2], Direto: PALETA[3], "QR code": PALETA[4], Facebook: PALETA[5],
};

export type Fatia = { k: string; n: number };
const fmt = (n: number) => n.toLocaleString("pt-BR");
const pct = (n: number, t: number) => (t ? `${Math.round((n / t) * 100)}%` : "0%");

// Junta o que passar de 6 fatias em "Outros".
export function agrupar(dados: Fatia[], max = 6, fixas?: string[]): Fatia[] {
  const principais = fixas ? dados.filter((d) => fixas.includes(d.k)) : dados.slice(0, max);
  const resto = dados.filter((d) => !principais.includes(d));
  const outros = resto.reduce((s, d) => s + d.n, 0);
  return outros ? [...principais, { k: "Outros", n: outros }] : principais;
}

export function Pizza({ titulo, dados, cores, vazio = "Ainda sem visitas neste período." }: {
  titulo: string; dados: Fatia[]; cores?: Record<string, string>; vazio?: string;
}) {
  const total = dados.reduce((s, d) => s + d.n, 0);
  const cor = (d: Fatia, i: number) => (d.k === "Outros" ? CINZA : cores?.[d.k] ?? PALETA[i % PALETA.length]);
  const R = 80, r = 50, C = 90;
  const inicios = dados.map((_, i) => -Math.PI / 2 + (dados.slice(0, i).reduce((s, d) => s + d.n, 0) / total) * Math.PI * 2);
  const arcos = dados.map((d, i) => {
    const a = (d.n / total) * Math.PI * 2;
    const a0 = inicios[i], a1 = a0 + a;
    const p = (rad: number, raio: number) => `${C + raio * Math.cos(rad)} ${C + raio * Math.sin(rad)}`;
    const grande = a > Math.PI ? 1 : 0;
    const caminho = a >= Math.PI * 2 - 1e-6
      ? `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} L ${C - 0.01} ${C - r} A ${r} ${r} 0 1 0 ${C} ${C - r} Z`
      : `M ${p(a0, R)} A ${R} ${R} 0 ${grande} 1 ${p(a1, R)} L ${p(a1, r)} A ${r} ${r} 0 ${grande} 0 ${p(a0, r)} Z`;
    return { d, i, caminho };
  });
  return (
    <section className="rounded-lg border border-linha bg-papel p-5">
      <h2 className="text-sm font-semibold">{titulo}</h2>
      {total === 0 ? <p className="mt-6 text-sm text-cinza">{vazio}</p> : (
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0" role="img" aria-label={titulo}>
            {arcos.map(({ d, i, caminho }) => (
              <path key={d.k} d={caminho} fill={cor(d, i)} stroke="#f8fafb" strokeWidth="2" className="transition-opacity hover:opacity-80">
                <title>{`${d.k}: ${fmt(d.n)} (${pct(d.n, total)})`}</title>
              </path>
            ))}
            <text x={C} y={C - 2} textAnchor="middle" className="fill-tinta text-[22px] font-semibold">{fmt(total)}</text>
            <text x={C} y={C + 16} textAnchor="middle" className="fill-cinza text-[10px]">total</text>
          </svg>
          <ul className="w-full space-y-1.5 text-sm">
            {dados.map((d, i) => (
              <li key={d.k} className="flex items-center gap-2" title={`${d.k}: ${fmt(d.n)}`}>
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: cor(d, i) }} />
                <span className="flex-1 truncate">{d.k}</span>
                <span className="tabular-nums text-cinza">{fmt(d.n)}</span>
                <span className="w-10 text-right font-medium tabular-nums">{pct(d.n, total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// Barras verticais de uma série só (visitas por dia ou por hora).
export function Barras({ titulo, dados, rotuloCada = 1 }: { titulo: string; dados: Fatia[]; rotuloCada?: number }) {
  const max = Math.max(1, ...dados.map((d) => d.n));
  const W = 640, H = 170, base = 140, larg = W / Math.max(1, dados.length);
  return (
    <section className="rounded-lg border border-linha bg-papel p-5">
      <h2 className="text-sm font-semibold">{titulo}</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={titulo}>
        {[0.5, 1].map((f) => <line key={f} x1="0" x2={W} y1={base - (base - 10) * f} y2={base - (base - 10) * f} stroke="#d6e0e6" strokeWidth="1" strokeDasharray="3 4" />)}
        <line x1="0" x2={W} y1={base} y2={base} stroke="#56666d" strokeWidth="1" />
        {dados.map((d, i) => {
          const h = ((base - 10) * d.n) / max;
          const x = i * larg + larg * 0.15, w = larg * 0.7;
          return (
            <g key={d.k}>
              <rect x={i * larg} y={0} width={larg} height={base} fill="transparent"><title>{`${d.k}: ${fmt(d.n)}`}</title></rect>
              {d.n > 0 && <path d={`M ${x} ${base} V ${base - h + Math.min(4, h)} Q ${x} ${base - h} ${x + Math.min(4, w / 2)} ${base - h} H ${x + w - Math.min(4, w / 2)} Q ${x + w} ${base - h} ${x + w} ${base - h + Math.min(4, h)} V ${base} Z`} fill="#0d4c8f" pointerEvents="none" />}
              {i % rotuloCada === 0 && <text x={i * larg + larg / 2} y={H - 8} textAnchor="middle" className="fill-cinza text-[11px]">{d.k}</text>}
            </g>
          );
        })}
        <text x="4" y="20" className="fill-cinza text-[11px]">máx. {fmt(max)}</text>
      </svg>
    </section>
  );
}

export function Numero({ rotulo, valor, sub }: { rotulo: string; valor: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-linha bg-papel p-4">
      <p className="text-xs text-cinza">{rotulo}</p>
      <p className="mt-1 font-display text-3xl tabular-nums">{valor}</p>
      {sub && <p className="mt-0.5 text-xs text-cinza">{sub}</p>}
    </div>
  );
}
