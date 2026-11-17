"use client";
// Carrossel horizontal: arrasta com o dedo, setas no computador e avança sozinho (pausa quando a pessoa interage).
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { IconeChevron } from "./Icones";

export function Carrossel({ children, rotulo, intervalo = 5000, larguraItem = "min(85%,380px)" }: {
  children: React.ReactNode; rotulo: string; intervalo?: number; larguraItem?: string;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  const [pausado, setPausado] = useState(false);
  const [ini, setIni] = useState(true);
  const itens = Children.toArray(children);

  const atualizar = useCallback(() => {
    const t = trilho.current; if (!t) return;
    setIni(t.scrollLeft < 8);
  }, []);

  const mover = useCallback((dir: number) => {
    const t = trilho.current; if (!t) return;
    const passo = (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? t.clientWidth;
    if (dir > 0 && t.scrollLeft + t.clientWidth >= t.scrollWidth - 8) t.scrollTo({ left: 0, behavior: "smooth" });
    else t.scrollBy({ left: dir * (passo + 24), behavior: "smooth" });
  }, []);

  useEffect(() => {
    atualizar();
    if (pausado || itens.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => mover(1), intervalo);
    return () => clearInterval(id);
  }, [pausado, mover, intervalo, itens.length, atualizar]);

  const seta = "absolute top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-papel text-tinta shadow-[0_10px_30px_-10px_rgba(4,34,43,0.5)] transition hover:bg-tinta hover:text-white disabled:pointer-events-none disabled:opacity-0 md:grid";

  return (
    <div className="relative" aria-roledescription="carrossel" aria-label={rotulo}
      onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onTouchStart={() => setPausado(true)} onFocusCapture={() => setPausado(true)}>
      <div ref={trilho} onScroll={atualizar}
        className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {itens.map((c, k) => (
          <div key={k} className="shrink-0 snap-start" style={{ width: larguraItem }}>{c}</div>
        ))}
      </div>
      <button type="button" onClick={() => mover(-1)} disabled={ini} aria-label="Anterior" className={`${seta} -left-5`}><IconeChevron className="rotate-180" width={20} height={20} /></button>
      <button type="button" onClick={() => mover(1)} aria-label="Próximo" className={`${seta} -right-5`}><IconeChevron width={20} height={20} /></button>
    </div>
  );
}
