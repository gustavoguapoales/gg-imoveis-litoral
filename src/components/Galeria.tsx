"use client";

import { useCallback, useEffect, useState } from "react";
import { IconeChevron, IconeFechar } from "./Icones";

export function Galeria({ imagens, titulo }: { imagens: string[]; titulo: string }) {
  const [atual, setAtual] = useState(0);
  const [tela, setTela] = useState(false);
  const total = imagens.length;
  const ir = useCallback((d: number) => setAtual((a) => (a + d + total) % total), [total]);

  useEffect(() => {
    if (!tela) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTela(false);
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [tela, ir]);

  return (
    <div>
      <div className="grid gap-2 md:grid-cols-[2fr_1fr] md:grid-rows-2">
        <button type="button" onClick={() => setTela(true)} className="relative aspect-[16/10] overflow-hidden bg-nevoa md:row-span-2 md:aspect-auto md:h-full" aria-label="Ampliar foto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagens[atual]} alt={`${titulo}, foto ${atual + 1} de ${total}`} className="h-full w-full object-cover" />
          <span className="rotulo absolute bottom-3 left-3 rounded-sm bg-tinta/70 px-2.5 py-1 !text-[0.65rem] text-white">
            {atual + 1} / {total} · Imagem ilustrativa
          </span>
        </button>
        {imagens.slice(1, 3).map((src, k) => (
          <button key={src} type="button" onClick={() => { setAtual(k + 1); setTela(true); }} className={`relative hidden overflow-hidden bg-nevoa md:block ${total === 2 ? "md:row-span-2" : "aspect-[16/10]"}`} aria-label={`Ver foto ${k + 2}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
            {k === 1 && total > 3 && (
              <span className="absolute inset-0 grid place-items-center bg-tinta/45 text-sm font-medium text-white">+{total - 3} fotos</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto md:hidden">
        {imagens.map((src, k) => (
          <button key={src} type="button" onClick={() => setAtual(k)} className={`h-16 w-24 shrink-0 overflow-hidden ${k === atual ? "ring-2 ring-latao" : "opacity-70"}`} aria-label={`Foto ${k + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {tela && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#071419]/96" role="dialog" aria-modal="true" aria-label="Galeria de fotos">
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <span className="rotulo">{atual + 1} / {total}</span>
            <button type="button" onClick={() => setTela(false)} className="grid h-11 w-11 place-items-center" aria-label="Fechar galeria">
              <IconeFechar width={26} height={26} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagens[atual]} alt={`${titulo}, foto ${atual + 1}`} className="max-h-full max-w-full object-contain" />
            <button type="button" onClick={() => ir(-1)} className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Foto anterior">
              <IconeChevron className="rotate-180" width={22} height={22} />
            </button>
            <button type="button" onClick={() => ir(1)} className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Próxima foto">
              <IconeChevron width={22} height={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
