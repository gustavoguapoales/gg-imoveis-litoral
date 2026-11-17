"use client";
// Faz o bloco aparecer suavemente quando entra na tela (ao rolar a página).
import { useEffect, useRef, useState } from "react";

export function Revelar({ children, atraso = 0, className = "" }: { children: React.ReactNode; atraso?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisivel(true); obs.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${atraso}ms` }}
      className={`transition duration-700 ease-out motion-reduce:transition-none ${visivel ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}
