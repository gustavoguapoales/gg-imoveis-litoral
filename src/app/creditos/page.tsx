import type { Metadata } from "next";
import { CREDITOS } from "@/data/creditos";

export const metadata: Metadata = {
  title: "Créditos das fotos",
  description: "Autoria e licença das fotos das cidades usadas no site da GG Imóveis Litoral.",
  alternates: { canonical: "/creditos/" },
};

export default function PaginaCreditos() {
  return (
    <div className="container-site pb-24 pt-32 md:pt-40">
      <p className="rotulo text-latao-escuro">Fotos das cidades</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Créditos das fotos</h1>
      <p className="mt-4 max-w-2xl text-cinza">
        As fotos das cidades são reais e vêm do Wikimedia Commons, com licença livre. Agradecemos aos fotógrafos.
        Fotos dos imóveis são do próprio anunciante.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CREDITOS.map((c) => (
          <li key={c.arquivo} className="overflow-hidden rounded-sm border border-linha bg-papel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/cidades/${c.arquivo}.jpg`} alt={c.legenda} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="p-4 text-sm">
              <p className="font-medium">{c.legenda}</p>
              <p className="mt-1 text-cinza">Foto: {c.autor || "autor no Wikimedia Commons"} · {c.licenca}{c.alterada ? " · recortada" : ""}</p>
              {c.fonte && <a href={c.fonte} target="_blank" rel="noopener" className="mt-1 inline-block text-mar underline">Ver original</a>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
